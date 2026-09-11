import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { amount } = body;

    if (!amount) {
      return NextResponse.json({ error: 'Montant manquant' }, { status: 400 });
    }

    const bidAmount = parseFloat(amount);
    
    if (isNaN(bidAmount) || bidAmount <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    }

    // Récupérer l'enchère avec un verrouillage transactionnel si possible, mais ici on fera une vérification simple
    const auction = await prisma.auction.findUnique({
      where: { id },
    });

    if (!auction) {
      return NextResponse.json({ error: 'Enchère introuvable' }, { status: 404 });
    }

    if (auction.status !== 'EN_COURS') {
      return NextResponse.json({ error: 'Cette enchère est terminée ou annulée' }, { status: 400 });
    }

    if (new Date() > new Date(auction.endDate)) {
      // Mettre à jour le statut
      await prisma.auction.update({
        where: { id },
        data: { status: 'TERMINE' },
      });
      return NextResponse.json({ error: 'Cette enchère a expiré' }, { status: 400 });
    }

    if (bidAmount < auction.currentPrice + auction.minIncrement) {
      return NextResponse.json(
        { error: `Le montant doit être d'au moins ${auction.currentPrice + auction.minIncrement} FCFA` },
        { status: 400 }
      );
    }

    if (auction.userId === session.user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas enchérir sur votre propre annonce' }, { status: 400 });
    }

    // Utilisation d'une transaction pour garantir la cohérence
    const result = await prisma.$transaction(async (tx) => {
      // Revérifier dans la transaction
      const currentAuction = await tx.auction.findUnique({ where: { id } });
      if (!currentAuction || bidAmount < currentAuction.currentPrice + currentAuction.minIncrement) {
        throw new Error('Montant insuffisant ou enchère modifiée');
      }

      // Créer l'offre
      const newBid = await tx.bid.create({
        data: {
          amount: bidAmount,
          auctionId: id,
          userId: session.user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      // Mettre à jour l'enchère
      await tx.auction.update({
        where: { id },
        data: { currentPrice: bidAmount },
      });

      return newBid;
    });

    // Optionnel: Notification via socket.io / pusher si implémenté

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Erreur lors du placement de l\'enchère:', error);
    return NextResponse.json(
      { error: "Erreur lors du placement de l'enchère" },
      { status: 500 }
    );
  }
}
