import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { listingSchema } from '@/lib/validators';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const annonce = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            phone: true,
            location: true,
            verified: true,
            reviewsReceived: {
              select: {
                rating: true,
              },
            },
            _count: {
              select: { reviewsReceived: true }
            }
          },
        },
      },
    });

    if (!annonce) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    const totalReviews = annonce.user.reviewsReceived?.length || 0;
    const averageRating = totalReviews > 0
      ? annonce.user.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    const responseData = {
      ...annonce,
      user: {
        ...annonce.user,
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews
      }
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'annonce:", error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;

    const existingAnnonce = await prisma.listing.findUnique({
      where: { id },
    });

    if (!existingAnnonce) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    if (existingAnnonce.userId !== session.user.id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier cette annonce" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = listingSchema.partial().parse(body);
    const { images, ...updateData } = validatedData as any;

    const updatedAnnonce = await prisma.listing.update({
      where: { id },
      data: {
        ...updateData,
        ...(images && {
          images: {
            deleteMany: {},
            create: images.map((url: string) => ({ url })),
          },
        }),
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(updatedAnnonce);
  } catch (error: any) {
    console.error("Erreur lors de la modification de l'annonce:", error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;

    const existingAnnonce = await prisma.listing.findUnique({
      where: { id },
    });

    if (!existingAnnonce) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    const userRole = (session.user as any).role;
    const isOwner = existingAnnonce.userId === session.user.id;

    // Les ACHETEUR n'ont jamais le droit de supprimer
    if (userRole === 'ACHETEUR') {
      return NextResponse.json({ error: "Les clients ne peuvent pas supprimer d'annonces" }, { status: 403 });
    }

    // Les ELEVEUR ne peuvent supprimer que leurs propres annonces
    if (userRole === 'ELEVEUR' && !isOwner) {
      return NextResponse.json({ error: "Vous ne pouvez supprimer que vos propres annonces" }, { status: 403 });
    }

    // Les ADMIN peuvent tout supprimer (aucun blocage)
    if (!isOwner && userRole !== 'ADMIN') {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await prisma.listing.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Annonce supprimée avec succès' });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'annonce:", error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
