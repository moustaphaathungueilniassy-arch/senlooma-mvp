import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
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

    // Marquer le paiement comme SUCCESS
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'SUCCESS' }
    });

    // Si le paiement est lié à une annonce, on l'active
    if (payment.listingId) {
      await prisma.listing.update({
        where: { id: payment.listingId },
        data: { status: 'ACTIVE' }
      });
      
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return NextResponse.redirect(`${appUrl}/annonces/${payment.listingId}?payment=success`);
    }

    return NextResponse.json({ message: 'Paiement simulé avec succès' });
  } catch (error: any) {
    console.error('Erreur lors de la simulation du paiement:', error);
    return NextResponse.json({ error: 'Erreur interne', details: error.message }, { status: 500 });
  }
}
