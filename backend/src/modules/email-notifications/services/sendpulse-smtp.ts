import { Logger, NotificationTypes } from '@medusajs/types'
import { AbstractNotificationProviderService, MedusaError } from '@medusajs/utils'
import * as nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import { ReactElement } from 'react'
import { generateEmailTemplate } from '../templates'

type InjectedDependencies = {
  logger: Logger
}

interface SendPulseConfig {
  host: string
  port: number
  user: string
  password: string
  from: string
}

export interface SendPulseOptions {
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_password: string
  from_email: string
}

interface EmailOptions {
  subject?: string
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string
}

export class SendPulseNotificationService extends AbstractNotificationProviderService {
  static identifier = "SENDPULSE_NOTIFICATION_SERVICE"
  protected config_: SendPulseConfig
  protected logger_: Logger
  protected transporter: nodemailer.Transporter

  constructor({ logger }: InjectedDependencies, options: SendPulseOptions) {
    super()

    console.log('[SendPulse] Service constructor called with options:', {
      host: options.smtp_host,
      port: options.smtp_port,
      user: options.smtp_user,
      from: options.from_email
    })

    this.config_ = {
      host: options.smtp_host,
      port: options.smtp_port,
      user: options.smtp_user,
      password: options.smtp_password,
      from: options.from_email
    }
    this.logger_ = logger
    
    console.log(`[SendPulse] Initializing SMTP with config:`, {
      host: this.config_.host,
      port: this.config_.port,
      user: this.config_.user,
      from: this.config_.from
    })
    
    try {
      this.transporter = nodemailer.createTransport({
        host: this.config_.host,
        port: this.config_.port,
        secure: false,
        auth: {
          user: this.config_.user,
          pass: this.config_.password
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false
        },
        debug: true,
        logger: true
      })

      console.log('[SendPulse] SMTP transporter created successfully')

      // Проверяем подключение при инициализации
      this.transporter.verify((error) => {
        if (error) {
          console.error(`[SendPulse] SMTP verification failed:`, {
            error: error.message,
            stack: error.stack,
            config: {
              host: this.config_.host,
              port: this.config_.port,
              user: this.config_.user
            }
          })
        } else {
          console.log('[SendPulse] SMTP connection verified successfully')
        }
      })
    } catch (error) {
      console.error('[SendPulse] Error creating SMTP transporter:', {
        error: error.message,
        stack: error.stack,
        config: {
          host: this.config_.host,
          port: this.config_.port,
          user: this.config_.user
        }
      })
      throw error
    }
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    console.log('[SendPulse] Send method called with notification:', {
      to: notification.to,
      template: notification.template,
      channel: notification.channel
    })

    if (!notification) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `No notification information provided`)
    }
    if (notification.channel === 'sms') {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `SMS notification not supported`)
    }

    console.log(`[SendPulse] Preparing to send "${notification.template}" email:`, {
      to: notification.to,
      from: notification.from || this.config_.from,
      template: notification.template
    })

    let emailContent: string
    try {
      const reactContent = generateEmailTemplate(notification.template, notification.data) as ReactElement
      emailContent = await Promise.resolve(render(reactContent))
      console.log('[SendPulse] Email content generated successfully')
    } catch (error) {
      console.error(`[SendPulse] Error generating email content:`, {
        error: error.message,
        stack: error.stack,
        template: notification.template,
        data: notification.data
      })
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to generate email content for template: ${notification.template}`
      )
    }

    const emailOptions = notification.data.emailOptions as EmailOptions || {}

    const message = {
      from: notification.from?.trim() ?? this.config_.from,
      to: notification.to,
      subject: emailOptions.subject ?? 'You have a new notification',
      html: emailContent,
      cc: emailOptions.cc,
      bcc: emailOptions.bcc,
      replyTo: emailOptions.replyTo,
      attachments: Array.isArray(notification.attachments)
        ? notification.attachments.map((attachment) => ({
            content: attachment.content,
            filename: attachment.filename,
            contentType: attachment.content_type,
            disposition: attachment.disposition ?? 'attachment',
            cid: attachment.id
          }))
        : undefined
    }

    console.log(`[SendPulse] Sending email:`, {
      to: message.to,
      subject: message.subject,
      from: message.from
    })

    try {
      const result = await this.transporter.sendMail(message)
      console.log(
        `[SendPulse] Email sent successfully:`,
        {
          messageId: result.messageId,
          response: result.response,
          template: notification.template,
          to: notification.to
        }
      )
      return {}
    } catch (error) {
      console.error(`[SendPulse] Failed to send email:`, {
        error: error.message,
        stack: error.stack,
        template: notification.template,
        to: notification.to,
        config: {
          host: this.config_.host,
          port: this.config_.port,
          user: this.config_.user
        }
      })
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to send "${notification.template}" email to ${notification.to} via SendPulse SMTP: ${error.message}`
      )
    }
  }
}
