/**
 * Server Entry Point
 */

require("dotenv").config();

const app = require("./app");
const prisma = require("./config/prisma");
const { initializeFireworksConfig } = require("./config/fireworks");

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully.");

    await initializeFireworksConfig();

    app.listen(PORT, () => {
      console.log("─────────────────────────────────────────");
      console.log(`🚀 ExecOS AI Server is running`);
      console.log(`   Environment : ${NODE_ENV}`);
      console.log(`   Port        : ${PORT}`);
      console.log(`   URL         : http://localhost:${PORT}/api`);
      console.log("─────────────────────────────────────────");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
  await prisma.$disconnect();
  console.log("🔒 Database disconnected.");
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
  process.exit(1);
});

startServer();
