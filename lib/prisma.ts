import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // Opsional: Untuk melihat log query SQL di terminal saat dev
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;