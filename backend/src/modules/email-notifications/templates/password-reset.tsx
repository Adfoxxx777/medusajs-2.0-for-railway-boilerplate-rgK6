import { ReactNode } from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'

export const PASSWORD_RESET = 'password-reset'

export interface PasswordResetTemplateData {
  resetLink: string
  email: string
  emailOptions: {
    subject: string
    replyTo?: string
  }
  preview?: string
}

export function isPasswordResetTemplateData(data: unknown): data is PasswordResetTemplateData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'resetLink' in data &&
    'email' in data &&
    'emailOptions' in data &&
    typeof (data as PasswordResetTemplateData).resetLink === 'string' &&
    typeof (data as PasswordResetTemplateData).email === 'string'
  )
}

export function PasswordResetTemplate({
  resetLink,
  email,
  preview = "Reset your password",
}: PasswordResetTemplateData): ReactNode {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={paragraph}>Hi {email},</Text>
            <Text style={paragraph}>
              We received a request to reset your password. Click the button below
              to choose a new password:
            </Text>
            <Button style={button} href={resetLink}>
              Reset Password
            </Button>
            <Text style={paragraph}>
              If you didn't request this change, you can safely ignore this email.
            </Text>
            <Hr style={hr} />
            <Text style={footer}>
              This email was sent from your Medusa store.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const box = {
  padding: '0 48px',
}

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
}

const button = {
  backgroundColor: '#000000',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
  marginTop: '25px',
  marginBottom: '25px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
}
