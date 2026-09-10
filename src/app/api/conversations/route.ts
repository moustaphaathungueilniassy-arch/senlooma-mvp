import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId }
        ]
      },
      include: {
        participant1: {
          select: { id: true, name: true, avatar: true }
        },
        participant2: {
          select: { id: true, name: true, avatar: true }
        },
        listing: {
          select: { id: true, title: true, images: { take: 1 } }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { targetUserId, listingId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'ID de l\'utilisateur cible manquant' }, { status: 400 });
    }

    if (userId === targetUserId) {
      return NextResponse.json({ error: 'Vous ne pouvez pas converser avec vous-même' }, { status: 400 });
    }

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: userId, participant2Id: targetUserId, listingId: listingId || null },
          { participant1Id: targetUserId, participant2Id: userId, listingId: listingId || null }
        ]
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: userId,
          participant2Id: targetUserId,
          listingId: listingId || null
        }
      });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
