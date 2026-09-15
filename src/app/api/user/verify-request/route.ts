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

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        idCardNumber,
        idCardFront,
        idCardBack,
        verified: false, // Repasse à false au cas où il était vérifié et a changé sa carte
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur POST /api/user/verify-request:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
