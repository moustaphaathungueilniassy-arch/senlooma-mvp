'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { loginSchema } from '@/lib/validators';

import { useSearchParams } from 'next/navigation';

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const isRegistered = searchParams?.get('registered') === 'true';
  const hasPromo = searchParams?.get('promo') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate with zod
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Email ou mot de passe incorrect');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center text-white mb-6">
        Connexion
      </h1>
      
      {isRegistered && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6 border border-green-200">
          <p className="font-medium">Inscription réussie !</p>
          <p className="text-sm mt-1">Vous pouvez maintenant vous connecter avec vos identifiants.</p>
        </div>
      )}

      {hasPromo && (
        <div className="bg-[#D4A843]/10 border border-[#D4A843] p-4 rounded-md mb-6 text-center shadow-sm">
          <div className="text-2xl mb-2">🎉</div>
          <h3 className="text-[#D4A843] font-bold">Félicitations !</h3>
          <p className="text-sm text-[#D4A843] mt-1">
            En tant que l'un des 25 premiers éleveurs inscrits, vous bénéficiez de <strong>2 mois d'annonces gratuites</strong> !
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
            Email
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

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-white">
              Mot de passe
            </label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-white/50" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="pl-10 pr-10 w-full px-3 py-2 border border-white/30 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F]"
              placeholder="••••••••"
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#2D6A4F] text-white py-2 px-4 rounded-md hover:bg-[#1f4a37] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D6A4F] disabled:opacity-50 mt-4"
        >
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/80">
        Pas encore de compte ?{' '}
        <Link href="/inscription" className="text-white font-bold font-medium hover:underline">
          S'inscrire
        </Link>
      </p>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <React.Suspense fallback={<div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-[#2D6A4F] border-t-transparent rounded-full animate-spin"></div></div>}>
      <ConnexionForm />
    </React.Suspense>
  );
}
