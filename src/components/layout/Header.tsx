'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, User as UserIcon, LogOut, Settings, Plus } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  
  const isLoggedIn = status === 'authenticated';
  const user = session?.user;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const navLinks = [
    { name: 'Accueil', href: '/' },
    { name: 'Annonces', href: '/annonces' },
    { name: 'Éleveurs', href: '/eleveurs' },
    { name: 'Enchères', href: '/encheres' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#2D6A4F]">SAMA-DARAAL</span>
              <span className="text-2xl" role="img" aria-hidden="true">🐄</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-700 hover:text-[#2D6A4F] font-medium transition-colors focus:ring-2 focus:ring-[#2D6A4F] rounded-md outline-none"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn && ((user as any)?.role === 'ELEVEUR' || (user as any)?.role === 'ADMIN') && (
              <Link
                href="/annonces/nouvelle"
                className="flex items-center px-4 py-2 bg-[#D4A843] hover:bg-[#b08b35] text-white rounded-lg font-bold shadow-sm transition-colors focus:ring-2 focus:ring-[#D4A843] outline-none"
              >
                <Plus size={18} className="mr-1" /> Publier
              </Link>
            )}

            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 focus:ring-2 focus:ring-[#2D6A4F] rounded-full outline-none"
                  aria-label="Menu utilisateur"
                  aria-expanded={isDropdownOpen}
                >
                  <div className="h-10 w-10 rounded-full bg-[#52B788] flex items-center justify-center text-white hover:bg-[#2D6A4F] transition-colors overflow-hidden">
                    {user?.image ? (
                      <img src={user.image} alt={user.name || 'Utilisateur'} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={20} />
                    )}
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-md shadow-lg py-1 border border-gray-100">
                    {(user as any)?.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm text-[#D4A843] font-bold hover:bg-gray-100 focus:ring-2 focus:ring-[#2D6A4F] outline-none border-b border-gray-100"
                      >
                        <Settings size={16} className="mr-2" /> Espace Admin
                      </Link>
                    )}
                    <Link
                      href="/tableau-de-bord"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-[#2D6A4F] outline-none"
                    >
                      <Settings size={16} className="mr-2" /> Tableau de bord
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 focus:ring-2 focus:ring-[#2D6A4F] outline-none"
                    >
                      <LogOut size={16} className="mr-2" /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 border-l pl-4 border-gray-100">
                <Link
                  href="/connexion"
                  className="px-4 py-2 text-[#2D6A4F] font-medium hover:bg-gray-50 rounded-md transition-colors focus:ring-2 focus:ring-[#2D6A4F] outline-none"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-medium rounded-md transition-colors focus:ring-2 focus:ring-[#2D6A4F] outline-none"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F] rounded-md outline-none"
              aria-label="Ouvrir le menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-md border-t border-gray-200">
          {isLoggedIn && ((user as any)?.role === 'ELEVEUR' || (user as any)?.role === 'ADMIN') && (
            <div className="p-4 border-b border-gray-100">
              <Link
                href="/annonces/nouvelle"
                className="flex items-center justify-center w-full px-4 py-3 bg-[#D4A843] hover:bg-[#b08b35] text-white rounded-lg font-bold shadow-sm transition-colors focus:ring-2 focus:ring-[#D4A843] outline-none"
                onClick={() => setIsMenuOpen(false)}
              >
                <Plus size={20} className="mr-2" /> Publier une annonce
              </Link>
            </div>
          )}
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#2D6A4F] font-bold hover:bg-gray-50 focus:ring-2 focus:ring-[#2D6A4F] outline-none"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-100">
            {isLoggedIn ? (
              <div className="space-y-1 px-2">
                <Link
                  href="/tableau-de-bord"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#2D6A4F] font-bold hover:bg-gray-50 focus:ring-2 focus:ring-[#2D6A4F] outline-none"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tableau de bord
                </Link>
                <Link
                  href="/tableau-de-bord/profil"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#2D6A4F] font-bold hover:bg-gray-50 focus:ring-2 focus:ring-[#2D6A4F] outline-none"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Paramètres
                </Link>
                <button
                  onClick={() => { signOut(); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-50 focus:ring-2 focus:ring-[#2D6A4F] outline-none"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 px-4 py-2">
                <Link
                  href="/connexion"
                  className="w-full text-center px-4 py-2 border border-[#2D6A4F] text-white font-bold font-medium rounded-md hover:bg-gray-100 focus:ring-2 focus:ring-[#2D6A4F] outline-none"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className="w-full text-center px-4 py-2 bg-white/20 text-white hover:bg-white/30 font-medium rounded-md hover:bg-[#52B788] focus:ring-2 focus:ring-[#2D6A4F] outline-none"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
