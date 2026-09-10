import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            images: true,
            category: true,
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                phone: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        bids: {
          orderBy: {
            amount: 'desc',
          },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!auction) {
      return NextResponse.json({ error: 'Enchère introuvable' }, { status: 404 });
    }

    return NextResponse.json(auction);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'enchère:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'enchère' },
      { status: 500 }
    );
  }
}
