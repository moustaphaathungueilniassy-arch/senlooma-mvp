import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyWaveWebhook } from '@/lib/wave';
import { createSubscription } from '@/lib/subscription';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('wave-signature') || '';

    // Vérifier la signature du webhook
    if (!process.env.WAVE_WEBHOOK_SECRET || !verifyWaveWebhook(body, signature)) {
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
    }

    const data = JSON.parse(body);
    const { client_reference, checkout_status, id } = data;

    if (checkout_status === 'successful') {
      await prisma.$transaction(async (tx) => {
        const updateResult = await tx.payment.updateMany({
          where: { id: client_reference, status: 'PENDING' },
          data: {
            status: 'SUCCESS',
            providerTransactionId: id || client_reference,
          },
        });

        if (updateResult.count > 0) {
          const payment = await tx.payment.findUnique({
            where: { id: client_reference },
          });
          if (payment) {
            await createSubscription(payment.userId, payment.id, tx);
          }
        }
      });
    } else if (checkout_status === 'failed') {
      await prisma.payment.updateMany({
        where: { id: client_reference, status: 'PENDING' },
        data: { status: 'FAILED' },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erreur webhook Wave:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
