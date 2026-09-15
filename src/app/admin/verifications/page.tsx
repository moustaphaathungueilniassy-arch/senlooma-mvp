'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminVerificationsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Nous utiliserons la route utilisateurs existante avec un filtre ou une nouvelle route admin
      const res = await fetch('/api/admin/verify');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId: string, action: 'APPROVE' | 'REJECT') => {
    if (!confirm(`Êtes-vous sûr de vouloir ${action === 'APPROVE' ? 'approuver' : 'rejeter'} cette demande ?`)) return;

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });

      if (res.ok) {
        fetchUsers();
      } else {
        alert('Erreur lors de la mise à jour.');
      }
    } catch (error) {
      alert('Erreur réseau.');
    }
  };

  if (loading) return <div className="text-white p-8">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-[#D4A843]" />
          Vérifications KYC
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-900">Éleveur</th>
              <th className="p-4 font-semibold text-gray-900">Numéro CNI</th>
              <th className="p-4 font-semibold text-gray-900">Pièces Jointes</th>
              <th className="p-4 font-semibold text-gray-900 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  Aucune demande de vérification en attente.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{u.name}</div>
                    <div className="text-sm text-gray-500">{u.email}</div>
                    <div className="text-xs text-gray-400 mt-1">Inscrit le {new Date(u.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                      {u.idCardNumber}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {u.idCardFront && (
                        <a href={u.idCardFront} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                          <FileText className="w-4 h-4" /> Recto
                        </a>
                      )}
                      {u.idCardBack && (
                        <a href={u.idCardBack} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                          <FileText className="w-4 h-4" /> Verso
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => handleVerify(u.id, 'APPROVE')}
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 h-8"
                      >
                        <Check className="w-4 h-4" /> Approuver
                      </Button>
                      <Button
                        onClick={() => handleVerify(u.id, 'REJECT')}
                        variant="destructive"
                        className="flex items-center gap-1 h-8"
                      >
                        <X className="w-4 h-4" /> Rejeter
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
