import prisma from '@/lib/prisma';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Récupérer les statistiques
  const totalUsers = await prisma.user.count();
  const eleveursCount = await prisma.user.count({ where: { role: 'ELEVEUR' } });
  const acheteursCount = await prisma.user.count({ where: { role: 'ACHETEUR' } });
  
  const totalListings = await prisma.listing.count();
  const activeListings = await prisma.listing.count({ where: { status: 'ACTIVE' } });
  const pendingListings = await prisma.listing.count({ where: { status: 'PENDING' } });

  const recentListings = await prisma.listing.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, phone: true } },
      category: { select: { name: true } }
    }
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Vue d'ensemble</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Utilisateurs</p>
            <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Éleveurs</p>
            <p className="text-2xl font-bold text-gray-900">{eleveursCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Annonces Actives</p>
            <p className="text-2xl font-bold text-gray-900">{activeListings}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Annonces en Attente</p>
            <p className="text-2xl font-bold text-gray-900">{pendingListings}</p>
          </div>
        </div>
      </div>

      {/* Récents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Dernières Annonces Publiées</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-medium">Titre</th>
                <th className="p-4 font-medium">Catégorie</th>
                <th className="p-4 font-medium">Prix</th>
                <th className="p-4 font-medium">Éleveur</th>
                <th className="p-4 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentListings.map((listing) => (
                <tr key={listing.id}>
                  <td className="p-4 font-medium text-gray-900">{listing.title}</td>
                  <td className="p-4 text-gray-500">{listing.category.name}</td>
                  <td className="p-4 font-medium">{formatPrice(listing.price)}</td>
                  <td className="p-4 text-gray-500">{listing.user.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      listing.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      listing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {listing.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentListings.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
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
