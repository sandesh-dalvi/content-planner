import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

// Extend the global type to cache both pool and client
// across Next.js hot reloads in development
const globalForPrisma = globalThis as unknown as {
  pool: Pool | undefined;
  prisma: PrismaClient | undefined;
};

// Create the connection pool once
// Uses DATABASE_URL (pooled) for application runtime queries
// This is different from DIRECT_URL used in prisma.config.ts for migrations
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Keep connections alive between serverless invocations
    // Neon computes scale to zero — a timeout too short causes reconnects
    // A timeout too long wastes resources. 30s is a reasonable middle ground.
    idleTimeoutMillis: 30_000,
    // Limit max connections from this pool instance
    // Serverless functions are short-lived — 10 is generous for MVP
    max: 10,
  });

// Create the Prisma adapter that bridges Prisma ↔ pg driver
const adapter = new PrismaPg(pool);

// Create the Prisma Client with the adapter
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Cache both in globalThis during development only
// In production, module caching handles this naturally
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
  globalForPrisma.prisma = prisma;
}
