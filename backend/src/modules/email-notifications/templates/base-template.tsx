import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface BaseTemplateProps {
  previewText?: string;
  title?: string;
  content: React.ReactNode;
  footerContent?: React.ReactNode;
}

export const BaseTemplate: React.FC<BaseTemplateProps> = ({
  previewText = "Medusa Store Notification",
  title,
  content,
  footerContent,
}) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {title && (
            <>
              <Heading style={header}>{title}</Heading>
              <Hr style={hr} />
            </>
          )}
          
          <Section style={section}>
            {content}
          </Section>

          <Hr style={hr} />
          
          <Section style={footer}>
            {footerContent || (
              <>
                <Text style={footerText}>
                  © {new Date().getFullYear()} Your Store. All rights reserved.
                </Text>
                <Link href="#" style={footerLink}>
                  Unsubscribe
                </Link>
              </>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Стили
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '5px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
};

const header = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const section = {
  padding: '0 48px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  padding: '0 48px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '12px 0',
};

const footerLink = {
  color: '#6b7280',
  fontSize: '12px',
  textDecoration: 'underline',
};

export default BaseTemplate;
