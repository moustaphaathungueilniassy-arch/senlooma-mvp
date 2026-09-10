import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import { formatRelativeDate, formatPrice } from '@/lib/utils';

export default async function MesAnnoncesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const annonces = await prisma.listing.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      images: true,
    }
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FileText className="mr-3 text-[#2D6A4F]" />
          Mes Annonces
        </h1>
        <Link 
          href="/annonces/nouvelle" 
          className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle annonce
        </Link>
      </div>

      {annonces.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune annonce</h2>
          <p className="text-gray-500 mb-6">Vous n'avez pas encore publié d'annonces sur la plateforme.</p>
          <Link 
            href="/annonces/nouvelle" 
            className="inline-block bg-[#D4A843] hover:bg-[#b08b35] text-white px-6 py-3 rounded-lg font-bold transition-colors"
          >
            Publier ma première annonce
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-600 text-sm">Annonce</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Prix</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Statut</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {annonces.map((annonce) => (
                  <tr key={annonce.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-gray-200 mr-4 overflow-hidden flex-shrink-0">
                          {annonce.images[0]?.url ? (
                            <img src={annonce.images[0].url} alt={annonce.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sans image</div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 truncate max-w-[200px]">{annonce.title}</div>
                          <div className="text-xs text-gray-500">{annonce.category.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {formatPrice(annonce.price)}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        annonce.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        annonce.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {annonce.status === 'ACTIVE' ? 'Active' :
                         annonce.status === 'PENDING' ? 'En attente' :
                         'Vendue / Expirée'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {formatRelativeDate(annonce.createdAt)}
                    </td>
                    <td className="p-4">
                      <Link 
                        href={`/annonces/${annonce.id}`}
                        className="text-[#2D6A4F] hover:underline text-sm font-medium"
                      >
                        Voir public
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
