import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Optimized connection for Supabase pooler (pgbouncer)
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Reconnect helper - call when you get "Server closed connection"
export async function reconnectPrisma() {
  try {
    await prisma.$disconnect();
    await prisma.$connect();
  } catch {}
}