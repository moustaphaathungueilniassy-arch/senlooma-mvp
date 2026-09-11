import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Récupérer les favoris de l'utilisateur
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        listing: {
          include: {
            category: true,
            images: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ data: favorites });
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Ajouter ou supprimer un favori (Toggle)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { listingId } = await request.json();

    if (!listingId) {
      return NextResponse.json({ error: 'ID de l\'annonce manquant' }, { status: 400 });
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId: listingId
        }
      }
    });

    if (existingFavorite) {
      // S'il existe déjà, on le supprime
      await prisma.favorite.delete({
        where: { id: existingFavorite.id }
      });
      return NextResponse.json({ message: 'Retiré des favoris', isFavorited: false });
    } else {
      // Sinon, on l'ajoute
      const favorite = await prisma.favorite.create({
        data: {
          userId: session.user.id,
          listingId: listingId
        }
      });
      return NextResponse.json({ message: 'Ajouté aux favoris', favorite, isFavorited: true });
    }
  } catch (error) {
    console.error('Erreur lors de la gestion des favoris:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
