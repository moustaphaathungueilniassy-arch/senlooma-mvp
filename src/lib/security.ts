import crypto from 'crypto';

// ==========================================
// RATE LIMITING (en mémoire — pour dev local uniquement)
// En production sur Vercel, utiliser Redis/Upstash
// ==========================================

import { Redis } from '@upstash/redis';

// Initialisation de Redis (ne plantera pas si les clés ne sont pas définies en dev)
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const rateLimitCache = new Map<string, { count: number; expiresAt: number }>();

export async function checkRateLimit(ip: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();

  // Mode Vercel/Prod : Utiliser Redis si configuré
  if (redis) {
    try {
      const key = `ratelimit:${ip}`;
      // LUA Script basique ou juste incr/expire
      const current = await redis.incr(key);
      if (current === 1) {
        // Première requête, définir l'expiration (en secondes)
        await redis.expire(key, Math.floor(windowMs / 1000));
      }
      return current <= limit;
    } catch (e) {
      console.error('Erreur Redis Rate Limiting:', e);
      // Fallback permissif en cas de panne Redis
      return true;
    }
  }

  // Fallback Dev : Mémoire locale
  for (const [key, val] of rateLimitCache.entries()) {
    if (val.expiresAt < now) {
      rateLimitCache.delete(key);
    }
  }

  const record = rateLimitCache.get(ip);
  if (!record || record.expiresAt < now) {
    rateLimitCache.set(ip, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return 'unknown';
}

// ==========================================
// OTP — Stockage en base de données (Prisma)
// Utilise crypto.randomInt pour la sécurité cryptographique
// ==========================================

import prisma from './prisma';

/**
 * Génère un code OTP à 6 chiffres cryptographiquement sûr et l'enregistre en BDD
 */
export async function generateOTP(identifier: string): Promise<string> {
  // 6 chiffres pour 1 million de possibilités
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.otpCode.upsert({
    where: { identifier },
    update: {
      code,
      expiresAt,
      attempts: 0,
      createdAt: new Date(),
    },
    create: {
      identifier,
      code,
      expiresAt,
      attempts: 0,
    },
  });

  // Log uniquement en développement — JAMAIS en production
  if (process.env.NODE_ENV === 'development') {
    console.log('\n=========================================');
    console.log(`[DEV] Code OTP pour ${identifier} : ${code}`);
    console.log('=========================================\n');
  }

  return code;
}

/**
 * Vérifie un code OTP avec protection anti-brute-force (max 5 tentatives)
 */
export async function verifyOTP(identifier: string, code: string): Promise<boolean> {
  const record = await prisma.otpCode.findUnique({
    where: { identifier },
  });

  if (!record) return false;

  // Vérifier l'expiration
  if (Date.now() > record.expiresAt.getTime()) {
    await prisma.otpCode.delete({ where: { identifier } });
    return false;
  }

  // Protection anti-brute-force : max 5 tentatives
  if (record.attempts >= 5) {
    await prisma.otpCode.delete({ where: { identifier } });
    return false;
  }

  // Incrémenter les tentatives
  await prisma.otpCode.update({
    where: { identifier },
    data: { attempts: record.attempts + 1 },
  });

  if (record.code === code) {
    await prisma.otpCode.delete({ where: { identifier } });
    return true;
  }

  return false;
}
