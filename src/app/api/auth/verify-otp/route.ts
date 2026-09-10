import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyOTP } from '@/lib/security';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json({ error: 'Adresse e-mail ou code manquant.' }, { status: 400 });
    }

    const isValid = verifyOTP(email, code);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Code incorrect ou expiré.' }, { status: 400 });
    }

    // Le code est bon, on met à jour le statut "verified"
    await prisma.user.update({
      where: { email },
      data: { verified: true }
    });

    return NextResponse.json({ message: 'Compte vérifié avec succès.' }, { status: 200 });

  } catch (error) {
    console.error('Erreur vérification OTP:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
