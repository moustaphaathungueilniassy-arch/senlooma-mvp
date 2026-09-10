import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createWaveCheckout } from '@/lib/wave';
import { createOrangeMoneyPayment } from '@/lib/orange-money';
import { SUBSCRIPTION_PRICE } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      );
    }

    if ((session.user as any).role !== 'ELEVEUR') {
      return NextResponse.json(
        { error: 'Seuls les éleveurs peuvent s\'abonner' },
        { status: 403 }
      );
    }

    const { provider } = await req.json();
    if (!provider || !['wave', 'orange-money'].includes(provider)) {
      return NextResponse.json(
        { error: 'Moyen de paiement invalide' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Créer le paiement en BDD (statut PENDING)
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: SUBSCRIPTION_PRICE,
        currency: 'XOF',
        provider: provider === 'wave' ? 'WAVE' : 'ORANGE_MONEY',
        status: 'PENDING',
      },
    });

    let paymentUrl: string;
    let providerTransactionId: string;

    try {
      if (provider === 'wave') {
        const checkout = await createWaveCheckout(
          SUBSCRIPTION_PRICE,
          payment.id,
          `${appUrl}/abonnement/succes?provider=wave`,
          `${appUrl}/abonnement?error=payment_failed`
        );
        paymentUrl = checkout.wave_launch_url;
        providerTransactionId = checkout.id;
      } else {
        const omPayment = await createOrangeMoneyPayment(
          SUBSCRIPTION_PRICE,
          payment.id,
          `${appUrl}/abonnement/succes?provider=orange-money`,
          `${appUrl}/abonnement?error=payment_failed`,
          `${appUrl}/api/paiement/webhook/orange-money`
        );
        paymentUrl = omPayment.payment_url;
        providerTransactionId = omPayment.pay_token;
      }
    } catch (apiError) {
      console.error('Erreur API partenaire:', apiError);
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
      throw apiError;
    }

    // Mettre à jour le payment avec l'info du provider
    await prisma.payment.update({
      where: { id: payment.id },
      data: { providerTransactionId },
    });

    return NextResponse.json({ payment_url: paymentUrl, payment_id: payment.id });
  } catch (error) {
    console.error('Erreur initiation paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'initiation du paiement' },
      { status: 500 }
    );
  }
}
