'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  listingId: string;
  className?: string;
  iconSize?: number;
}

export default function FavoriteButton({ listingId, className = '', iconSize = 20 }: FavoriteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    const checkFavorite = async () => {
      try {
        const res = await fetch(`/api/favoris/check?listingId=${listingId}`);
        if (res.ok) {
          const data = await res.json();
          setIsFavorited(data.isFavorited);
        }
      } catch (error) {
        console.error('Erreur check favoris', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFavorite();
  }, [listingId, session]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Pour ne pas suivre le <Link> si le bouton est dans une carte
    e.stopPropagation();

    if (!session?.user) {
      router.push('/connexion');
      return;
    }

    // Mise à jour optimiste
    setIsFavorited(!isFavorited);

    try {
      const res = await fetch('/api/favoris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });

      if (!res.ok) {
        // Rollback si erreur
        setIsFavorited(isFavorited);
      }
    } catch (error) {
      // Rollback si erreur
      setIsFavorited(isFavorited);
    }
  };

  if (isLoading) return <div className={`w-${iconSize/4} h-${iconSize/4} animate-pulse bg-gray-200 rounded-full`} />;

  return (
    <button
      onClick={toggleFavorite}
      className={`p-2 rounded-full transition-colors flex items-center justify-center ${
        isFavorited 
          ? 'bg-red-50 text-red-500 hover:bg-red-100' 
          : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white backdrop-blur-sm'
      } ${className}`}
      aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart size={iconSize} className={isFavorited ? "fill-red-500" : ""} />
    </button>
  );
}
