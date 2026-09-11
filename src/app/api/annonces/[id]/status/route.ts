import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!status || !['ACTIVE', 'VENDU'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    const existingAnnonce = await prisma.listing.findUnique({
      where: { id },
    });

    if (!existingAnnonce) {
      return NextResponse.json({ error: 'Annonce non trouvée' }, { status: 404 });
    }

    // Seul le propriétaire peut changer le statut
    if (existingAnnonce.userId !== session.user.id) {
      return NextResponse.json({ error: "Vous n'êtes pas autorisé à modifier cette annonce" }, { status: 403 });
    }

    const updatedAnnonce = await prisma.listing.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedAnnonce);
  } catch (error) {
    console.error("Erreur lors de la modification du statut:", error);
    return NextResponse.json({ error: 'Erreur serveur interne' }, { status: 500 });
  }
}
