import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Favorite" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "listingId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Favorite_userId_listingId_key" ON "Favorite"("userId", "listingId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Favorite_userId_idx" ON "Favorite"("userId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Favorite_listingId_idx" ON "Favorite"("listingId");
    `);

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (e) {
      console.log('FK userId exists or error', e);
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (e) {
      console.log('FK listingId exists or error', e);
    }

    return NextResponse.json({ success: true, message: 'Table Favorite créée avec succès' });
  } catch (error: any) {
    console.error('Erreur migration:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
