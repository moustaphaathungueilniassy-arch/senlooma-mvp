import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const eleveur = await prisma.user.findUnique({
      where: { id: (await params).id, role: 'ELEVEUR' },
      select: {
        id: true,
        name: true,
        avatar: true,
        location: true,
        phone: true,
        verified: true,
        bio: true,
        _count: {
          select: {
            listings: { where: { status: 'ACTIVE' } },
            reviewsReceived: true
          }
        },
        reviewsReceived: {
          select: {
            rating: true
          }
        },
        listings: {
          where: { status: 'ACTIVE' },
          include: {
            images: { take: 1 },
            category: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!eleveur) {
      return NextResponse.json({ error: 'Éleveur non trouvé' }, { status: 404 });
    }

    // Calculer la moyenne des notes
    const totalReviews = eleveur.reviewsReceived.length;
    const averageRating = totalReviews > 0
      ? eleveur.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    return NextResponse.json({
      ...eleveur,
      averageRating: Number(averageRating.toFixed(1))
    });
  } catch (error) {
    console.error('Erreur API eleveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
