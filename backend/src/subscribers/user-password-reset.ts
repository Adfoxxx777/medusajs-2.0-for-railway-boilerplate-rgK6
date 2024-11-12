import { INotificationModuleService } from '@medusajs/types'
import { Modules } from '@medusajs/utils'
import { SubscriberConfig, SubscriberArgs } from '@medusajs/medusa'
import { BACKEND_URL } from '../lib/constants'
import { EmailTemplates } from '../modules/email-notifications/templates'

type ResetPasswordData = {
  entity_id: string
  token: string
  actorType: string
}

export default async function userPasswordResetHandler({
  event,
  container,
}: SubscriberArgs<ResetPasswordData>) {
  console.log('[PasswordReset] Event handler called with data:', {
    entityId: event.data.entity_id,
    hasToken: Boolean(event.data.token),
    actorType: event.data.actorType
  })

  const email = event.data.entity_id
  if (!email) {
    console.error('[PasswordReset] No email (entity_id) provided in event data')
    return
  }

  try {
    console.log('[PasswordReset] Resolving notification service')
    const notificationModuleService: INotificationModuleService = container.resolve(
      Modules.NOTIFICATION
    )

    if (!notificationModuleService) {
      console.error('[PasswordReset] Notification module service not resolved')
      return
    }

    console.log('[PasswordReset] Notification service resolved successfully')
    
    console.log('[PasswordReset] Preparing reset email:', {
      email,
      hasToken: Boolean(event.data.token),
      backendUrl: BACKEND_URL
    })
    
    const resetLink = `${BACKEND_URL}/app/reset-password?token=${event.data.token}`
    console.log('[PasswordReset] Reset link generated:', resetLink)

    const notificationData = {
      to: email,
      channel: 'email',
      template: EmailTemplates.PASSWORD_RESET,
      data: {
        emailOptions: {
          subject: 'Reset Your Password',
          replyTo: process.env.SENDPULSE_FROM_EMAIL,
        },
        resetLink,
        email,
        preview: 'Reset your password request'
      }
    }

    console.log('[PasswordReset] Creating notification with data:', {
      to: notificationData.to,
      template: notificationData.template,
      hasEmailOptions: Boolean(notificationData.data.emailOptions)
    })

    await notificationModuleService.createNotifications(notificationData)
      .then(() => {
        console.log('[PasswordReset] Notification created successfully')
      })
      .catch(error => {
        console.error('[PasswordReset] Error creating notification:', {
          error: error.message,
          stack: error.stack
        })
        throw error
      })

  } catch (error) {
    console.error('[PasswordReset] Error in handler:', {
      error: error.message,
      stack: error.stack,
      email
    })
    throw error
  }
}

export const config: SubscriberConfig = {
  event: 'auth.password_reset',
  context: {
    subscriberId: 'password-reset-handler'
  }
}
