import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token et mot de passe requis.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' }, { status: 400 });
    }

    // Vérifier le token dans OtpCode
    const resetToken = await prisma.otpCode.findFirst({
      where: { code: token },
    });

    if (!resetToken) {
      return NextResponse.json({ error: 'Lien de réinitialisation invalide ou expiré.' }, { status: 400 });
    }

    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json({ error: 'Ce lien a expiré. Veuillez en demander un nouveau.' }, { status: 400 });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Mettre à jour le mot de passe de l'utilisateur
    await prisma.user.update({
      where: { email: resetToken.identifier },
      data: { passwordHash: hashedPassword },
    });

    // Supprimer le token pour qu'il ne puisse plus être utilisé
    await prisma.otpCode.delete({
      where: { id: resetToken.id },
    });

    return NextResponse.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (error) {
    console.error('Erreur reset-password:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue.' },
      { status: 500 }
    );
  }
}
