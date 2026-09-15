'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ShieldCheck, AlertCircle, Upload, CheckCircle2 } from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload';
import { Button } from '@/components/ui/button';

export default function VerificationPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    idCardNumber: string | null;
    idCardFront: string | null;
    idCardBack: string | null;
    verified: boolean;
  }>({
    idCardNumber: null,
    idCardFront: null,
    idCardBack: null,
    verified: false,
  });

  const [formData, setFormData] = useState({
    idCardNumber: '',
    idCardFront: [] as string[],
    idCardBack: [] as string[],
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/user/verify-request');
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
          if (data.idCardNumber) {
            setFormData(prev => ({ ...prev, idCardNumber: data.idCardNumber }));
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    if (!formData.idCardNumber || formData.idCardFront.length === 0 || formData.idCardBack.length === 0) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs et uploader les deux faces.' });
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/user/verify-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idCardNumber: formData.idCardNumber,
          idCardFront: formData.idCardFront[0],
          idCardBack: formData.idCardBack[0],
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Vos documents ont été soumis avec succès. Un administrateur va les examiner.' });
        setStatus(prev => ({ ...prev, idCardNumber: formData.idCardNumber, idCardFront: formData.idCardFront[0], idCardBack: formData.idCardBack[0] }));
      } else {
        const errorData = await res.json();
        setMessage({ type: 'error', text: errorData.error || 'Une erreur est survenue.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur réseau.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  if (status.verified) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-green-600" />
          Vérification d'Identité
        </h1>
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-green-800 mb-2">Félicitations ! Votre profil est vérifié.</h2>
          <p className="text-green-700">
            Le badge de confiance officiel SAMA-DARAAL est affiché sur votre profil et vos annonces. Cela rassure vos acheteurs !
          </p>
        </div>
      </div>
    );
  }

  const isPending = !!status.idCardNumber && !status.verified;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <ShieldCheck className="w-8 h-8 text-primary" />
        Vérification d'Identité (KYC)
      </h1>

      <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Pourquoi se faire vérifier ?</p>
          <p>La vérification d'identité permet d'obtenir le badge officiel <strong>Éleveur Vérifié ✅</strong>. Ce badge est visible par tous les acheteurs et augmente considérablement vos chances de vendre en instaurant la confiance.</p>
        </div>
      </div>

      {isPending ? (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
          <ShieldCheck className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-yellow-800 mb-2">Demande en cours d'examen</h2>
          <p className="text-yellow-700">
            Vos documents ont bien été reçus. Notre équipe est en train de vérifier votre dossier. Vous recevrez une notification une fois validé.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de Carte d'Identité (CNI)</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
              placeholder="Ex: 1 234 1990 12345 12"
              value={formData.idCardNumber}
              onChange={(e) => setFormData({ ...formData, idCardNumber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo de la CNI (Recto)</label>
              <ImageUpload
                value={formData.idCardFront}
                onChange={(urls) => setFormData({ ...formData, idCardFront: urls })}
                onRemove={(url) => setFormData({ ...formData, idCardFront: formData.idCardFront.filter(u => u !== url) })}
              />
              <p className="text-xs text-gray-500 mt-2">La photo doit être claire et lisible.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo de la CNI (Verso)</label>
              <ImageUpload
                value={formData.idCardBack}
                onChange={(urls) => setFormData({ ...formData, idCardBack: urls })}
                onRemove={(url) => setFormData({ ...formData, idCardBack: formData.idCardBack.filter(u => u !== url) })}
              />
            </div>
          </div>

          {message.text && (
            <div className={`p-3 rounded-md text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message.text}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Envoi en cours...' : 'Soumettre ma demande de vérification'}
          </Button>
        </form>
      )}
    </div>
  );
}
