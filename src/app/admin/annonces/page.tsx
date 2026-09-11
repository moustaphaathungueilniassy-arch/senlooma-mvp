import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { formatPrice, formatRelativeDate } from '@/lib/utils';
import { Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminAnnoncesPage() {
  const session = await auth();

  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    redirect('/connexion');
  }

  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, phone: true } },
      category: { select: { name: true } },
    }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des Annonces</h1>
          <p className="text-white/80">Supervisez toutes les annonces de la plateforme.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-medium">Annonce</th>
                <th className="p-4 font-medium">Prix</th>
                <th className="p-4 font-medium">Éleveur</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Statut</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900 line-clamp-1">{listing.title}</div>
                    <div className="text-xs text-gray-500">{listing.category.name}</div>
                  </td>
                  <td className="p-4 font-medium text-gray-900">
                    {formatPrice(listing.price)}
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-900">{listing.user.name || 'Sans nom'}</div>
                    <div className="text-xs text-gray-500">{listing.user.phone}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {formatRelativeDate(listing.createdAt.toISOString())}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      listing.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      listing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/annonces/${listing.id}`} target="_blank" className="p-2 text-gray-500 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors" title="Voir l'annonce">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer l'annonce">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {listings.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Aucune annonce trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
