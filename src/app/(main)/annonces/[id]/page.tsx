'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, MessageCircle, Tag, Scale, Ruler, Users, ChevronLeft, Loader2, ShieldCheck, Star, Phone } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Map from '@/components/ui/Map';
import { getCoordinatesForCity } from '@/lib/coordinates';

interface AnnonceDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  category: { name: string };
  breed: string;
  age: string;
  weight: number;
  sex: string;
  quantity: number;
  city: string;
  images: { id: string; url: string; listingId: string }[];
  status: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
    phone: string | null;
    location: string | null;
    verified: boolean;
    averageRating: number;
    totalReviews: number;
  };
}

export default function AnnonceDetailPage() {
  const params = useParams();
  const [annonce, setAnnonce] = useState<AnnonceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        const res = await fetch(`/api/annonces/${params?.id}`);
        if (res.ok) {
          const data = await res.json();
          setAnnonce(data.data || data); // Just in case it's nested
        }
      } catch (error) {
        console.error('Erreur de chargement', error);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchAnnonce();
    }
  }, [params?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#2D6A4F]" />
      </div>
    );
  }

  if (!annonce) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Annonce introuvable</h1>
        <Link href="/annonces" className="text-[#2D6A4F] hover:underline">
          Retour aux annonces
        </Link>
      </div>
    );
  }

  const coordinates = getCoordinatesForCity(annonce.city || annonce.user.location);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/annonces" className="inline-flex items-center text-sm text-gray-500 hover:text-[#2D6A4F] mb-6">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Retour aux annonces
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne de gauche: Images */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-100 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center">
            {annonce.images && annonce.images.length > 0 ? (
              <img 
                src={annonce.images[activeImage].url} 
                alt={annonce.title} 
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-gray-400">Aucune image</span>
            )}
          </div>
          
          {annonce.images && annonce.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {annonce.images.map((img, idx) => (
                <button 
                  key={img.id || idx}
                  onClick={() => setActiveImage(idx)}
                  className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 ${activeImage === idx ? 'border-[#2D6A4F]' : 'border-transparent'}`}
                >
                  <img src={img.url} alt={`Miniature ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{annonce.description}</p>
          </div>
        </div>

        {/* Colonne de droite: Infos et Action */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <span className="inline-block px-3 py-1 bg-[#2D6A4F]/10 text-[#2D6A4F] text-sm font-semibold rounded-full">
                {annonce.category?.name || 'Inconnue'}
              </span>
              {annonce.status !== 'ACTIVE' && (
                <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                  {annonce.status}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{annonce.title}</h1>
            <p className="text-3xl font-bold text-[#D4A843] mb-6">
              {formatPrice(annonce.price)}
            </p>

            <Link href={`/tableau-de-bord/messages?user=${annonce.user.id}&listing=${annonce.id}`} className="w-full py-3 px-4 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-lg font-semibold flex items-center justify-center transition-colors mb-3">
              <MessageCircle className="w-5 h-5 mr-2" />
              Message privé
            </Link>
            
            {annonce.user.phone && (
              <a href={`tel:${annonce.user.phone.replace(/\s+/g, '')}`} className="w-full py-3 px-4 bg-[#D4A843] hover:bg-[#b08b35] text-white rounded-lg font-semibold flex items-center justify-center transition-colors mb-6">
                <Phone className="w-5 h-5 mr-2" />
                {annonce.user.phone}
              </a>
            )}

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 mb-2 border-b pb-2">Détails du bétail</h3>
              
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-500"><Tag className="w-4 h-4 mr-2" /> Race</span>
                <span className="font-medium text-gray-900">{annonce.breed || 'Non spécifié'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-500"><Ruler className="w-4 h-4 mr-2" /> Âge</span>
                <span className="font-medium text-gray-900">{annonce.age || 'Non spécifié'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-500"><Scale className="w-4 h-4 mr-2" /> Poids</span>
                <span className="font-medium text-gray-900">{annonce.weight ? `${annonce.weight} kg` : 'Non spécifié'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-500"><Users className="w-4 h-4 mr-2" /> Sexe</span>
                <span className="font-medium text-gray-900">{annonce.sex || 'Non spécifié'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-500"><Users className="w-4 h-4 mr-2" /> Quantité</span>
                <span className="font-medium text-gray-900">{annonce.quantity}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Emplacement</h3>
            <div className="h-48 mb-4 rounded-lg overflow-hidden border border-gray-200">
              <Map center={coordinates} singleMode={true} zoom={11} height="100%" />
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
              {annonce.city || annonce.user.location || 'Lieu non spécifié'}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">À propos de l'éleveur</h3>
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden mr-4">
                {annonce.user.avatar ? (
                  <img src={annonce.user.avatar} alt={annonce.user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#2D6A4F] text-white text-xl font-bold">
                    {annonce.user.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 flex items-center">
                  {annonce.user.name}
                  {annonce.user.verified && <ShieldCheck className="w-4 h-4 text-[#D4A843] ml-1" />}
                </h4>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {annonce.user.location || annonce.city || 'Lieu non spécifié'}
                </div>
                <div className="flex items-center text-sm mt-1">
                  <Star className="w-4 h-4 mr-1 text-[#D4A843] fill-[#D4A843]" />
                  <span className="font-medium text-gray-900 mr-1">{annonce.user.averageRating > 0 ? annonce.user.averageRating : 'Nouveau'}</span>
                  <span className="text-gray-500">({annonce.user.totalReviews} avis)</span>
                </div>
              </div>
            </div>
            <Link href={`/eleveurs/${annonce.user.id}`} className="w-full py-2 px-4 border border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#2D6A4F]/5 rounded-lg font-medium transition-colors block text-center">
              Voir le profil et les avis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
