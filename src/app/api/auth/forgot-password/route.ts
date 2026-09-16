import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendResetPasswordEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Toujours répondre 200 pour ne pas révéler si l'email existe
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // On ne révèle pas que l'email n'existe pas
      return NextResponse.json({ 
        message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' 
      });
    }

    // Générer un token unique
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    // Invalider les anciens tokens pour cet email
    await prisma.passwordResetToken.updateMany({
      where: { email: normalizedEmail, used: false },
      data: { used: true },
    });

    // Créer le nouveau token
    await prisma.passwordResetToken.create({
      data: {
        token,
        email: normalizedEmail,
        expiresAt,
      },
    });

    // Construire le lien de réinitialisation
    const baseUrl = process.env.NEXTAUTH_URL || 'https://senlooma-mvp-silk.vercel.app';
    const resetLink = `${baseUrl}/reinitialiser-mot-de-passe?token=${token}`;

    // Envoyer l'email
    await sendResetPasswordEmail(normalizedEmail, resetLink);

    return NextResponse.json({ 
      message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' 
    });
  } catch (error) {
    console.error('Erreur forgot-password:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue.' },
      { status: 500 }
    );
  }
}
