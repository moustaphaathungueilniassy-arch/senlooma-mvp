import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSubscription } from '@/lib/subscription';
import { checkOrangeMoneyPaymentStatus } from '@/lib/orange-money';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { order_id, status: paymentStatus, pay_token } = data;

    if (!order_id) {
      return NextResponse.json({ error: 'order_id manquant' }, { status: 400 });
    }

    // Verify status via API to be safe
    const statusResult = await checkOrangeMoneyPaymentStatus(pay_token || order_id);
    const actualStatus = statusResult.status;

    if (actualStatus === 'SUCCESS' || actualStatus === 'SUCCESSFULL') {
      await prisma.$transaction(async (tx) => {
        const updateResult = await tx.payment.updateMany({
          where: { id: order_id, status: 'PENDING' },
          data: {
            status: 'SUCCESS',
            providerTransactionId: data.txnid || pay_token || order_id,
          },
        });

        if (updateResult.count > 0) {
          const payment = await tx.payment.findUnique({
            where: { id: order_id },
          });
          if (payment) {
            await createSubscription(payment.userId, payment.id, tx);
          }
        }
      });
    } else if (actualStatus === 'FAILED' || paymentStatus === 'FAILED') {
      await prisma.payment.updateMany({
        where: { id: order_id, status: 'PENDING' },
        data: { status: 'FAILED' },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erreur webhook Orange Money:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
