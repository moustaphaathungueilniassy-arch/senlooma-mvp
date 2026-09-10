'use client';

import { CheckCircle2, Search, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AbonnementPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF5] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-12">
        
        {/* En-tête */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-[#2D6A4F] sm:text-4xl">
            Tarification Simple et Transparente
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Fini les abonnements mensuels contraignants. Payez uniquement pour ce que vous publiez !
          </p>
        </div>

        {/* Carte Principale */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="px-6 py-12 sm:p-12 text-center bg-gradient-to-b from-[#2D6A4F]/5 to-white border-b border-gray-100">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Publication à l'unité
            </h3>
            <div className="mt-4 flex items-center justify-center text-6xl font-extrabold text-[#2D6A4F]">
              <span>50 FCFA</span>
            </div>
            <p className="mt-4 text-lg text-gray-500 font-medium">par annonce publiée</p>
          </div>
          
          <div className="px-6 pt-6 pb-8 sm:p-10 bg-white sm:pt-6">
            <ul className="space-y-4">
              {[
                "Visibilité immédiate auprès de milliers d'clients potentiels",
                "Votre annonce reste active pendant 15 jours",
                "Jusqu'à 5 photos haute qualité par annonce",
                "Messagerie intégrée pour discuter avec les clients",
                "Aucun engagement, aucun frais caché"
              ].map((feature, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-[#D4A843]" />
                  </div>
                  <p className="ml-3 text-base text-gray-700">{feature}</p>
                </li>
              ))}
            </ul>
            
            <div className="mt-10">
              <Link 
                href="/annonces/nouvelle"
                className="w-full flex items-center justify-center py-4 px-8 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-lg rounded-xl font-bold shadow-md transition-all hover:scale-[1.02]"
              >
                Publier ma première annonce
              </Link>
            </div>
          </div>
        </div>

        {/* Pourquoi ce modèle ? */}
        <div className="pt-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Pourquoi choisir ce modèle ?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="bg-blue-50 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Économique</h4>
              <p className="text-sm text-gray-600">Si vous ne vendez qu'un animal ce mois-ci, vous ne payez que 50 FCFA au lieu d'un abonnement cher.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="bg-green-50 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[#2D6A4F]" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Paiement Rapide</h4>
              <p className="text-sm text-gray-600">Intégration directe avec Wave et Orange Money pour un paiement instantané à la publication.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="bg-orange-50 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-[#D4A843]" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Sans Engagement</h4>
              <p className="text-sm text-gray-600">Vous restez libre. Vous payez exactement au moment où vous avez besoin d'utiliser le service.</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
