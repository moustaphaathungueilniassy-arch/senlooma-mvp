'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Une erreur est survenue.');
      }
    } catch {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2D6A4F] to-[#1a3d2e] px-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-white/20 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Email envoyé !</h1>
          <p className="text-white/80 mb-6">
            Si un compte existe avec l&apos;adresse <strong className="text-white">{email}</strong>, 
            vous recevrez un lien de réinitialisation dans quelques instants.
          </p>
          <p className="text-white/60 text-sm mb-6">
            Pensez à vérifier vos spams si vous ne voyez pas l&apos;email.
          </p>
          <Link
            href="/connexion"
            className="inline-flex items-center gap-2 text-[#D4A843] hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2D6A4F] to-[#1a3d2e] px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-white/20">
        <h1 className="text-2xl font-bold text-center text-white mb-2">
          Mot de passe oublié ?
        </h1>
        <p className="text-center text-white/70 mb-6 text-sm">
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
              Adresse email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-white/50" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="pl-10 w-full px-3 py-2 border border-white/30 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F]"
                placeholder="votre@email.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2D6A4F] text-white py-2 px-4 rounded-md hover:bg-[#1f4a37] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D6A4F] disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              'Envoyer le lien de réinitialisation'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/connexion"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
