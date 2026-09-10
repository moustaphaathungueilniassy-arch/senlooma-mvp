import React from 'react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#2D6A4F] flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <Link href="/" className="text-3xl font-bold text-white tracking-tight">
          SAMA<span className="text-[#D4A843]">-DARAAL</span>
        </Link>
        <p className="text-[#52B788] mt-2">La plateforme n°1 de bétail</p>
      </div>
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-8 text-white">
        {children}
      </div>
    </div>
  );
}
