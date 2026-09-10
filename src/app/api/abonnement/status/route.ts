import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getActiveSubscription, getRemainingDays } from '@/lib/subscription';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      );
    }

    const subscription = await getActiveSubscription(session.user.id);

    if (!subscription) {
      return NextResponse.json({
        active: false,
        subscription: null,
        remainingDays: 0,
      });
    }

    return NextResponse.json({
      active: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        amount: subscription.amount,
        currency: subscription.currency,
      },
      remainingDays: getRemainingDays(subscription.endDate),
    });
  } catch (error) {
    console.error('Erreur statut abonnement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de l\'abonnement' },
      { status: 500 }
    );
  }
}
