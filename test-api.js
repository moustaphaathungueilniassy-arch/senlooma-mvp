const { Redis } = require('@upstash/redis');
const { Resend } = require('resend');
require('dotenv').config();

async function testConnections() {
  console.log("=== TESTS DE CONNEXION ===");

  // 1. Test Redis
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    await redis.set('test_senlooma', 'working', { ex: 5 });
    const val = await redis.get('test_senlooma');
    if (val === 'working') {
      console.log("✅ UPSTASH REDIS : Connexion réussie !");
    } else {
      console.log("❌ UPSTASH REDIS : Valeur inattendue.");
    }
  } catch (err) {
    console.log("❌ UPSTASH REDIS : Erreur de connexion ->", err.message);
  }

  // 2. Test Resend
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    // On essaie d'envoyer un email à l'adresse de test spéciale de Resend (qui ne spamme personne)
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'delivered@resend.dev',
      subject: 'Test de connexion Senlooma',
      html: '<p>Connexion réussie</p>'
    });
    
    if (error) {
      console.log("❌ RESEND : Erreur ->", error.message);
    } else {
      console.log("✅ RESEND API : Clé valide, email de test envoyé ! (ID: " + data.id + ")");
    }
  } catch (err) {
    console.log("❌ RESEND : Exception ->", err.message);
  }
}

testConnections();
