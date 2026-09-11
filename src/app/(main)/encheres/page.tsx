'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, MapPin, Tag, Gavel } from 'lucide-react';

type Auction = {
  id: string;
  currentPrice: number;
  endDate: string;
  listing: {
    title: string;
    city: string;
    country: string;
    images: { url: string }[];
    category: { name: string };
  };
  _count: {
    bids: number;
  };
};

export default function EncheresPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await fetch('/api/encheres');
        if (res.ok) {
          const data = await res.json();
          setAuctions(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des enchères', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const calculateTimeLeft = (endDate: string) => {
    const difference = new Date(endDate).getTime() - new Date().getTime();
    if (difference <= 0) return 'Terminé';

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);

    if (days > 0) return `${days}j ${hours}h restants`;
    if (hours > 0) return `${hours}h ${minutes}m restants`;
    return `${minutes} minutes restantes`;
  };

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] bg-[#2D6A4F] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#2D6A4F] pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Enchères en Direct</h1>
            <p className="text-white/80">Participez aux enchères et obtenez le meilleur bétail au meilleur prix.</p>
          </div>
        <Link
          href="/encheres/nouvelle"
          className="inline-flex items-center justify-center px-5 py-3 bg-[#D4A843] hover:bg-[#b08b35] text-white font-bold rounded-xl shadow-md transition-colors gap-2"
        >
          <Gavel size={20} />
          Mettre aux enchères
        </Link>
      </div>

        {auctions.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md p-12 text-center rounded-xl shadow-sm border border-white/20">
            <Clock className="mx-auto h-12 w-12 text-white/50 mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">Aucune enchère en cours</h3>
            <p className="text-white/70">Revenez plus tard pour découvrir de nouvelles offres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {auctions.map((auction) => (
              <Link key={auction.id} href={`/encheres/${auction.id}`} className="group">
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-48 w-full bg-gray-100">
                    {auction.listing.images && auction.listing.images.length > 0 ? (
                      <Image
                        src={auction.listing.images[0].url}
                        alt={auction.listing.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Tag className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Clock size={12} />
                      {calculateTimeLeft(auction.endDate)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="text-xs text-[#D4A843] font-medium mb-1">
                      {auction.listing.category?.name || 'Bétail'}
                    </div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#2D6A4F] transition-colors">
                      {auction.listing.title}
                    </h3>
                    
                    <div className="flex items-center text-gray-500 text-xs mb-4 gap-1">
                      <MapPin size={12} />
                      <span>{auction.listing.city || auction.listing.country || 'Sénégal'}</span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Prix actuel ({auction._count.bids} offres)</div>
                        <div className="font-bold text-lg text-[#2D6A4F]">
                          {auction.currentPrice.toLocaleString('fr-FR')} FCFA
                        </div>
                      </div>
                    </div>
                    
                    <button className="mt-4 w-full bg-[#D4A843] hover:bg-[#b58f39] text-white font-medium py-2 px-4 rounded-lg transition-colors">
                      Enchérir
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
