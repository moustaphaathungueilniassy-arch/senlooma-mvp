import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyOTP, checkRateLimit, getClientIp } from '@/lib/security';

export async function POST(request: Request) {
  try {
    // Rate limit: max 5 tentatives par IP par 15 minutes
    const ip = getClientIp(request);
    if (!(await checkRateLimit(`otp:${ip}`, 5, 15 * 60 * 1000))) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Veuillez réessayer dans 15 minutes.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json({ error: 'Adresse e-mail ou code manquant.' }, { status: 400 });
    }

    // Validation basique
    if (typeof code !== 'string' || code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Format de code invalide.' }, { status: 400 });
    }

    // 3. Vérifier le code
    const isValid = await verifyOTP(email, code);
    
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
