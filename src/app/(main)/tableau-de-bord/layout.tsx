'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LayoutDashboard, FileText, MessageSquare, User, CreditCard, Settings, Heart, ShoppingBag } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || 'ACHETEUR';

  const getNavigation = () => {
    const baseNav = [
      { name: 'Tableau de bord', href: '/tableau-de-bord', icon: LayoutDashboard },
    ];

    if (role === 'ELEVEUR') {
      baseNav.push(
        { name: 'Mes Annonces', href: '/tableau-de-bord/annonces', icon: FileText },
        { name: 'Abonnement', href: '/abonnement', icon: CreditCard }
      );
    } else {
      // Pour les Acheteurs
      baseNav.push(
        { name: 'Mes Achats', href: '/tableau-de-bord/achats', icon: ShoppingBag },
        { name: 'Mes Favoris', href: '/tableau-de-bord/favoris', icon: Heart }
      );
    }

    baseNav.push(
      { name: 'Messages', href: '/tableau-de-bord/messages', icon: MessageSquare },
      { name: 'Mon Profil', href: '/tableau-de-bord/profil', icon: User },
      { name: 'Paramètres', href: '/tableau-de-bord/parametres', icon: Settings }
    );

    return baseNav;
  };

  const navigation = getNavigation();

  return (
    <div className="min-h-screen bg-[#2D6A4F] flex flex-col lg:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm min-h-screen sticky top-16" style={{ height: 'calc(100vh - 4rem)' }}>
        <div className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-[#2D6A4F] text-white' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#2D6A4F]'
                }`}
              >
                <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Navigation Mobile */}
      <nav className="lg:hidden bg-white border-b border-gray-200 overflow-x-auto sticky top-16 z-10">
        <ul className="flex px-4 py-3 space-x-2 min-w-max">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-[#2D6A4F] text-white' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#2D6A4F]'
                  }`}
                >
                  <item.icon className={`mr-2 h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Contenu principal */}
      <section className="flex-1 overflow-y-auto w-full">
        {children}
      </section>
    </div>
  );
}
