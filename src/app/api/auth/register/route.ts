import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/validators';
import { checkRateLimit, getClientIp, generateOTP } from '@/lib/security';

export async function POST(request: Request) {
  try {
    // 1. Anti-Spam: Limiter à 5 créations de compte par heure par adresse IP
    const ip = getClientIp(request);
    const isAllowed = checkRateLimit(ip, 5, 60 * 60 * 1000); // 5 requêtes / heure
    if (!isAllowed) {
      return NextResponse.json({ message: 'Trop de requêtes. Veuillez réessayer plus tard.' }, { status: 429 });
    }

    const body = await request.json();
    
    // Valider les données avec Zod
    const validatedData = registerSchema.parse(body);
    
    let { name, email, phone, password, role, idCardNumber, idCardFront, idCardBack, location, latitude, longitude } = validatedData;
    
    // Normaliser l'email
    email = email.toLowerCase().trim();

    // Forcer le rôle, interdire ADMIN explicitement de la requête client
    if (role !== 'ACHETEUR' && role !== 'ELEVEUR') {
      return NextResponse.json(
        { message: 'Rôle invalide' },
        { status: 400 }
      );
    }

    let finalRole = role as 'ACHETEUR' | 'ELEVEUR' | 'ADMIN';

    // Limiter les admins à 2 : Les deux premiers inscrits sur la plateforme deviennent ADMIN
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount < 2) {
      finalRole = 'ADMIN';
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }

    // Hasher le mot de passe (10 rounds)
    const passwordHash = await bcryptjs.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role: finalRole,
        idCardNumber: idCardNumber || null,
        idCardFront: idCardFront || null,
        idCardBack: idCardBack || null,
        location: location || null,
        latitude: latitude || null,
        longitude: longitude || null,
      },
    });

    // Promotion de gratuité : Les 25 premiers éleveurs reçoivent 2 mois d'abonnement gratuit
    let promoApplied = false;
    if (role === 'ELEVEUR') {
      const eleveursCount = await prisma.user.count({
        where: { role: 'ELEVEUR' },
      });

      if (eleveursCount <= 25) {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 2); // Ajoute 2 mois

        await prisma.subscription.create({
          data: {
            userId: user.id,
            status: 'ACTIVE',
            amount: 0,
            endDate: endDate,
          },
        });
        promoApplied = true;
        console.log(`[PROMO] Éleveur ${user.email} (n°${eleveursCount}) a reçu 2 mois d'abonnement gratuit.`);
      }
    }

    // 2. Générer l'OTP et simuler l'envoi
    if (user.email) {
      generateOTP(user.email);
    }

    // Enlever le hash du mot de passe de la réponse
    const { passwordHash: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        message: 'Compte créé avec succès', 
        user: userWithoutPassword,
        requireOTP: true,
        promoApplied
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);
    
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      const targetStr = Array.isArray(target) ? target.join(',') : String(target || '');
      
      if (targetStr.includes('phone')) {
        return NextResponse.json(
          { message: 'Ce numéro de téléphone est déjà utilisé' },
          { status: 409 }
        );
      }
      if (targetStr.includes('email')) {
        return NextResponse.json(
          { message: 'Cet email est déjà utilisé' },
          { status: 409 }
        );
      }
      
      // Fallback si on ne sait pas quel champ a causé l'erreur unique
      return NextResponse.json(
        { message: 'Un compte avec ces informations existe déjà' },
        { status: 409 }
      );
    }

    // Erreur de validation Zod
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      );
    }
    
    // Log the error server-side only
    console.error('Registration error details:', error?.message || String(error));

    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la création du compte' },
      { status: 500 }
    );
  }
}
