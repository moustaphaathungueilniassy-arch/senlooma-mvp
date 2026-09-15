import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Vérifie si l'utilisateur est admin
async function isAdmin() {
  const session = await auth();
  return session?.user && (session.user as any).role === 'ADMIN';
}

export async function GET(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les utilisateurs ayant fourni une CNI mais non vérifiés
    const pendingUsers = await prisma.user.findMany({
      where: {
        idCardNumber: { not: null },
        idCardFront: { not: null },
        idCardBack: { not: null },
        verified: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        idCardNumber: true,
        idCardFront: true,
        idCardBack: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(pendingUsers);
  } catch (error) {
    console.error('Erreur GET /api/admin/verify:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      await prisma.user.update({
        where: { id: userId },
        data: { verified: true },
      });
    } else if (action === 'REJECT') {
      // Si rejeté, on vide les champs pour qu'il puisse recommencer
      await prisma.user.update({
        where: { id: userId },
        data: {
          verified: false,
          idCardNumber: null,
          idCardFront: null,
          idCardBack: null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur POST /api/admin/verify:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
