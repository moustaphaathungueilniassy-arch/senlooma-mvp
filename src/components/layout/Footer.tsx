import React from 'react';
import Link from 'next/link';


export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A3A2A] text-white py-12 border-t-4 border-[#D4A843]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-white">SAMA-DARAAL</span>
              <span className="text-2xl" role="img" aria-hidden="true">🐄</span>
            </Link>
            <p className="text-gray-300 text-sm mt-4">
              La première marketplace dédiée à la vente de bétail au Sénégal. Connectant éleveurs et clients en toute simplicité.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#D4A843]">Liens Rapides</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">À propos</Link> {/* TODO: Implémenter /a-propos */}</li>
              <li><Link href="/annonces" className="text-gray-300 hover:text-white transition-colors">Nos Annonces</Link></li>
              <li><Link href="/eleveurs" className="text-gray-300 hover:text-white transition-colors">Nos Éleveurs</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Contact</Link> {/* TODO: Implémenter /contact */}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#D4A843]">Légal</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Conditions Générales (CGU)</Link> {/* TODO: Implémenter /cgu */}</li>
              <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Politique de confidentialité</Link> {/* TODO: Implémenter /confidentialite */}</li>
              <li><Link href="/abonnement" className="text-gray-300 hover:text-white transition-colors">Tarifs d'abonnement</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#D4A843]">Suivez-nous</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#2D6A4F] transition-colors">
                <span className="sr-only">Facebook</span>
                FB
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#2D6A4F] transition-colors">
                <span className="sr-only">Instagram</span>
                IG
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#2D6A4F] transition-colors">
                <span className="sr-only">Twitter</span>
                X
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} SAMA-DARAAL. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
