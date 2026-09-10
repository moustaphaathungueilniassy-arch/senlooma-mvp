'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const provider = searchParams?.get('provider');
  const [status, setStatus] = useState<'loading' | 'active' | 'pending' | 'error'>('loading');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/abonnement/status');
        if (res.ok) {
          const data = await res.json();
          if (data.active) {
            setStatus('active');
          } else {
            setStatus('pending');
          }
        } else {
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
      }
    };
    
    // Check status immediately, and maybe poll a few times if pending
    checkStatus();
  }, []);

  if (status === 'loading') {
    return (
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100 flex flex-col items-center">
        <div className="animate-spin h-12 w-12 border-4 border-[#2D6A4F] border-t-transparent rounded-full mb-4"></div>
        <p className="text-lg text-gray-600">Vérification de votre paiement...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <div className="flex justify-center mb-6">
          <XCircle className="h-24 w-24 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Erreur</h1>
        <p className="text-lg text-gray-600 mb-8">
          Nous n'avons pas pu vérifier l'état de votre abonnement.
        </p>
        <Link 
          href="/tableau-de-bord" 
          className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D6A4F] transition-colors"
        >
          Aller au tableau de bord
        </Link>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <div className="flex justify-center mb-6">
          <Clock className="h-24 w-24 text-[#D4A843]" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Paiement en cours de traitement...</h1>
        <p className="text-lg text-gray-600 mb-8">
          Votre paiement a été initié mais n'est pas encore confirmé par l'opérateur. L'abonnement s'activera automatiquement dès réception.
        </p>
        <div className="flex flex-col space-y-4">
          <button 
            onClick={() => window.location.reload()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-[#2D6A4F] hover:bg-[#52B788] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D6A4F] transition-colors"
          >
            Vérifier à nouveau
          </button>
          <Link 
            href="/tableau-de-bord" 
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D6A4F] transition-colors"
          >
            Aller au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
      <div className="flex justify-center mb-6">
        <CheckCircle className="h-24 w-24 text-[#52B788] animate-bounce motion-reduce:animate-none" />
      </div>
      <h1 className="text-3xl font-bold text-[#2D6A4F] mb-4">Abonnement activé avec succès !</h1>
      <p className="text-lg text-gray-600 mb-8">
        Votre abonnement est actif pour 30 jours. Vous pouvez maintenant publier vos annonces en illimité.
      </p>
      {provider && (
        <p className="text-sm text-gray-500 mb-8">
          Payé via : <span className="font-semibold capitalize text-gray-700">{provider.replace('-', ' ')}</span>
        </p>
      )}
      
      <div className="flex flex-col space-y-4">
        <Link 
          href="/annonces/nouvelle" 
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-[#2D6A4F] hover:bg-[#52B788] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D6A4F] transition-colors"
        >
          Publier ma première annonce
        </Link>
        <Link 
          href="/" 
          className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D6A4F] transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export default function AbonnementSuccesPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-4 border-[#2D6A4F] border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
