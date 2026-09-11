import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { FileText, Eye, MessageSquare, Star, CheckCircle, Clock, Search, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import AnnonceActions from '@/components/dashboard/AnnonceActions';

export default async function TableauDeBordPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/connexion');
  }

  const userId = session.user.id;
  const role = (session.user as any).role || 'ACHETEUR';

  // Récupérer les vraies annonces de l'utilisateur
  const annonces = await prisma.listing.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      _count: {
        select: { conversations: true }
      }
    }
  });

  // Calculer les statistiques
  const activeAnnonces = annonces.filter((a: any) => a.status === 'ACTIVE');
  
  // Expiration logique (15 jours)
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

  const stats = {
    annoncesTotal: annonces.length,
    annoncesActives: activeAnnonces.filter((a: any) => a.createdAt >= fifteenDaysAgo).length,
    messages: annonces.reduce((acc: number, a: any) => acc + a._count.conversations, 0),
    vues: 0, 
    note: "N/A"
  };

  const getStatusBadge = (annonce: any) => {
    if (annonce.status === 'VENDU') return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Vendu</span>;
    if (annonce.createdAt < fifteenDaysAgo) return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Expiré</span>;
    return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Actif</span>;
  };

  const getDaysLeft = (createdAt: Date) => {
    const expireDate = new Date(createdAt);
    expireDate.setDate(expireDate.getDate() + 15);
    const diffTime = expireDate.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const favoritesCount = await prisma.favorite.count({
    where: { userId }
  });

  if (role === 'ACHETEUR') {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <h1 className="text-3xl font-bold text-white">Mon Espace Client</h1>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/tableau-de-bord/favoris" className="bg-white shadow rounded-xl border border-gray-100 p-5 flex items-center hover:shadow-md transition-shadow group">
            <div className="flex-shrink-0 bg-red-50 p-3 rounded-xl group-hover:bg-red-100 transition-colors">
              <Eye className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Mes favoris</dt>
                <dd className="text-2xl font-semibold text-gray-900">{favoritesCount}</dd>
              </dl>
            </div>
          </Link>
          <div className="bg-white shadow rounded-xl border border-gray-100 p-5 flex items-center">
            <div className="flex-shrink-0 bg-[#D4A843] bg-opacity-20 p-3 rounded-xl">
              <MessageSquare className="h-6 w-6 text-[#8B6914]" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Discussions</dt>
                <dd className="text-2xl font-semibold text-gray-900">0</dd>
              </dl>
            </div>
          </div>
        </div>

        <section className="bg-white shadow rounded-xl border border-gray-100 overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Explorer le marché</h2>
            <Link href="/annonces" className="text-sm font-medium text-[#2D6A4F] hover:text-[#1B4332]">
              Voir toutes les annonces &rarr;
            </Link>
          </div>
          <div className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Trouvez le bétail idéal pour vos besoins.</p>
            <Link href="/annonces" className="mt-4 inline-block px-4 py-2 bg-[#2D6A4F] text-white rounded-md font-medium">Parcourir</Link>
          </div>
        </section>
      </div>
    );
  }

  // AFFICHAGE ELEVEUR PAR DEFAUT
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Mon Espace Éleveur</h1>
        <Link 
          href="/annonces/nouvelle" 
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#D4A843] hover:bg-[#b08b35] transition-colors"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Nouvelle annonce 
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white shadow rounded-xl border border-gray-100 p-5 flex items-center">
          <div className="flex-shrink-0 bg-green-100 p-3 rounded-xl">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Annonces Actives</dt>
              <dd className="text-2xl font-semibold text-gray-900">{stats.annoncesActives}</dd>
            </dl>
          </div>
        </div>
        <div className="bg-white shadow rounded-xl border border-gray-100 p-5 flex items-center">
          <div className="flex-shrink-0 bg-gray-100 p-3 rounded-xl">
            <FileText className="h-6 w-6 text-gray-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Total Publié</dt>
              <dd className="text-2xl font-semibold text-gray-900">{stats.annoncesTotal}</dd>
            </dl>
          </div>
        </div>
        <div className="bg-white shadow rounded-xl border border-gray-100 p-5 flex items-center">
          <div className="flex-shrink-0 bg-[#D4A843] bg-opacity-20 p-3 rounded-xl">
            <MessageSquare className="h-6 w-6 text-[#8B6914]" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Conversations</dt>
              <dd className="text-2xl font-semibold text-gray-900">{stats.messages}</dd>
            </dl>
          </div>
        </div>
        <div className="bg-white shadow rounded-xl border border-gray-100 p-5 flex items-center">
          <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-xl">
            <Star className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Note moyenne</dt>
              <dd className="text-2xl font-semibold text-gray-900">{stats.note}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <section className="bg-white shadow rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Mes dernières annonces</h2>
              <Link href="/annonces" className="text-sm font-medium text-[#2D6A4F] hover:text-[#1B4332]">
                Voir sur le site &rarr;
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annonce</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temps Restant</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {annonces.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <Search className="h-12 w-12 text-gray-300 mb-4" />
                          <p>Vous n'avez pas encore publié d'annonce.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    annonces.map((annonce: any) => (
                      <tr key={annonce.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{annonce.title}</div>
                              <div className="text-sm text-gray-500">{annonce.category.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-semibold">{annonce.price} FCFA</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(annonce)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {getDaysLeft(annonce.createdAt)} jours
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <AnnonceActions annonceId={annonce.id} currentStatus={annonce.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
