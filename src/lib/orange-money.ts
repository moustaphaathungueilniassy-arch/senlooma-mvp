/**
 * Client API Orange Money pour les paiements mobiles
 * Documentation : https://developer.orange.com/apis/om-webpay
 */

const OM_BASE_URL = process.env.ORANGE_MONEY_BASE_URL || 'https://api.orange.com/orange-money-webpay';
const OM_CLIENT_ID = process.env.ORANGE_MONEY_CLIENT_ID;
const OM_CLIENT_SECRET = process.env.ORANGE_MONEY_CLIENT_SECRET;
const OM_MERCHANT_KEY = process.env.ORANGE_MONEY_MERCHANT_KEY;

interface OrangeMoneyTokenResponse {
  token_type: string;
  access_token: string;
  expires_in: number;
}

interface OrangeMoneyPaymentRequest {
  merchant_key: string;
  currency: string;
  order_id: string;
  amount: number;
  return_url: string;
  cancel_url: string;
  notif_url: string;
  lang: string;
}

interface OrangeMoneyPaymentResponse {
  status: number;
  message: string;
  pay_token: string;
  payment_url: string;
  notif_token: string;
}

/**
 * Obtenir un token d'accès OAuth2
 */
async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${OM_CLIENT_ID}:${OM_CLIENT_SECRET}`).toString('base64');

  const response = await fetch('https://api.orange.com/oauth/v3/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Erreur OAuth Orange: ${response.status}`);
  }

  const data: OrangeMoneyTokenResponse = await response.json();
  return data.access_token;
}

/**
 * Initie un paiement Orange Money
 */
export async function createOrangeMoneyPayment(
  amount: number,
  orderId: string,
  returnUrl: string,
  cancelUrl: string,
  notifUrl: string
): Promise<OrangeMoneyPaymentResponse> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${OM_BASE_URL}/v1/webpayment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      merchant_key: OM_MERCHANT_KEY,
      currency: 'OUV',
      order_id: orderId,
      amount,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notif_url: notifUrl,
      lang: 'fr',
    } as OrangeMoneyPaymentRequest),
  });

  if (!response.ok) {
    throw new Error(`Erreur Orange Money API: ${response.status}`);
  }

  return response.json();
}

/**
 * Vérifie le statut d'un paiement Orange Money
 */
export async function checkOrangeMoneyPaymentStatus(
  payToken: string
): Promise<{ status: string }> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${OM_BASE_URL}/v1/webpayment/${payToken}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur vérification Orange Money: ${response.status}`);
  }

  return response.json();
}
