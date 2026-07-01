/**
 * Express Application
 * ────────────────────────────────────────────────
 * Configures the Express app with:
 *   - Security middleware (helmet, cors)
 *   - Body parsers
 *   - Cookie parser
 *   - HTTP request logger (morgan)
 *   - API routes
 *   - 404 handler
 *   - Centralized error handler
 *
 * The server.js file is responsible for binding
 * this app to a port — keeping concerns separated.
 */

require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

// ── Route Imports ─────────────────────────────────
const authRoutes = require("./modules/auth/auth.routes");

const app = express();

// ─────────────────────────────────────────────────
// Security Middleware
// ─────────────────────────────────────────────────

/**
 * helmet: Sets security-related HTTP response headers
 * (e.g. X-Frame-Options, X-Content-Type-Options, etc.)
 */
app.use(helmet());

/**
 * cors: Allows the frontend (Next.js) to communicate
 * with this API. Only the configured CLIENT_URL is
 * whitelisted in production.
 */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true, // Required to send/receive cookies cross-origin
  })
);

// ─────────────────────────────────────────────────
// Body & Cookie Parsers
// ─────────────────────────────────────────────────

app.use(express.json());                // Parse application/json bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());                // Parse Cookie header

// ─────────────────────────────────────────────────
// HTTP Request Logger
// ─────────────────────────────────────────────────

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // Compact colored output for development
}

// ─────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────

/**
 * @route   GET /api/health
 * @desc    Quick server health check (used by load balancers, CI)
 * @access  Public
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BusinessOS AI API is running.",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────

app.use("/api/auth", authRoutes);

// ─────────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────────

/**
 * Catches all requests that didn't match any route.
 * Must be placed AFTER all routes.
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─────────────────────────────────────────────────
// Centralized Error Handler
// ─────────────────────────────────────────────────

/**
 * Express recognizes a middleware with 4 parameters as
 * an error handler. All errors forwarded via next(error)
 * land here.
 *
 * Never leaks stack traces to the client in production.
 */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Log the full error internally
  console.error(`[ERROR] ${err.message}`, {
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Use a custom statusCode if the service set one, otherwise default to 500
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500 && process.env.NODE_ENV === "production"
        ? "An internal server error occurred. Please try again later."
        : err.message || "An unexpected error occurred.",
    // Include stack trace only in development for easier debugging
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
