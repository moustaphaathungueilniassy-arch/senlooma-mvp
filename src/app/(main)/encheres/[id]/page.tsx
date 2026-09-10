'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Clock, Tag, MapPin, ArrowLeft, TrendingUp, AlertCircle, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

type Bid = {
  id: string;
  amount: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
};

type Auction = {
  id: string;
  currentPrice: number;
  minIncrement: number;
  endDate: string;
  status: string;
  listing: {
    id: string;
    title: string;
    description: string;
    city: string;
    country: string;
    images: { url: string }[];
    category: { name: string };
    user: {
      id: string;
      name: string;
      avatar: string;
      phone: string;
    };
  };
  bids: Bid[];
};

export default function EnchereDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const [bidAmount, setBidAmount] = useState<number | ''>('');
  const [biddingLoading, setBiddingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAuction = async () => {
    try {
      const res = await fetch(`/api/encheres/${params?.id}`);
      if (res.ok) {
        const data = await res.json();
        setAuction(data);
        if (bidAmount === '') {
          setBidAmount(data.currentPrice + data.minIncrement);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuction();
    // Polling toutes les 5 secondes pour actualiser les offres
    const interval = setInterval(fetchAuction, 5000);
    return () => clearInterval(interval);
  }, [params?.id]);

  useEffect(() => {
    if (!auction) return;

    const calculateTimeLeft = () => {
      const difference = new Date(auction.endDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [auction?.endDate]);

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push('/connexion');
      return;
    }

    if (!auction) return;
    
    const amount = Number(bidAmount);
    if (amount < auction.currentPrice + auction.minIncrement) {
      setError(`Le montant minimum est de ${auction.currentPrice + auction.minIncrement} FCFA`);
      return;
    }

    setBiddingLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/encheres/${params?.id}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du placement de l\'offre');
      }

      setSuccess('Votre offre a été placée avec succès !');
      setBidAmount(amount + auction.minIncrement);
      fetchAuction(); // Actualiser immédiatement
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBiddingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2D6A4F]"></div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Enchère introuvable</h2>
        <Link href="/encheres" className="text-[#2D6A4F] hover:underline">
          Retour aux enchères
        </Link>
      </div>
    );
  }

  const isOwner = session?.user?.id === auction.listing.user.id;
  const isFinished = new Date() > new Date(auction.endDate) || auction.status !== 'EN_COURS';

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/encheres" className="inline-flex items-center text-gray-600 hover:text-[#2D6A4F] mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" />
        Retour aux enchères
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne Gauche: Images et Infos Annonce */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="relative h-96 w-full bg-gray-100">
              {auction.listing.images && auction.listing.images.length > 0 ? (
                <Image
                  src={auction.listing.images[0].url}
                  alt={auction.listing.title}
                  fill
                  className="object-contain bg-gray-900"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  Aucune image
                </div>
              )}
            </div>
            
            <div className="p-6 text-gray-900">
              <div className="flex items-center gap-2 text-sm text-[#D4A843] font-semibold mb-3">
                <Tag size={16} />
                <span>{auction.listing.category?.name}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{auction.listing.title}</h1>
              
              <div className="flex items-center text-gray-500 mb-6 gap-2">
                <MapPin size={18} />
                <span>{auction.listing.city || auction.listing.country || 'Sénégal'}</span>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{auction.listing.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Droite: Système d'enchères */}
        <div className="space-y-6">
          {/* Cadre d'enchère */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            {isFinished ? (
              <div className="bg-gray-100 rounded-xl p-4 text-center mb-6 border border-gray-200">
                <div className="font-bold text-gray-700">Enchère terminée</div>
                <div className="text-sm text-gray-500 mt-1">
                  Prix final: {auction.currentPrice.toLocaleString('fr-FR')} FCFA
                </div>
              </div>
            ) : (
              <div className="bg-red-50 rounded-xl p-4 text-center mb-6 border border-red-100">
                <div className="flex items-center justify-center gap-2 text-red-600 font-bold mb-2">
                  <Clock size={20} />
                  <span>Temps restant</span>
                </div>
                {timeLeft ? (
                  <div className="flex justify-center gap-3 text-red-700 font-mono text-xl">
                    <div className="flex flex-col"><span className="font-bold">{timeLeft.d}</span><span className="text-[10px] uppercase">Jours</span></div>:
                    <div className="flex flex-col"><span className="font-bold">{timeLeft.h}</span><span className="text-[10px] uppercase">Heures</span></div>:
                    <div className="flex flex-col"><span className="font-bold">{timeLeft.m}</span><span className="text-[10px] uppercase">Min</span></div>:
                    <div className="flex flex-col"><span className="font-bold">{timeLeft.s}</span><span className="text-[10px] uppercase">Sec</span></div>
                  </div>
                ) : (
                  <div className="font-bold">Calcul en cours...</div>
                )}
              </div>
            )}

            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-1">Prix actuel</div>
              <div className="text-4xl font-bold text-[#2D6A4F]">
                {auction.currentPrice.toLocaleString('fr-FR')} <span className="text-xl">FCFA</span>
              </div>
            </div>

            {!isFinished && (
              <form onSubmit={handleBid} className="space-y-4">
                {isOwner ? (
                  <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p>Ceci est votre annonce. Vous ne pouvez pas enchérir sur votre propre bétail.</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                        Votre offre (Min. {(auction.currentPrice + auction.minIncrement).toLocaleString('fr-FR')} FCFA)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="amount"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(Number(e.target.value))}
                          min={auction.currentPrice + auction.minIncrement}
                          step={auction.minIncrement}
                          className="w-full rounded-lg border-gray-300 pl-4 pr-16 py-3 focus:border-[#2D6A4F] focus:ring-[#2D6A4F]"
                          placeholder="Entrez un montant"
                          required
                        />
                        <div className="absolute right-4 top-3 text-gray-500 font-medium">
                          FCFA
                        </div>
                      </div>
                    </div>
                    
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    {success && <div className="text-green-600 text-sm bg-green-50 p-2 rounded">{success}</div>}

                    <button
                      type="submit"
                      disabled={biddingLoading}
                      className="w-full bg-[#D4A843] hover:bg-[#b58f39] text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                      {biddingLoading ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <TrendingUp size={20} />
                          Placer une offre
                        </>
                      )}
                    </button>
                  </>
                )}
              </form>
            )}

            {/* Historique des offres */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
                Historique des offres
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {auction.bids.length}
                </span>
              </h3>
              
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {auction.bids.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">Aucune offre pour le moment. Soyez le premier !</p>
                ) : (
                  auction.bids.map((bid, index) => (
                    <div key={bid.id} className={`flex items-center justify-between p-3 rounded-lg ${index === 0 ? 'bg-green-50 border border-green-100' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                          {bid.user.avatar ? (
                            <Image src={bid.user.avatar} alt={bid.user.name} width={32} height={32} />
                          ) : (
                            <UserIcon size={16} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{bid.user.name || 'Utilisateur'} {bid.user.id === session?.user?.id && '(Vous)'}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(bid.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className={`font-bold ${index === 0 ? 'text-[#2D6A4F]' : 'text-gray-700'}`}>
                        {bid.amount.toLocaleString('fr-FR')} FCFA
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
