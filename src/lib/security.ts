import crypto from 'crypto';

// ==========================================
// RATE LIMITING (en mémoire — pour dev local uniquement)
// En production sur Vercel, utiliser Redis/Upstash
// ==========================================

const rateLimitCache = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  // Nettoyer les entrées expirées
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
// OTP — Stockage en mémoire (dev) / BDD (prod)
// Utilise crypto.randomInt pour la sécurité cryptographique
// ==========================================

const otpCache = new Map<string, { code: string; expiresAt: number; attempts: number }>();

/**
 * Génère un code OTP à 6 chiffres cryptographiquement sûr
 */
export function generateOTP(identifier: string): string {
  // 6 chiffres pour 1 million de possibilités
  const code = crypto.randomInt(100000, 999999).toString();
  otpCache.set(identifier, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
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
export function verifyOTP(identifier: string, code: string): boolean {
  const record = otpCache.get(identifier);
  if (!record) return false;

  // Vérifier l'expiration
  if (Date.now() > record.expiresAt) {
    otpCache.delete(identifier);
    return false;
  }

  // Protection anti-brute-force : max 5 tentatives
  if (record.attempts >= 5) {
    otpCache.delete(identifier);
    return false;
  }

  record.attempts++;

  if (record.code === code) {
    otpCache.delete(identifier);
    return true;
  }

  return false;
}
