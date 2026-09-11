import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { hasActiveSubscription } from '@/lib/subscription';
import { listingSchema } from '@/lib/validators';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const breed = searchParams.get('breed');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    
    let page = parseInt(searchParams.get('page') || '1');
    let limit = parseInt(searchParams.get('limit') || '10');
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 50) limit = 50; // Protection anti-DoS

    // Les annonces expirent automatiquement après 15 jours
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const where: any = {
      status: 'ACTIVE',
      createdAt: {
        gte: fifteenDaysAgo
      }
    };

    if (categoryId) where.categoryId = categoryId;
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };
    if (breed) where.breed = { contains: breed, mode: 'insensitive' };
    
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const annonces = await prisma.listing.findMany({
      where,
      include: {
        images: true,
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.listing.count({ where });

    return NextResponse.json({
      data: annonces,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des annonces:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur interne' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé. Veuillez vous connecter.' }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== 'ELEVEUR') {
      return NextResponse.json({ error: 'Seuls les éleveurs peuvent publier des annonces.' }, { status: 403 });
    }

    // TEMPORAIREMENT GRATUIT POUR TOUS
    // const isActive = await hasActiveSubscription(session.user.id);
    // if (!isActive) {
    //   return NextResponse.json({ error: 'Abonnement inactif. Veuillez renouveler votre abonnement.' }, { status: 403 });
    // }

    const body = await request.json();
    const { images: imageUrls, ...listingBody } = body;
    
    // Vérifier les 3 photos obligatoires côté backend
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length < 3) {
      return NextResponse.json({ error: 'Vous devez fournir au moins 3 photos pour cette annonce.' }, { status: 400 });
    }

    // Validation des données avec le schéma Zod
    const validatedData = listingSchema.parse(listingBody);

    // Résoudre le slug de la catégorie en son ID réel dans la BDD (Fix Critique-2)
    const category = await prisma.category.findUnique({
      where: { slug: validatedData.categoryId }
    });

    if (!category) {
      return NextResponse.json({ error: 'Catégorie introuvable.' }, { status: 400 });
    }

    // Créer l'annonce directement comme ACTIVE
    const newAnnonce = await prisma.listing.create({
      data: {
        ...validatedData,
        categoryId: category.id,
        userId: session.user.id,
        status: 'ACTIVE', // Toujours gratuit pour le moment
        images: {
          create: (imageUrls as string[] || []).map((url: string) => ({ url })),
        },
      },
      include: {
        images: true,
      }
    });

    return NextResponse.json({ 
      data: newAnnonce,
      message: 'Annonce publiée avec succès gratuitement.' 
    }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    console.error("Erreur lors de la création de l'annonce:", error);
    return NextResponse.json({ error: "Erreur lors de la création de l'annonce" }, { status: 400 });
  }
}
