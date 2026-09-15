'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ShieldCheck, AlertCircle, Upload, CheckCircle2, Loader2, FileText } from 'lucide-react';

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
    idCardFront: '',
    idCardBack: '',
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/user/verify-request');
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
          if (data.idCardNumber) {
            setFormData(prev => ({ ...prev, idCardNumber: data.idCardNumber, idCardFront: data.idCardFront || '', idCardBack: data.idCardBack || '' }));
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const uploadData = new FormData();
      uploadData.append('image', file);

      try {
        side === 'front' ? setUploadingFront(true) : setUploadingBack(true);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });
        
        if (res.ok) {
          const data = await res.json();
          if (side === 'front') {
            setFormData(prev => ({ ...prev, idCardFront: data.url }));
          } else {
            setFormData(prev => ({ ...prev, idCardBack: data.url }));
          }
        } else {
          setMessage({ type: 'error', text: 'Erreur lors du téléchargement de l\'image' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Erreur réseau lors du téléchargement' });
      } finally {
        side === 'front' ? setUploadingFront(false) : setUploadingBack(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    if (!formData.idCardNumber || !formData.idCardFront || !formData.idCardBack) {
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
          idCardFront: formData.idCardFront,
          idCardBack: formData.idCardBack,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Vos documents ont été soumis. Vous êtes maintenant Vérifié !' });
        setStatus(prev => ({ 
          ...prev, 
          idCardNumber: formData.idCardNumber, 
          idCardFront: formData.idCardFront, 
          idCardBack: formData.idCardBack,
          verified: true 
        }));
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

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-[#2D6A4F]" /></div>;

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
        <ShieldCheck className="w-8 h-8 text-[#2D6A4F]" />
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F]"
              placeholder="Ex: 1 234 1990 12345 12"
              value={formData.idCardNumber}
              onChange={(e) => setFormData({ ...formData, idCardNumber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo de la CNI (Recto)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                {formData.idCardFront ? (
                  <div className="relative">
                    <img src={formData.idCardFront} alt="Recto" className="w-full h-32 object-cover rounded" />
                    <button type="button" onClick={() => setFormData({...formData, idCardFront: ''})} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded text-xs">Supprimer</button>
                  </div>
                ) : (
                  <>
                    <input type="file" id="front" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'front')} disabled={uploadingFront} />
                    <label htmlFor="front" className="cursor-pointer flex flex-col items-center">
                      {uploadingFront ? <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-2" /> : <Upload className="w-8 h-8 text-gray-400 mb-2" />}
                      <span className="text-sm text-gray-500">{uploadingFront ? 'Envoi...' : 'Cliquez pour ajouter le recto'}</span>
                    </label>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo de la CNI (Verso)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                {formData.idCardBack ? (
                  <div className="relative">
                    <img src={formData.idCardBack} alt="Verso" className="w-full h-32 object-cover rounded" />
                    <button type="button" onClick={() => setFormData({...formData, idCardBack: ''})} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded text-xs">Supprimer</button>
                  </div>
                ) : (
                  <>
                    <input type="file" id="back" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'back')} disabled={uploadingBack} />
                    <label htmlFor="back" className="cursor-pointer flex flex-col items-center">
                      {uploadingBack ? <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-2" /> : <Upload className="w-8 h-8 text-gray-400 mb-2" />}
                      <span className="text-sm text-gray-500">{uploadingBack ? 'Envoi...' : 'Cliquez pour ajouter le verso'}</span>
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>

          {message.text && (
            <div className={`p-3 rounded-md text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message.text}
            </div>
          )}

          <button type="submit" className="w-full bg-[#2D6A4F] text-white py-2 px-4 rounded-md hover:bg-[#1f4a37] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D6A4F] disabled:opacity-50 flex items-center justify-center" disabled={submitting}>
            {submitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
            {submitting ? 'Envoi en cours...' : 'Soumettre ma demande de vérification'}
          </button>
        </form>
      )}
    </div>
  );
}
