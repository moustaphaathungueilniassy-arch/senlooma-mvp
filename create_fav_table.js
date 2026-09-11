const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
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
    console.log('Created table Favorite');

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Favorite_userId_listingId_key" ON "Favorite"("userId", "listingId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Favorite_userId_idx" ON "Favorite"("userId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Favorite_listingId_idx" ON "Favorite"("listingId");
    `);
    console.log('Created indexes');

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log('Added foreign keys');
    } catch (e) {
      console.log('Foreign keys might already exist or error:', e.message);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
