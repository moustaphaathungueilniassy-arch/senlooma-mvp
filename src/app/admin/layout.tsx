import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Redirection si non connecté ou non admin
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    redirect('/connexion');
  }

  return (
    <div className="min-h-screen bg-[#2D6A4F] flex">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-[#1B1B1B] text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center">
            <span className="text-[#D4A843] mr-2">SAMA-DARAAL</span>
            Admin
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center px-4 py-3 bg-[#D4A843] text-white rounded-lg font-medium">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Vue d'ensemble
          </Link>
          <Link href="/admin/utilisateurs" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
            <Users className="w-5 h-5 mr-3" /> Utilisateurs
          </Link>
          <Link href="/admin/annonces" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
            <FileText className="w-5 h-5 mr-3" /> Annonces
          </Link>
          <Link href="/" className="flex items-center px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors mt-auto">
            <LogOut className="w-5 h-5 mr-3" /> Retour au site
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
