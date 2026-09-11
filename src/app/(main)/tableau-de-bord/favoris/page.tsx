import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Heart, Search, MapPin, Clock } from 'lucide-react';
import { formatPrice, formatRelativeDate } from '@/lib/utils';
import FavoriteButton from '@/components/ui/FavoriteButton';

export default async function FavorisPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      listing: {
        include: {
          category: true,
          images: true,
        }
      }
    }
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <Heart className="mr-3 text-red-500 fill-red-500" />
          Mes Favoris
        </h1>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-red-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Aucun favori</h2>
          <p className="text-gray-500 mb-6">Vous n'avez pas encore sauvegardé d'annonces.</p>
          <Link 
            href="/annonces" 
            className="inline-block bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-6 py-3 rounded-lg font-bold transition-colors"
          >
            Explorer le marché
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(({ listing: annonce }) => (
            <Link href={`/annonces/${annonce.id}`} key={annonce.id} className="group">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative">
                <div className="relative h-48 w-full bg-gray-100">
                  {annonce.images && annonce.images[0]?.url ? (
                    <img 
                      src={annonce.images[0].url} 
                      alt={annonce.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Pas d'image
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 items-end z-10">
                    <div className="bg-white/90 px-2 py-1 rounded text-xs font-semibold text-[#2D6A4F] shadow-sm">
                      {annonce.category?.name || 'Inconnue'}
                    </div>
                    <FavoriteButton listingId={annonce.id} iconSize={16} className="shadow-sm border border-gray-100" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{annonce.title}</h3>
                  <p className="text-xl font-bold text-[#D4A843] mb-3">
                    {formatPrice(annonce.price)}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="truncate">{annonce.city || 'Non spécifié'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{formatRelativeDate(annonce.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
