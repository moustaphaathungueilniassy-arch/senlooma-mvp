import { NextRequest, NextResponse } from 'next/server';

// ⚠️ Cette route est UNIQUEMENT pour le développement local
// Elle est automatiquement désactivée en production (Vercel)

export async function GET(request: NextRequest) {
  // Bloquer en production
  if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Cette route est désactivée en production.' },
      { status: 403 }
    );
  }

  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({ error: 'ID de paiement requis' }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });
    }

    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'SUCCESS' }
    });

    if (payment.listingId) {
      await prisma.listing.update({
        where: { id: payment.listingId },
        data: { status: 'ACTIVE' }
      });
    }

    await prisma.$disconnect();
    return NextResponse.json({ message: 'Paiement simulé avec succès (DEV ONLY)' });
  } catch (error) {
    console.error('Erreur simulation:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
