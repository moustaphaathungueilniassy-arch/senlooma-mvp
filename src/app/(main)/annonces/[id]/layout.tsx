import { Metadata } from 'next';
import prisma from '@/lib/prisma';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const resolvedParams = await params;
  const listing = await prisma.listing.findUnique({
    where: { id: resolvedParams.id },
    include: {
      user: true,
      images: { take: 1 },
    },
  });

  if (!listing) {
    return {
      title: 'Annonce introuvable',
    };
  }

  const title = `${listing.title} - ${listing.city} | SAMA-DARAAL`;
  const description = listing.description.substring(0, 160) + '...';
  const imageUrl = listing.images[0]?.url || 'https://senlooma-mvp-silk.vercel.app/og-default.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [imageUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function ListingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
