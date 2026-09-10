import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional().or(z.literal('')),
});

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        phone: validatedData.phone || null,
        location: validatedData.location || null,
        bio: validatedData.bio || null,
        avatar: validatedData.avatar || null,
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    }, { status: 200 });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 });
    }
    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json({ error: 'Une erreur est survenue lors de la mise à jour' }, { status: 500 });
  }
}
