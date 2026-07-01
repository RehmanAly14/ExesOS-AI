/**
 * Prisma Client Configuration
 * ────────────────────────────────────────────────
 * A singleton pattern is used to prevent multiple
 * PrismaClient instances from being created in
 * development (due to hot-reloading with nodemon).
 *
 * In production, a single instance is created and
 * reused for the lifetime of the process.
 */

const { PrismaClient } = require("@prisma/client");

// ── Singleton Factory ─────────────────────────────
const globalForPrisma = global;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"] // Verbose logging in dev
        : ["error"],                          // Only errors in production
  });

// Attach to global in non-production so hot-reloads
// don't spawn new connections
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
