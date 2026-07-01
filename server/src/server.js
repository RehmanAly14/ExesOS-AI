/**
 * Server Entry Point
 * ────────────────────────────────────────────────
 * Boots the Express application, connects to the
 * database, and starts listening on the configured port.
 *
 * Keeps app.js clean by isolating the HTTP server
 * bootstrapping logic here.
 */

require("dotenv").config();

const app = require("./app");
const prisma = require("./config/prisma");

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ─────────────────────────────────────────────────
/**
 * Bootstraps the application:
 *  1. Verify database connectivity via Prisma
 *  2. Start the HTTP server
 */
const startServer = async () => {
  try {
    // ── 1. Test DB connection ─────────────────────
    await prisma.$connect();
    console.log("✅ Database connected successfully.");

    // ── 2. Start HTTP server ──────────────────────
    app.listen(PORT, () => {
      console.log("─────────────────────────────────────────");
      console.log(`🚀 BusinessOS AI Server is running`);
      console.log(`   Environment : ${NODE_ENV}`);
      console.log(`   Port        : ${PORT}`);
      console.log(`   URL         : http://localhost:${PORT}/api`);
      console.log("─────────────────────────────────────────");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1); // Exit with failure code
  }
};

// ─────────────────────────────────────────────────
// Graceful Shutdown
// ─────────────────────────────────────────────────

/**
 * On termination signals (SIGTERM from Docker/PM2,
 * SIGINT from Ctrl+C), close the Prisma connection
 * cleanly before exiting.
 */
const shutdown = async (signal) => {
  console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
  await prisma.$disconnect();
  console.log("🔒 Database disconnected.");
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ─────────────────────────────────────────────────
// Handle Unhandled Promise Rejections
// ─────────────────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
  process.exit(1);
});

startServer();
