import { ReactNode } from 'react'
import { MedusaError } from '@medusajs/utils'
import { InviteUserEmail, INVITE_USER, isInviteUserData } from './invite-user'
import { OrderPlacedTemplate, ORDER_PLACED, isOrderPlacedTemplateData } from './order-placed'
import { PasswordResetTemplate, PASSWORD_RESET, isPasswordResetTemplateData, PasswordResetTemplateData } from './password-reset'

export const EmailTemplates = {
  INVITE_USER,
  ORDER_PLACED,
  PASSWORD_RESET
} as const

export type EmailTemplateType = keyof typeof EmailTemplates

export function generateEmailTemplate(templateKey: string, data: unknown): ReactNode {
  console.log('Generating email template:', {
    templateKey,
    receivedData: typeof data === 'object' ? data : 'non-object data'
  })

  switch (templateKey) {
    case EmailTemplates.INVITE_USER:
      if (!isInviteUserData(data)) {
        console.error('Invalid invite user data:', typeof data)
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.INVITE_USER}"`
        )
      }
      console.log('Rendering invite user template')
      return <InviteUserEmail {...data} />

    case EmailTemplates.ORDER_PLACED:
      if (!isOrderPlacedTemplateData(data)) {
        console.error('Invalid order placed data:', typeof data)
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.ORDER_PLACED}"`
        )
      }
      console.log('Rendering order placed template')
      return <OrderPlacedTemplate {...data} />

    case EmailTemplates.PASSWORD_RESET:
      console.log('Validating password reset template data')
      if (!isPasswordResetTemplateData(data)) {
        console.error('Invalid password reset data:', {
          dataType: typeof data,
          hasRequiredFields: typeof data === 'object' && data !== null ? {
            hasResetLink: 'resetLink' in (data as object),
            hasEmail: 'email' in (data as object),
            hasEmailOptions: 'emailOptions' in (data as object)
          } : 'not an object'
        })
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.PASSWORD_RESET}"`
        )
      }
      const typedData = data as PasswordResetTemplateData
      console.log('Rendering password reset template with data:', {
        hasResetLink: Boolean(typedData.resetLink),
        hasEmail: Boolean(typedData.email),
        hasPreview: Boolean(typedData.preview)
      })
      return <PasswordResetTemplate {...typedData} />

    default:
      console.error('Unknown template key:', templateKey)
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown template key: "${templateKey}"`
      )
  }
}

export { InviteUserEmail, OrderPlacedTemplate, PasswordResetTemplate }
