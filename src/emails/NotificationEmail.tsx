import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Tailwind,
} from '@react-email/components';

interface NotificationEmailProps {
  title: string;
  message: string;
  ctaText?: string;
  ctaUrl?: string;
}

export const NotificationEmail = ({
  title,
  message,
  ctaText,
  ctaUrl,
}: NotificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 my-auto mx-auto font-sans">
          <Container className="bg-white border border-gray-200 rounded my-[40px] mx-auto p-[20px] max-w-[600px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              <strong className="text-green-700">SAMA-DARAAL</strong>
            </Heading>
            <Section className="text-center">
              <Text className="text-black text-[18px] leading-[24px] font-bold">
                {title}
              </Text>
              <Text className="text-gray-700 text-[16px] leading-[24px] text-left">
                {message}
              </Text>
            </Section>
            {ctaText && ctaUrl && (
              <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                  className="bg-green-600 rounded text-white text-[14px] font-semibold no-underline text-center px-5 py-3"
                  href={ctaUrl}
                >
                  {ctaText}
                </Button>
              </Section>
            )}
            <Text className="text-gray-500 text-[12px] leading-[24px] text-center mt-8">
              L'équipe SAMA-DARAAL • Sénégal
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default NotificationEmail;
