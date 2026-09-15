import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { formatRelativeDate } from '@/lib/utils';
import { Trash2, Shield, User, Store } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminUtilisateursPage() {
  const session = await auth();

  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    redirect('/connexion');
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { listings: true }
      }
    }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des Utilisateurs</h1>
          <p className="text-white/80">Gérez tous les éleveurs, acheteurs et administrateurs.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-medium">Utilisateur</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Rôle</th>
                <th className="p-4 font-medium">Inscription</th>
                <th className="p-4 font-medium">Annonces</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name || ''} className="w-full h-full object-cover" />
                        ) : (
                          u.name?.substring(0, 2).toUpperCase() || '?'
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.name || 'Sans nom'}</p>
                        <p className="text-xs text-gray-500">{u.location || 'Localisation inconnue'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-900">{u.phone}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'ELEVEUR' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {u.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                      {u.role === 'ELEVEUR' && <Store className="w-3 h-3" />}
                      {u.role === 'ACHETEUR' && <User className="w-3 h-3" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {formatRelativeDate(u.createdAt.toISOString())}
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">
                    {u._count.listings}
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer l'utilisateur">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Aucun utilisateur trouvé.
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
