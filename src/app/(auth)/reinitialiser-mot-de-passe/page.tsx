'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2D6A4F] to-[#1a3d2e] px-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-white/20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Lien invalide</h1>
          <p className="text-white/80 mb-6">
            Ce lien de réinitialisation est invalide ou a expiré. Veuillez en demander un nouveau.
          </p>
          <Link
            href="/mot-de-passe-oublie"
            className="inline-flex items-center gap-2 text-[#D4A843] hover:underline font-medium"
          >
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/connexion'), 3000);
      } else {
        setError(data.error || 'Une erreur est survenue.');
      }
    } catch {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2D6A4F] to-[#1a3d2e] px-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-white/20 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Mot de passe réinitialisé !</h1>
          <p className="text-white/80 mb-6">
            Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion...
          </p>
          <Link
            href="/connexion"
            className="inline-flex items-center gap-2 text-[#D4A843] hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Aller à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2D6A4F] to-[#1a3d2e] px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-white/20">
        <h1 className="text-2xl font-bold text-center text-white mb-2">
          Nouveau mot de passe
        </h1>
        <p className="text-center text-white/70 mb-6 text-sm">
          Choisissez un nouveau mot de passe sécurisé pour votre compte.
        </p>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-white/50" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10 pr-10 w-full px-3 py-2 border border-white/30 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F]"
                placeholder="Au moins 6 caractères"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-1">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-white/50" />
              </div>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10 pr-10 w-full px-3 py-2 border border-white/30 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F]"
                placeholder="Confirmez le mot de passe"
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
                Réinitialisation...
              </>
            ) : (
              'Réinitialiser mon mot de passe'
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

export default function ReinitialiserMotDePassePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2D6A4F] to-[#1a3d2e]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    }>
      <ResetForm />
    </Suspense>
  );
}
