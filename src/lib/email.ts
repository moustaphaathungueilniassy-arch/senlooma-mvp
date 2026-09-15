import { Resend } from 'resend';
import { render } from '@react-email/render';
import NotificationEmail from '@/emails/NotificationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

// Adresse d'expédition par défaut
// ATTENTION : Pour envoyer depuis "contact@senlooma.com", il faut vérifier le domaine sur Resend.
// Pour l'instant, on utilise l'adresse de test Resend ou une adresse vérifiée.
const FROM_EMAIL = 'onboarding@resend.dev'; 

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
      NotificationEmail({ title, message, ctaText, ctaUrl })
    );

    const data = await resend.emails.send({
      from: `Senlooma <${FROM_EMAIL}>`,
      to: [to],
      subject: title,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return { success: false, error };
  }
}
