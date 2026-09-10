'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Gavel, ArrowLeft, AlertCircle, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';

type Listing = {
  id: string;
  title: string;
  price: number;
  category: { name: string };
  images: { url: string }[];
  auction: any | null;
};

export default function NouvelleEncherePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  const [selectedListingId, setSelectedListingId] = useState('');
  const [startPrice, setStartPrice] = useState<number | ''>('');
  const [minIncrement, setMinIncrement] = useState<number>(500);
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Charger les annonces de l'éleveur qui n'ont pas encore d'enchère
  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const res = await fetch('/api/annonces/mes-annonces');
        if (res.ok) {
          const data = await res.json();
          // Filtrer : seulement les annonces actives sans enchère
          const available = data.filter((l: Listing) => !l.auction);
          setListings(available);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingListings(false);
      }
    };

    if (session?.user) {
      fetchMyListings();
    }
  }, [session]);

  // Pré-remplir le prix de départ quand on sélectionne une annonce
  useEffect(() => {
    if (selectedListingId) {
      const listing = listings.find(l => l.id === selectedListingId);
      if (listing && startPrice === '') {
        setStartPrice(listing.price);
      }
    }
  }, [selectedListingId]);

  // Calculer la date minimum (maintenant + 1h)
  const getMinDate = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!selectedListingId) {
      setError('Veuillez sélectionner une annonce.');
      setIsSubmitting(false);
      return;
    }

    if (!startPrice || startPrice <= 0) {
      setError('Veuillez entrer un prix de départ valide.');
      setIsSubmitting(false);
      return;
    }

    if (!endDate) {
      setError('Veuillez choisir une date de fin.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/encheres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: selectedListingId,
          startPrice: Number(startPrice),
          minIncrement: Number(minIncrement),
          endDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création de l\'enchère');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/encheres/${data.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || loadingListings) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#2D6A4F]" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
        <Link href="/connexion" className="text-[#2D6A4F] hover:underline">
          Se connecter
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-green-50 rounded-2xl p-8 max-w-md mx-auto border border-green-200">
          <Gavel className="mx-auto h-16 w-16 text-green-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enchère créée avec succès !</h2>
          <p className="text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/encheres" className="inline-flex items-center text-gray-600 hover:text-[#2D6A4F] mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" />
        Retour aux enchères
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#2D6A4F] p-6 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Gavel size={28} />
            Mettre aux enchères
          </h1>
          <p className="text-white/80 mt-2">Sélectionnez une de vos annonces et définissez les paramètres de l'enchère.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sélection de l'annonce */}
          <div>
            <label htmlFor="listing" className="block text-sm font-semibold text-gray-700 mb-2">
              Choisir une annonce <span className="text-red-500">*</span>
            </label>
            {listings.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">Aucune annonce disponible</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Vous devez d'abord <Link href="/annonces/nouvelle" className="underline font-medium">publier une annonce</Link> avant de pouvoir créer une enchère.
                  </p>
                </div>
              </div>
            ) : (
              <select
                id="listing"
                value={selectedListingId}
                onChange={(e) => setSelectedListingId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#2D6A4F] focus:ring focus:ring-[#2D6A4F] focus:ring-opacity-50"
                required
              >
                <option value="">Sélectionnez une annonce...</option>
                {listings.map((listing) => (
                  <option key={listing.id} value={listing.id}>
                    {listing.title} — {listing.price.toLocaleString('fr-FR')} FCFA ({listing.category.name})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Prix de départ */}
          <div>
            <label htmlFor="startPrice" className="block text-sm font-semibold text-gray-700 mb-2">
              Prix de départ (FCFA) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="startPrice"
                type="number"
                value={startPrice}
                onChange={(e) => setStartPrice(Number(e.target.value))}
                min={1}
                placeholder="Ex: 500000"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-16 focus:border-[#2D6A4F] focus:ring focus:ring-[#2D6A4F] focus:ring-opacity-50"
                required
              />
              <span className="absolute right-4 top-3 text-gray-400 font-medium">FCFA</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">C'est le prix à partir duquel les clients pourront commencer à enchérir.</p>
          </div>

          {/* Incrément minimum */}
          <div>
            <label htmlFor="minIncrement" className="block text-sm font-semibold text-gray-700 mb-2">
              Incrément minimum (FCFA)
            </label>
            <div className="relative">
              <input
                id="minIncrement"
                type="number"
                value={minIncrement}
                onChange={(e) => setMinIncrement(Number(e.target.value))}
                min={100}
                step={100}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-16 focus:border-[#2D6A4F] focus:ring focus:ring-[#2D6A4F] focus:ring-opacity-50"
              />
              <span className="absolute right-4 top-3 text-gray-400 font-medium">FCFA</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Chaque offre doit être supérieure d'au moins ce montant. Par défaut : 500 FCFA.</p>
          </div>

          {/* Date de fin */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Date et heure de fin <span className="text-red-500">*</span>
            </label>
            <input
              id="endDate"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={getMinDate()}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#2D6A4F] focus:ring focus:ring-[#2D6A4F] focus:ring-opacity-50"
              required
            />
            <p className="text-xs text-gray-500 mt-1">L'enchère se clôturera automatiquement à cette date. Le meilleur offrant remporte le bétail.</p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Bouton soumettre */}
          <button
            type="submit"
            disabled={isSubmitting || listings.length === 0}
            className="w-full py-4 bg-[#D4A843] hover:bg-[#b08b35] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-md transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Création en cours...</>
            ) : (
              <><TrendingUp size={22} /> Lancer l'enchère</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
