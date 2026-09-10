'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, TrendingUp, Users, Search } from 'lucide-react';

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const bgImages = [
    '/images/hero/1.jpg',
    '/images/hero/2.jpg',
    '/images/hero/3.png'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bgImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(timer);
  }, [bgImages.length]);

  const categories = [
    { name: 'Bovins', slug: 'bovins', icon: '🐄', count: '1,200+', color: 'bg-green-100', image: '/images/categories/bovins.jpg' },
    { name: 'Ovins', slug: 'ovins', icon: '🐑', count: '3,500+', color: 'bg-blue-100', image: '/images/categories/ovins.jpg' },
    { name: 'Caprins', slug: 'caprins', icon: '🐐', count: '2,100+', color: 'bg-yellow-100', image: '/images/categories/caprins.jpg' },
    { name: 'Volailles', slug: 'volailles', icon: '🐔', count: '8,000+', color: 'bg-red-100', image: '/images/categories/volailles.jpg' },
    { name: 'Équins', slug: 'equins', icon: '🐴', count: '450+', color: 'bg-purple-100', image: '/images/categories/equins.webp' },
  ];

  const steps = [
    {
      title: 'Créez votre compte',
      description: 'Inscrivez-vous gratuitement en tant qu\'client ou éleveur en quelques clics.',
      icon: <Users className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Publication 15 Jours',
      description: 'Publiez vos annonces gratuitement. Chaque annonce reste visible pendant 15 jours.',
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Vendez Rapidement',
      description: 'Ajoutez vos bêtes, fixez vos prix ou lancez des enchères pour trouver preneur.',
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
    },
  ];

  const stats = [
    { label: 'Éleveurs Actifs', value: '5,000+' },
    { label: 'Annonces Publiées', value: '15,000+' },
    { label: 'Pays Couverts', value: '8' },
    { label: 'Transactions', value: '25,000+' },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 overflow-hidden transition-all duration-1000 bg-black">
        {/* Background Images */}
        {bgImages.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-60' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
        {/* Overlay gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              La première marketplace de bétail au Sénégal
            </h1>
            <p className="text-lg md:text-xl mb-10 text-gray-100">
              Achetez et vendez facilement vos bovins, ovins, caprins et plus encore. Une plateforme sécurisée, transparente et adaptée aux réalités sénégalaises.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/annonces"
                className="px-8 py-4 bg-accent text-[#1B1B1B] font-bold rounded-lg hover:bg-yellow-600 transition-colors shadow-lg flex items-center justify-center gap-2 text-lg"
              >
                <Search size={20} />
                Voir les annonces
              </Link>
              <Link
                href="/inscription?role=eleveur"
                className="px-8 py-4 bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-2 text-lg"
              >
                Devenir éleveur
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 relative bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/images/bg-categories.jpg')" }}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold text-center text-white mb-12 drop-shadow-lg">Nos Catégories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/annonces?categoryId=${category.slug}`}
                className="group relative flex flex-col items-center justify-center rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-xl hover:border-primary transition-all duration-300 overflow-hidden min-h-[160px] border border-white/50"
              >
                {category.image ? (
                  <>
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat group-hover:scale-110 transition-transform duration-500" 
                      style={{ backgroundImage: `url(${category.image})` }} 
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                    <div className="relative z-10 flex flex-col items-center p-6 w-full h-full justify-center">
                      <h3 className="font-bold text-2xl text-white drop-shadow-md mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-200 drop-shadow-md font-medium">{category.count} annonces</p>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 w-full h-full">
                    <div className={`w-16 h-16 flex items-center justify-center rounded-full ${category.color} text-3xl mb-3 group-hover:scale-110 transition-transform`} role="img" aria-hidden="true">
                      {category.icon}
                    </div>
                    <h3 className="font-semibold text-lg text-gray-800">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{category.count} annonces</p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Background Wrapper for How it works & Stats */}
      <div className="relative bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/images/bg-how-it-works.jpg')" }}>
        <div className="absolute inset-0 bg-black/60" />
        
        {/* How it works */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-white drop-shadow-lg mb-4">Comment ça marche ?</h2>
            <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto drop-shadow-md font-medium">
              Une interface simple et intuitive conçue pour vous faire gagner du temps et développer votre activité pastorale.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-xl border border-white/20 hover:-translate-y-1 transition-all duration-300 text-white">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
                    {React.cloneElement(step.icon as React.ReactElement, { className: 'h-8 w-8 text-white drop-shadow-md' })}
                  </div>
                  <div className="w-8 h-8 bg-accent text-[#1B1B1B] rounded-full flex items-center justify-center font-bold mb-4 -mt-10 border-4 border-transparent shadow-sm">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white drop-shadow-md">{step.title}</h3>
                  <p className="text-gray-200 drop-shadow-md">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 relative z-10 border-t border-white/10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="p-4">
                  <div className="text-4xl md:text-5xl font-bold text-accent mb-2 drop-shadow-lg">
                    {stat.value}
                  </div>
                  <div className="text-lg font-medium text-gray-200 drop-shadow-md">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* CTA Final */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-[#1A3A2A] rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row">
            <div className="p-10 md:p-12 md:w-2/3 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Rejoignez SAMA-DARAAL aujourd'hui
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                Faites partie de la plus grande communauté d'éleveurs et de clients au Sénégal. 
                Modernisez votre commerce de bétail sur une plateforme 100% sécurisée et de confiance.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/inscription"
                  className="px-6 py-3 bg-accent text-[#1B1B1B] font-bold rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Créer un compte gratuit
                </Link>
                <a
                  href="mailto:contact@sama-daraal.sn"
                  className="px-6 py-3 bg-transparent border border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
                >
                  Nous contacter
                </a>
              </div>
            </div>
            <div 
              className="hidden md:block md:w-1/3 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/images/cta-sheep.jpg')" }}
            >
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
