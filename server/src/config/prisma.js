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

const createClient = () =>
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });

const isClientReady = (client) =>
  Boolean(client?.report && typeof client.report.create === "function");

let prisma = globalForPrisma.prisma;

if (!isClientReady(prisma)) {
  if (prisma?.$disconnect) {
    prisma.$disconnect().catch(() => {});
  }
  prisma = createClient();
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
