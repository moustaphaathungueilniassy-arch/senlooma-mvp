import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://senlooma-mvp-silk.vercel.app';

  // Obtenir toutes les annonces actives
  const listings = await prisma.listing.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      updatedAt: true,
    },
  });

  const listingUrls = listings.map((listing) => ({
    url: `${baseUrl}/annonces/${listing.id}`,
    lastModified: listing.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Routes statiques
  const routes = ['', '/annonces', '/eleveurs', '/connexion', '/inscription'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return [...routes, ...listingUrls];
}
