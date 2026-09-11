import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/connexion',
  },
  providers: [], // Les providers sont ajoutés dans auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = (auth?.user as any)?.role;
      
      // Routes totalement publiques
      const isRoot = nextUrl.pathname === '/';
      const authRoutes = ['/connexion', '/inscription'];
      const isAuthRoute = authRoutes.some(route => nextUrl.pathname.startsWith(route));
      
      const publicRoutes = ['/annonces', '/eleveurs', '/encheres'];
      const isPublicRoute = publicRoutes.some(route => {
        if (nextUrl.pathname.startsWith('/annonces/nouvelle')) return false; // Nouvelle annonce protégée
        return nextUrl.pathname.startsWith(route)
      });
      
      const publicApiRoutes = ['/api/auth', '/api/paiement/webhook', '/api/annonces', '/api/eleveurs'];
      const isPublicApiRoute = publicApiRoutes.some(route => nextUrl.pathname.startsWith(route));
      
      // Laisse passer les assets, images, etc.
      if (nextUrl.pathname.match(/\.(png|jpg|jpeg|svg|ico|json)$/)) return true;
      
      // Autoriser les webhooks et l'authentification
      if (isPublicApiRoute || isPublicRoute) return true;
      
      // Si l'utilisateur est sur une page de login/inscription
      if (isAuthRoute) {
        if (isLoggedIn) return Response.redirect(new URL('/annonces', nextUrl));
        return true;
      }
      
      // La page d'accueil (landing) reste visible pour attirer les gens
      if (isRoot) return true;
      
      // TOUTES les autres pages nécessitent d'être connecté
      if (!isLoggedIn) return false;

      // Protection des routes /admin — réservées aux ADMIN uniquement
      if (nextUrl.pathname.startsWith('/admin')) {
        if (userRole !== 'ADMIN') {
          return Response.redirect(new URL('/annonces', nextUrl));
        }
      }
      
      return true;
    },
  },
};
