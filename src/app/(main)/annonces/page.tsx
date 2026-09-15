'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, MapPin, Filter, Clock, Loader2, AlertCircle, RefreshCw, LayoutGrid, Map as MapIcon, ChevronUp, ChevronDown } from 'lucide-react';
import { formatPrice, formatRelativeDate } from '@/lib/utils';
import Map from '@/components/ui/Map';
import FavoriteButton from '@/components/ui/FavoriteButton';

interface Annonce {
  id: string;
  title: string;
  price: number;
  category: { name: string };
  city: string;
  images: { url: string }[];
  createdAt: string;
}

function AnnoncesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [filters, setFilters] = useState({
    categoryId: searchParams?.get('categoryId') || '',
    minPrice: searchParams?.get('minPrice') || '',
    maxPrice: searchParams?.get('maxPrice') || '',
    minWeight: searchParams?.get('minWeight') || '',
    maxWeight: searchParams?.get('maxWeight') || '',
    minAge: searchParams?.get('minAge') || '',
    maxAge: searchParams?.get('maxAge') || '',
    sex: searchParams?.get('sex') || '',
    city: searchParams?.get('city') || '',
    search: searchParams?.get('search') || '',
    breed: searchParams?.get('breed') || ''
  });
  
  // Update URL and fetch when debounced filters change
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const fetchAnnonces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (debouncedFilters.categoryId) queryParams.set('categoryId', debouncedFilters.categoryId);
      if (debouncedFilters.minPrice) queryParams.set('minPrice', debouncedFilters.minPrice);
      if (debouncedFilters.maxPrice) queryParams.set('maxPrice', debouncedFilters.maxPrice);
      if (debouncedFilters.minWeight) queryParams.set('minWeight', debouncedFilters.minWeight);
      if (debouncedFilters.maxWeight) queryParams.set('maxWeight', debouncedFilters.maxWeight);
      if (debouncedFilters.minAge) queryParams.set('minAge', debouncedFilters.minAge);
      if (debouncedFilters.maxAge) queryParams.set('maxAge', debouncedFilters.maxAge);
      if (debouncedFilters.sex) queryParams.set('sex', debouncedFilters.sex);
      if (debouncedFilters.city) queryParams.set('city', debouncedFilters.city);
      if (debouncedFilters.search) queryParams.set('search', debouncedFilters.search);
      if (debouncedFilters.breed) queryParams.set('breed', debouncedFilters.breed);
      
      // Update URL
      router.replace(`?${queryParams.toString()}`, { scroll: false });

      const res = await fetch(`/api/annonces?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Erreur réseau');
      
      const result = await res.json();
      setAnnonces(result.data || []);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors du chargement des annonces');
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters]);

  useEffect(() => {
    fetchAnnonces();
  }, [fetchAnnonces]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#2D6A4F] pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white">Marché au bétail</h1>
        
        {/* Toggle Vue Grille / Vue Carte */}
        <div className="flex bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-1 shadow-sm w-fit">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              viewMode === 'grid' 
                ? 'bg-[#2D6A4F] text-white shadow' 
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Grille</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              viewMode === 'map' 
                ? 'bg-[#2D6A4F] text-white shadow' 
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <MapIcon className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Carte</span>
          </button>
        </div>
      </div>

      {/* Catégories (Onglets) */}
      <div className="flex overflow-x-auto space-x-2 pb-4 mb-6 scrollbar-hide">
        {[
          { id: '', name: 'Toutes les catégories', icon: '🐾' },
          { id: 'bovins', name: 'Bovins', icon: '🐂' },
          { id: 'ovins', name: 'Ovins', icon: '🐑' },
          { id: 'caprins', name: 'Caprins', icon: '🐐' },
          { id: 'volailles', name: 'Volailles', icon: '🐔' },
          { id: 'equins', name: 'Équins', icon: '🐴' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilters(prev => ({ ...prev, categoryId: cat.id }))}
            className={`flex items-center flex-shrink-0 px-5 py-3 rounded-full border transition-all ${
              filters.categoryId === cat.id 
                ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-md scale-[1.02]' 
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            <span className="mr-2 text-xl" role="img" aria-label={cat.name}>{cat.icon}</span>
            <span className="font-semibold whitespace-nowrap">{cat.name}</span>
          </button>
        ))}
      </div>
      
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filtres */}
        <div className="w-full md:w-64 space-y-6">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-sm border border-white/20 text-white">
            <div className="flex justify-between items-center mb-4 md:mb-0">
              <h2 className="text-lg font-semibold flex items-center">
                <Filter className="w-5 h-5 mr-2 text-[#D4A843]" />
                Filtres
              </h2>
              <button 
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                className="md:hidden flex items-center text-sm font-medium bg-white/10 px-3 py-1.5 rounded border border-white/20"
              >
                {isMobileFiltersOpen ? (
                  <><ChevronUp className="w-4 h-4 mr-1" /> Masquer</>
                ) : (
                  <><ChevronDown className="w-4 h-4 mr-1" /> Afficher</>
                )}
              </button>
            </div>
            
            <div className={`space-y-4 ${isMobileFiltersOpen ? 'block mt-4' : 'hidden'} md:block md:mt-4`}>
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-white/90 mb-1">Mot clé</label>
                <input 
                  id="search"
                  type="text" 
                  name="search" 
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Rechercher..."
                  className="w-full bg-white/10 border-white/20 text-white placeholder-white/50 rounded-md shadow-sm focus:border-white focus:ring focus:ring-white focus:ring-opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Ville / Région</label>
                <select
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  className="w-full bg-white/10 border-white/20 text-white rounded-md shadow-sm focus:border-white focus:ring focus:ring-white focus:ring-opacity-50 [&>option]:text-gray-900"
                >
                  <option value="">Toutes les régions</option>
                  <option value="Dakar">Dakar</option>
                  <option value="Thiès">Thiès</option>
                  <option value="Touba">Touba</option>
                  <option value="Saint-Louis">Saint-Louis</option>
                  <option value="Diourbel">Diourbel</option>
                  <option value="Kaolack">Kaolack</option>
                  <option value="Ziguinchor">Ziguinchor</option>
                  <option value="Fatick">Fatick</option>
                  <option value="Kolda">Kolda</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Race</label>
                <select
                  name="breed"
                  value={filters.breed}
                  onChange={handleFilterChange}
                  className="w-full bg-white/10 border-white/20 text-white rounded-md shadow-sm focus:border-white focus:ring focus:ring-white focus:ring-opacity-50 [&>option]:text-gray-900"
                >
                  <option value="">Toutes les races</option>
                  <option value="Ladoum">Ladoum</option>
                  <option value="Bali-Bali">Bali-Bali</option>
                  <option value="Touabire">Touabire</option>
                  <option value="Azawak">Azawak</option>
                  <option value="Guzerat">Guzerat</option>
                  <option value="Peulh">Peulh</option>
                  <option value="Local">Local</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Sexe</label>
                <select
                  name="sex"
                  value={filters.sex}
                  onChange={handleFilterChange}
                  className="w-full bg-white/10 border-white/20 text-white rounded-md shadow-sm focus:border-white focus:ring focus:ring-white focus:ring-opacity-50 [&>option]:text-gray-900"
                >
                  <option value="">Tous</option>
                  <option value="MALE">Mâle</option>
                  <option value="FEMELLE">Femelle</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-white/90 mb-1">Prix Min</label>
                  <input 
                    type="number" 
                    name="minPrice" 
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="w-full bg-white/10 border-white/20 text-white placeholder-white/50 rounded-md shadow-sm focus:border-white focus:ring focus:ring-white focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/90 mb-1">Prix Max</label>
                  <input 
                    type="number" 
                    name="maxPrice" 
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="w-full bg-white/10 border-white/20 text-white placeholder-white/50 rounded-md shadow-sm focus:border-white focus:ring focus:ring-white focus:ring-opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-white/90 mb-1">Poids Min (kg)</label>
                  <input 
                    type="number" 
                    name="minWeight" 
                    value={filters.minWeight}
                    onChange={handleFilterChange}
                    className="w-full bg-white/10 border-white/20 text-white placeholder-white/50 rounded-md shadow-sm focus:border-white focus:ring focus:ring-white focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/90 mb-1">Poids Max (kg)</label>
                  <input 
                    type="number" 
                    name="maxWeight" 
                    value={filters.maxWeight}
                    onChange={handleFilterChange}
                    className="w-full bg-white/10 border-white/20 text-white placeholder-white/50 rounded-md shadow-sm focus:border-white focus:ring focus:ring-white focus:ring-opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-white/90 mb-1">Âge Min (mois)</label>
                  <input 
                    type="number" 
                    name="minAge" 
                    value={filters.minAge}
                    onChange={handleFilterChange}
                    className="w-full bg-white/10 border-white/20 text-white placeholder-white/50 rounded-md shadow-sm focus:border-white focus:ring focus:ring-white focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/90 mb-1">Âge Max</label>
                  <input 
                    type="number" 
                    name="maxAge" 
                    value={filters.maxAge}
                    onChange={handleFilterChange}
                    className="w-full bg-white/10 border-white/20 text-white placeholder-white/50 rounded-md shadow-sm focus:border-white focus:ring focus:ring-white focus:ring-opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#2D6A4F]" />
            </div>
          ) : error ? (
            <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-100 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">Erreur</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button 
                onClick={fetchAnnonces}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </button>
            </div>
          ) : annonces.length > 0 ? (
            viewMode === 'map' ? (
              <div className="h-[600px] w-full bg-white/10 backdrop-blur-md rounded-lg shadow-sm border border-white/20 text-white p-2">
                <Map 
                  annonces={annonces.map(a => ({
                    id: a.id,
                    title: a.title,
                    price: a.price,
                    city: a.city,
                    animalType: a.category?.name
                  }))} 
                  height="100%" 
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {annonces.map((annonce) => (
                  <Link href={`/annonces/${annonce.id}`} key={annonce.id} className="group">
                    <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-sm border border-white/20 text-white overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative h-48 w-full bg-gray-200">
                        {annonce.images && annonce.images[0]?.url ? (
                          <img 
                            src={annonce.images[0].url} 
                            alt={annonce.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/50">
                            Pas d'image
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
                          <div className="bg-white/90 px-2 py-1 rounded text-xs font-semibold text-[#2D6A4F] shadow-sm">
                            {annonce.category?.name || 'Inconnue'}
                          </div>
                          <FavoriteButton listingId={annonce.id} iconSize={16} className="shadow-sm" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-white mb-1 truncate">{annonce.title}</h3>
                        <p className="text-xl font-bold text-[#D4A843] mb-3">
                          {formatPrice(annonce.price)}
                        </p>
                        
                        <div className="flex items-center text-sm text-white/70 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="truncate">{annonce.city}</span>
                        </div>
                        <div className="flex items-center text-sm text-white/70">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{formatRelativeDate(annonce.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : (
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-sm border border-white/20 text-center">
              <Search className="w-12 h-12 text-white/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Aucune annonce trouvée</h3>
              <p className="text-white/70">Essayez de modifier vos filtres pour voir plus de résultats.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

export default function AnnoncesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D6A4F]" />
      </div>
    }>
      <AnnoncesContent />
    </Suspense>
  );
}
