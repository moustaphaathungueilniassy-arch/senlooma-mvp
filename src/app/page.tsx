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
      icon: <Users className="h-8 w-8 text-white drop-shadow-md" />,
    },
    {
      title: 'Publication 15 Jours',
      description: 'Publiez vos annonces gratuitement. Chaque annonce reste visible pendant 15 jours.',
      icon: <CheckCircle className="h-8 w-8 text-white drop-shadow-md" />,
    },
    {
      title: 'Vendez Rapidement',
      description: 'Ajoutez vos bêtes, fixez vos prix ou lancez des enchères pour trouver preneur.',
      icon: <TrendingUp className="h-8 w-8 text-white drop-shadow-md" />,
    },
  ];

  const stats = [
    { label: 'Éleveurs Inscrits', value: '2,500+' },
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
        
        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center">
          <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 text-sm font-medium mb-6 animate-fade-in-up">
            🟢 Plateforme 100% gratuite
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-xl max-w-4xl tracking-tight leading-tight animate-fade-in-up animation-delay-100">
            Le marché du bétail <br/><span className="text-[#D4A843] italic drop-shadow-md">à portée de main</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl drop-shadow-lg font-medium animate-fade-in-up animation-delay-200">
            Achetez et vendez facilement : bovins, ovins, caprins, volailles. Une plateforme 100% sécurisée et de confiance pour les éleveurs et acheteurs d'Afrique de l'Ouest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-up animation-delay-300">
            <Link 
              href="/annonces" 
              className="px-8 py-4 bg-[#D4A843] text-white hover:bg-[#b08b35] hover:scale-105 rounded-full text-lg font-bold transition-all shadow-[0_0_20px_rgba(212,168,67,0.4)] flex items-center justify-center"
            >
              <Search className="mr-2 h-5 w-5" /> Explorer le marché
            </Link>
            <Link 
              href="/inscription" 
              className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white text-white hover:bg-white hover:text-[#1B1B1B] hover:scale-105 rounded-full text-lg font-bold transition-all shadow-lg flex items-center justify-center"
            >
              Vendre mon bétail
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-[#FAFAF5]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-[#1B1B1B] mb-2">Nos Catégories</h2>
              <p className="text-gray-600">Trouvez exactement ce que vous cherchez</p>
            </div>
            <Link href="/annonces" className="hidden sm:flex items-center text-[#2D6A4F] font-semibold hover:text-[#1B4332] group">
              Tout voir <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link 
                key={category.slug} 
                href={`/annonces?categoryId=${category.slug}`}
                className="group relative h-48 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${category.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B1B1B]/90 via-[#1B1B1B]/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <span className="text-3xl mb-2">{category.icon}</span>
                  <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                  <span className="text-sm text-gray-300 font-medium">{category.count}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Immersive Parallax */}
      <section className="py-24 relative bg-fixed bg-center bg-cover" style={{ backgroundImage: 'url(/images/hero/2.jpg)' }}>
        <div className="absolute inset-0 bg-[#2D6A4F]/90 backdrop-blur-sm" />
        <div className="relative z-10">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-white drop-shadow-lg mb-4">Comment ça marche ?</h2>
            <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto drop-shadow-md font-medium">
              Une interface simple et intuitive conçue pour vous faire gagner du temps et développer votre activité pastorale.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-xl border border-white/20 hover:-translate-y-1 transition-all duration-300 text-white">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
                    {step.icon}
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
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative z-10 border-t border-[#2D6A4F]/10 bg-[#2D6A4F]">
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
