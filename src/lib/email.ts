import React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import NotificationEmail from '@/emails/NotificationEmail';
import ResetPasswordEmail from '@/emails/ResetPasswordEmail';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'onboarding@resend.dev';

export async function sendResetPasswordEmail(to: string, resetLink: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY manquante, email de réinitialisation non envoyé.');
    return { success: false };
  }

  try {
    const html = await render(ResetPasswordEmail({ resetLink }) as React.ReactElement);

    const data = await resend.emails.send({
      from: `SAMA-DARAAL <${FROM_EMAIL}>`,
      to: [to],
      subject: 'Réinitialisation de votre mot de passe',
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Erreur envoi email réinitialisation:', error);
    return { success: false, error };
  }
}

export async function sendNotificationEmail({
  to,
  title,
  message,
  ctaText,
  ctaUrl,
}: {
  to: string;
  title: string;
  message: string;
  ctaText?: string;
  ctaUrl?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY manquante, email non envoyé.');
    return { success: false };
  }

  try {
    const html = await render(
      NotificationEmail({ title, message, ctaText, ctaUrl }) as React.ReactElement
    );

    const data = await resend.emails.send({
      from: `SAMA-DARAAL <${FROM_EMAIL}>`,
      to: [to],
      subject: title,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, error };
  }
}
