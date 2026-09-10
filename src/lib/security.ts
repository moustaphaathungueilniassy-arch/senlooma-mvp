// Cache global pour Rate Limiting
const rateLimitCache = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitCache.get(ip);
  
  // Nettoyer les entrées expirées pour libérer de la mémoire
  for (const [key, val] of rateLimitCache.entries()) {
    if (val.expiresAt < now) {
      rateLimitCache.delete(key);
    }
  }
  
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

// Cache global pour la simulation OTP
const otpCache = new Map<string, { code: string; expiresAt: number }>();

export function generateOTP(phone: string): string {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  otpCache.set(phone, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  });
  
  // Simulation d'envoi SMS
  console.log('\n=========================================');
  console.log(`[SIMULATION SMS] Envoyer au ${phone}`);
  console.log(`Votre code de vérification SAMA-DARAAL est : ${code}`);
  console.log('=========================================\n');
  
  return code;
}

export function verifyOTP(phone: string, code: string): boolean {
  const record = otpCache.get(phone);
  if (!record) return false;
  
  if (Date.now() > record.expiresAt) {
    otpCache.delete(phone);
    return false;
  }
  
  if (record.code === code) {
    otpCache.delete(phone);
    return true;
  }
  
  return false;
}
