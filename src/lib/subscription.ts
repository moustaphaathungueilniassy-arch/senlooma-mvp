import prisma from '@/lib/prisma';
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_DURATION_DAYS } from '@/lib/utils';

/**
 * Vérifie si un utilisateur a un abonnement actif
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      endDate: { gt: new Date() },
    },
  });
  return !!subscription;
}

/**
 * Récupère l'abonnement actif d'un utilisateur
 */
export async function getActiveSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      endDate: { gt: new Date() },
    },
    include: { payments: true },
  });
}

/**
 * Crée un nouvel abonnement après paiement réussi (cumule les jours si un abonnement actif existe)
 */
export async function createSubscription(userId: string, paymentId: string, txClient?: any) {
  const tx = txClient || prisma;
  
  // Chercher un abonnement actif existant
  const activeSubscription = await tx.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      endDate: { gt: new Date() },
    },
  });

  let remainingDays = 0;
  if (activeSubscription) {
    remainingDays = getRemainingDays(activeSubscription.endDate);
    
    // Mettre l'ancien abonnement en EXPIRED
    await tx.subscription.update({
      where: { id: activeSubscription.id },
      data: { status: 'EXPIRED' },
    });
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + SUBSCRIPTION_DURATION_DAYS + remainingDays);

  return tx.subscription.create({
    data: {
      userId,
      status: 'ACTIVE',
      startDate,
      endDate,
      amount: SUBSCRIPTION_PRICE,
      currency: 'XOF',
      payments: { connect: { id: paymentId } },
    },
  });
}

/**
 * Expire les abonnements dépassés
 */
export async function expireOverdueSubscriptions() {
  return prisma.subscription.updateMany({
    where: {
      status: 'ACTIVE',
      endDate: { lt: new Date() },
    },
    data: { status: 'EXPIRED' },
  });
}

/**
 * Calcule les jours restants d'un abonnement
 */
export function getRemainingDays(endDate: Date): number {
  const diff = new Date(endDate).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
