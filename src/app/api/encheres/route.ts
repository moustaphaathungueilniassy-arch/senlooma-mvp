import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { auctionSchema } from '@/lib/validators';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'EN_COURS';

    const auctions = await prisma.auction.findMany({
      where: {
        status: status as any,
      },
      include: {
        listing: {
          include: {
            images: true,
            category: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: { bids: true },
        },
      },
      orderBy: {
        endDate: 'asc',
      },
    });

    return NextResponse.json(auctions);
  } catch (error) {
    console.error('Erreur lors de la récupération des enchères:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des enchères' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    // Seuls les éleveurs (ou admin) peuvent créer une enchère
    if (!session?.user?.id || (session.user as any).role === 'ACHETEUR') {
      return NextResponse.json({ error: 'Non autorisé. Seuls les éleveurs peuvent créer des enchères.' }, { status: 401 });
    }

    const body = await request.json();
    
    // 1. Validation Zod
    const { listingId, startPrice, minIncrement, endDate } = auctionSchema.parse(body);

    // 2. Vérifier que l'annonce existe, appartient à l'utilisateur, et est ACTIVE
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas créer une enchère pour une annonce qui ne vous appartient pas' }, { status: 403 });
    }

    if (listing.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'L\'annonce doit être active pour être mise aux enchères' }, { status: 400 });
    }

    // 3. Vérifier qu'il n'y a pas déjà une enchère pour cette annonce
    const existingAuction = await prisma.auction.findUnique({
      where: { listingId },
    });

    if (existingAuction) {
      return NextResponse.json({ error: 'Cette annonce est déjà aux enchères' }, { status: 400 });
    }

    // 4. Créer l'enchère
    const auction = await prisma.auction.create({
      data: {
        listingId,
        userId: session.user.id,
        startPrice,
        currentPrice: startPrice,
        minIncrement,
        endDate: new Date(endDate),
        status: 'EN_COURS',
      },
    });

    return NextResponse.json(auction, { status: 201 });
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'enchère:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'enchère' },
      { status: 500 }
    );
  }
}
