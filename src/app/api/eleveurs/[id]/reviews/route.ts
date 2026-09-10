import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const resolvedParams = await params;
    
    // Si l'utilisateur n'est pas connecté
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const currentUser = { id: session.user.id };

    // Vérifier que l'utilisateur ne s'évalue pas lui-même
    if (currentUser.id === resolvedParams.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas évaluer votre propre profil' }, { status: 400 });
    }

    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Note invalide (doit être entre 1 et 5)' }, { status: 400 });
    }

    try {
      const review = await prisma.review.create({
        data: {
          rating,
          comment,
          reviewerId: currentUser.id,
          reviewedId: resolvedParams.id,
        }
      });
      return NextResponse.json(review, { status: 201 });
    } catch (e: any) {
      if (e.code === 'P2002') {
        return NextResponse.json({ error: 'Vous avez déjà laissé un avis pour cet éleveur.' }, { status: 400 });
      }
      throw e;
    }
  } catch (error) {
    console.error('Erreur API post review:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const reviews = await prisma.review.findMany({
      where: { reviewedId: resolvedParams.id },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Erreur API get reviews:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
