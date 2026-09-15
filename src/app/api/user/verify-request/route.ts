import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        idCardNumber: true,
        idCardFront: true,
        idCardBack: true,
        verified: true,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erreur GET /api/user/verify-request:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { idCardNumber, idCardFront, idCardBack } = body;

    if (!idCardNumber || !idCardFront || !idCardBack) {
      return NextResponse.json({ error: 'Toutes les informations sont requises.' }, { status: 400 });
    }

    // Mettre à jour l'utilisateur et l'approuver AUTOMATIQUEMENT
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        idCardNumber,
        idCardFront,
        idCardBack,
        verified: true, // Auto-approbation activée comme demandé
      }
    });

    return NextResponse.json({ success: true, verified: true });
  } catch (error) {
    console.error('Erreur POST /api/user/verify-request:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
