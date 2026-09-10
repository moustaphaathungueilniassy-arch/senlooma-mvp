'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User, Phone, CheckCircle2, Loader2 } from 'lucide-react';
import { registerSchema } from '@/lib/validators';

function InscriptionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams?.get('role');
  
  const [role, setRole] = useState<'ACHETEUR' | 'ELEVEUR' | ''>(
    initialRole === 'eleveur' ? 'ELEVEUR' : initialRole === 'client' ? 'ACHETEUR' : ''
  );
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    idCardNumber: '',
    location: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Fetch city name from coordinates using Nominatim API (OpenStreetMap)
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Localité inconnue';
          
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude,
            location: city
          }));
        } catch (err) {
          // Fallback if API fails
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude,
            location: 'Coordonnées enregistrées'
          }));
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        setError('Impossible d\'obtenir votre position. Veuillez l\'entrer manuellement.');
      }
    );
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Code invalide');
      
      router.push('/connexion?registered=true&verified=true');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la vérification');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!role) {
      setError('Veuillez sélectionner un rôle');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    const validation = registerSchema.safeParse({ ...formData, role });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setIsLoading(true);

    try {
      // ID Card Number is required if role is ELEVEUR
      if (role === 'ELEVEUR') {
        if (!formData.idCardNumber) {
          throw new Error('Veuillez fournir votre numéro de CNI pour le compte éleveur.');
        }
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details ? `${data.message} : ${data.details}` : data.message || "Erreur lors de l'inscription");
      }

      if (data.requireOTP) {
        setShowOtp(true);
        return;
      }

      if (data.promoApplied) {
        router.push('/connexion?registered=true&promo=true');
      } else {
        router.push('/connexion?registered=true');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center text-white mb-6">
        Créer un compte
      </h1>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      {showOtp ? (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="bg-white/10 p-6 rounded-lg text-center border border-white/20">
            <h2 className="text-xl font-bold text-white mb-2">Vérification par e-mail</h2>
            <p className="text-white/80 text-sm mb-6">
              Pour des raisons de sécurité, veuillez entrer le code à 4 chiffres qui vient d'être envoyé à l'adresse <b>{formData.email}</b>.
            </p>
            <p className="text-xs text-[#D4A843] mb-4 bg-[#D4A843]/10 p-2 rounded">
              <i>(Mode démo : Regardez dans le fichier CODE_OTP_POUR_TEST.txt pour voir le code !)</i>
            </p>
            
            <input
              type="text"
              maxLength={4}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="0000"
              className="w-32 mx-auto text-center text-3xl tracking-widest bg-white/10 border-white/20 text-white placeholder-white/30 rounded-md focus:border-white focus:ring focus:ring-white focus:ring-opacity-50 py-3"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying || otpCode.length !== 4}
            className="w-full py-3 px-4 bg-[#D4A843] hover:bg-[#b08b35] text-white rounded-lg font-bold transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Vérifier le code"}
          </button>
        </form>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Sélection du rôle */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setRole('ELEVEUR')}
            aria-pressed={role === 'ELEVEUR'}
            className={`cursor-pointer p-4 rounded-lg border-2 text-center transition-all focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] ${
              role === 'ELEVEUR'
                ? 'border-[#2D6A4F] bg-white/10'
                : 'border-white/20 hover:border-[#2D6A4F]/50'
            }`}
          >
            <div className="text-4xl mb-2" role="img" aria-hidden="true">🐄</div>
            <div className="font-bold text-sm">Éleveur</div>
            <div className="text-xs text-white/70 mt-1">Je veux vendre mon bétail</div>
            <div className="text-[10px] text-blue-600 font-semibold mt-2 px-2 py-1 bg-blue-50 rounded-full inline-block">Gratuit</div>
          </button>
          
          <button
            type="button"
            onClick={() => setRole('ACHETEUR')}
            aria-pressed={role === 'ACHETEUR'}
            className={`cursor-pointer p-4 rounded-lg border-2 text-center transition-all focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] ${
              role === 'ACHETEUR'
                ? 'border-[#2D6A4F] bg-white/10'
                : 'border-white/20 hover:border-[#2D6A4F]/50'
            }`}
          >
            <div className="text-4xl mb-2" role="img" aria-hidden="true">📭</div>
            <div className="font-bold text-sm">Client</div>
            <div className="text-xs text-white/70 mt-1">Je cherche du bétail</div>
            <div className="text-[10px] text-white font-bold font-semibold mt-2">Gratuit</div>
          </button>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
            Nom complet
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-white/50" />
            </div>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
              className="pl-10 w-full px-3 py-2 border border-white/30 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F]"
              placeholder="Modou Ndiaye"
            />
          </div>
        </div>

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
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="pl-10 w-full px-3 py-2 border border-white/30 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F]"
              placeholder="votre@email.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-white mb-1">
            Téléphone (Optionnel)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-white/50" />
            </div>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
              className="pl-10 w-full px-3 py-2 border border-white/30 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F]"
              placeholder="+221 77 123 45 67"
            />
          </div>
        </div>

        {role === 'ELEVEUR' && (
          <div className="p-4 bg-white/10 border border-[#2D6A4F]/20 rounded-lg space-y-4">
            <h3 className="text-sm font-semibold text-white font-bold border-b border-[#2D6A4F]/10 pb-2">Vérification d'identité (Requis pour les éleveurs)</h3>
            
            <div>
              <label htmlFor="idCardNumber" className="block text-sm font-medium text-white mb-1">
                Numéro de Carte Nationale d'Identité
              </label>
              <input
                id="idCardNumber"
                type="text"
                name="idCardNumber"
                value={formData.idCardNumber}
                onChange={handleChange}
                required={role === 'ELEVEUR'}
                className="w-full px-3 py-2 border border-white/30 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F]"
                placeholder="Ex: 1 234 1990 12345 67"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Localisation (Requis pour la mise en relation)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required={role === 'ELEVEUR'}
                  className="flex-1 px-3 py-2 border border-white/30 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F] bg-white/10 text-white placeholder:text-white/50"
                  placeholder="Ex: Touba, Dakar..."
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="px-4 py-2 bg-[#2D6A4F] text-white rounded-md hover:bg-[#1B4332] transition-colors flex items-center justify-center min-w-[140px]"
                >
                  {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Me localiser'}
                </button>
              </div>
              <p className="text-xs text-white/70 mt-1">
                Cela permet aux clients de trouver les animaux proches de chez eux.
              </p>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
            Mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-white/50" />
            </div>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className="pl-10 w-full px-3 py-2 border border-white/30 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F]"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-1">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CheckCircle2 className="h-5 w-5 text-white/50" />
            </div>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className="pl-10 w-full px-3 py-2 border border-white/30 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F]"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#2D6A4F] text-white py-2 px-4 rounded-md hover:bg-[#1f4a37] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D6A4F] disabled:opacity-50 mt-6"
        >
          {isLoading ? 'Création en cours...' : 'Créer mon compte'}
        </button>
      </form>
      )}

      <p className="mt-6 text-center text-sm text-white/80">
        Déjà un compte ?{' '}
        <Link href="/connexion" className="text-white font-bold font-medium hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}

export default function InscriptionPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-white font-bold" /></div>}>
      <InscriptionForm />
    </Suspense>
  );
}
