import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: "postgresql://postgres.ikkwfbvtcdduusicjnof:MalangBadji413@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?connect_timeout=30&pgbouncer=true&connection_limit=20"
      }
    }
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
