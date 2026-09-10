import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    
    let page = parseInt(searchParams.get('page') || '1');
    let limit = parseInt(searchParams.get('limit') || '10');
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const where: any = {
      role: 'ELEVEUR',
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } }
      ];
    } else {
      if (city) {
        where.location = { contains: city, mode: 'insensitive' };
      }
      if (country) {
        where.country = { contains: country, mode: 'insensitive' };
      }
    }

    const eleveurs = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        avatar: true,
        location: true,
        country: true,
        _count: {
          select: {
            listings: {
              where: { status: 'ACTIVE' }
            },
            reviewsReceived: true
          }
        },
        reviewsReceived: {
          select: { rating: true }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const eleveursWithRating = eleveurs.map(eleveur => {
      const totalReviews = eleveur.reviewsReceived.length;
      const averageRating = totalReviews > 0
        ? eleveur.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;
        
      const { reviewsReceived, ...rest } = eleveur;
      return {
        ...rest,
        averageRating: Number(averageRating.toFixed(1))
      };
    });

    const total = await prisma.user.count({ where });

    return NextResponse.json({
      data: eleveursWithRating,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des éleveurs:', error);
    return NextResponse.json({ error: 'Erreur serveur interne' }, { status: 500 });
  }
}
