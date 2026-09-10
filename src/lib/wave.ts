/**
 * Client API Wave pour les paiements mobiles
 * Documentation : https://docs.wave.com
 */

import crypto from 'crypto';

const WAVE_BASE_URL = process.env.WAVE_BASE_URL || 'https://api.wave.com/v1';
const WAVE_API_KEY = process.env.WAVE_API_KEY;

if (!WAVE_API_KEY) {
  console.warn('WAVE_API_KEY is not defined in environment variables.');
}

interface WaveCheckoutRequest {
  amount: number;
  currency: string;
  error_url: string;
  success_url: string;
  client_reference: string;
}

interface WaveCheckoutResponse {
  id: string;
  checkout_status: string;
  wave_launch_url: string;
  client_reference: string;
  amount: string;
  currency: string;
}

/**
 * Initie un paiement Wave (checkout)
 */
export async function createWaveCheckout(
  amount: number,
  clientReference: string,
  successUrl: string,
  errorUrl: string
): Promise<WaveCheckoutResponse> {
  const response = await fetch(`${WAVE_BASE_URL}/checkout/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WAVE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency: 'XOF',
      error_url: errorUrl,
      success_url: successUrl,
      client_reference: clientReference,
    } as WaveCheckoutRequest),
  });

  if (!response.ok) {
    throw new Error(`Erreur Wave API: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Vérifie la signature d'un webhook Wave
 */
export function verifyWaveWebhook(payload: string, signature: string): boolean {
  const secret = process.env.WAVE_WEBHOOK_SECRET;
  if (!secret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}
