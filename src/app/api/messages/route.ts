import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { conversationId, content, audioUrl } = body;

    if (!conversationId) {
      return NextResponse.json({ error: 'ID de conversation manquant' }, { status: 400 });
    }

    if (!content && !audioUrl) {
      return NextResponse.json({ error: 'Message vide' }, { status: 400 });
    }

    // Limiter la taille du message
    if (content && typeof content === 'string' && content.length > 2000) {
      return NextResponse.json({ error: 'Message trop long (max 2000 caractères)' }, { status: 400 });
    }

    // Vérifier que l'utilisateur participe à la conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation || (conversation.participant1Id !== userId && conversation.participant2Id !== userId)) {
      return NextResponse.json({ error: 'Conversation non trouvée ou accès refusé' }, { status: 404 });
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: content || null,
        audioUrl: audioUrl || null,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    // Mettre à jour la date du dernier message de la conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

    // --- NOTIFICATION EMAIL ---
    try {
      const recipientId = conversation.participant1Id === userId ? conversation.participant2Id : conversation.participant1Id;
      const recipient = await prisma.user.findUnique({
        where: { id: recipientId },
        select: { email: true, name: true, role: true }
      });

      // Si le destinataire a un email et que la clé Resend est configurée
      if (recipient?.email && process.env.RESEND_API_KEY) {
        const { sendNotificationEmail } = await import('@/lib/email');
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://senlooma-mvp-silk.vercel.app';
        
        await sendNotificationEmail({
          to: recipient.email,
          title: 'Vous avez reçu un nouveau message sur SAMA-DARAAL',
          message: `Bonjour ${recipient.name || 'Cher membre'},\n\nVous avez reçu un nouveau message de la part de ${message.sender?.name || 'un utilisateur'}. Cliquez sur le bouton ci-dessous pour lui répondre et conclure la vente !`,
          ctaText: 'Voir le message',
          ctaUrl: `${baseUrl}/messages`
        });
      }
    } catch (emailError) {
      console.error('Erreur non bloquante lors de la notification email:', emailError);
    }
    // ---------------------------

    return NextResponse.json(message);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'ID de conversation requis' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation || (conversation.participant1Id !== session.user.id && conversation.participant2Id !== session.user.id)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
