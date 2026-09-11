'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, CheckCircle, RotateCcw } from 'lucide-react';
import Link from 'next/link';

interface AnnonceActionsProps {
  annonceId: string;
  currentStatus: string;
}

export default function AnnonceActions({ annonceId, currentStatus }: AnnonceActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleStatus = async () => {
    try {
      setIsUpdating(true);
      const newStatus = currentStatus === 'VENDU' ? 'ACTIVE' : 'VENDU';
      const res = await fetch(`/api/annonces/${annonceId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Erreur lors de la mise à jour');
      router.refresh();
    } catch (error) {
      alert("Erreur lors de la mise à jour de l'annonce");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteAnnonce = async () => {
    if (!confirm('Voulez-vous vraiment supprimer cette annonce ? Cette action est irréversible.')) return;
    
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/annonces/${annonceId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erreur lors de la suppression');
      router.refresh();
    } catch (error) {
      alert("Erreur lors de la suppression de l'annonce");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-3">
      <button
        onClick={toggleStatus}
        disabled={isUpdating}
        className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          currentStatus === 'VENDU' 
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
            : 'bg-green-50 text-green-700 hover:bg-green-100'
        }`}
        title={currentStatus === 'VENDU' ? 'Remettre en vente' : 'Marquer comme vendu'}
      >
        {currentStatus === 'VENDU' ? (
          <><RotateCcw className="w-3 h-3 mr-1" /> Remettre</>
        ) : (
          <><CheckCircle className="w-3 h-3 mr-1" /> Vendu</>
        )}
      </button>
      
      <Link href={`/annonces/${annonceId}`} className="text-[#2D6A4F] hover:text-[#1B4332] text-sm font-medium">
        Voir
      </Link>
      
      <button onClick={deleteAnnonce} disabled={isDeleting} className="text-red-500 hover:text-red-700 p-1" title="Supprimer">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
