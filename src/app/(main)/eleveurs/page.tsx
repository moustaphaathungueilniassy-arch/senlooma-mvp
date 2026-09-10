'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, ShieldCheck, User, Loader2, ChevronRight, Star } from 'lucide-react';

interface Eleveur {
  id: string;
  name: string;
  avatar: string | null;
  location: string;
  verified: boolean;
  averageRating: number;
  _count?: {
    listings: number;
    reviewsReceived: number;
  };
}

export default function EleveursPage() {
  const [eleveurs, setEleveurs] = useState<Eleveur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchEleveurs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/eleveurs?page=${page}&limit=12&search=${encodeURIComponent(searchTerm)}`);
        if (res.ok) {
          const result = await res.json();
          const data = Array.isArray(result) ? result : (result.data || []);
          
          if (page === 1) {
            setEleveurs(data);
          } else {
            setEleveurs(prev => [...prev, ...data]);
          }
          
          setHasMore(data.length === 12); // Assuming 12 per page
        }
      } catch (error) {
        console.error('Erreur', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce manual implementation for search
    const timer = setTimeout(() => {
      if (page === 1) fetchEleveurs();
    }, 300);
    
    if (page > 1) {
      fetchEleveurs();
    }
    
    return () => clearTimeout(timer);
  }, [searchTerm, page]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const loadMore = () => setPage(prev => prev + 1);

  return (
    <div className="container mx-auto px-4 py-8 bg-[#FAFAF5] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#2D6A4F] mb-4 md:mb-0">Annuaire des Éleveurs</h1>
        
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            aria-label="Rechercher un éleveur par nom ou ville"
            placeholder="Rechercher par nom ou ville..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F]"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {loading && page === 1 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-[#2D6A4F]" />
        </div>
      ) : eleveurs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {eleveurs.map((eleveur) => (
              <Link href={`/eleveurs/${eleveur.id}`} key={eleveur.id}>
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 text-center border border-gray-100 flex flex-col items-center h-full">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-100 flex-shrink-0">
                    {eleveur.avatar ? (
                      <img src={eleveur.avatar} alt={eleveur.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#2D6A4F] text-white">
                        <User className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-900 flex items-center justify-center mb-1">
                    {eleveur.name}
                    {eleveur.verified && <ShieldCheck className="w-5 h-5 text-[#D4A843] ml-1" />}
                  </h3>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {eleveur.location || 'Lieu non spécifié'}
                  </div>

                  <div className="flex items-center text-sm mb-4">
                    <Star className="w-4 h-4 mr-1 text-[#D4A843] fill-[#D4A843]" />
                    <span className="font-medium text-gray-900 mr-1">{eleveur.averageRating > 0 ? eleveur.averageRating : 'Nouveau'}</span>
                    <span className="text-gray-500">({eleveur._count?.reviewsReceived || 0} avis)</span>
                  </div>
                  
                  <div className="mt-auto pt-4 w-full border-t border-gray-50 text-sm">
                    <span className="font-semibold text-[#2D6A4F]">{eleveur._count?.listings || 0}</span> annonces actives
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {hasMore && (
            <div className="text-center">
              <button 
                onClick={loadMore}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-[#2D6A4F] text-[#2D6A4F] font-medium rounded-lg hover:bg-[#2D6A4F] hover:text-white transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : 'Voir plus d\'éleveurs'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900">Aucun éleveur trouvé</h3>
          <p className="text-gray-500 mt-2">Essayez de modifier vos critères de recherche.</p>
        </div>
      )}
    </div>
  );
}
