import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Simple local connection for maximum speed
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
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