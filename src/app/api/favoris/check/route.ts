import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json({ error: 'ID de l\'annonce manquant' }, { status: 400 });
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId: listingId
        }
      }
    });

    return NextResponse.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error('Erreur check favori:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
