
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

// ── Route Imports ─────────────────────────────────
const authRoutes = require("./modules/auth/auth.routes");
const workspaceRoutes = require("./modules/workspace/workspaceRoutes");
const businessRoutes = require("./modules/business/businessRoutes");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);


app.use(express.json());               
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());                

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); 
}


app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BusinessOS AI API is running.",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/businesses", businessRoutes);

 
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});


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
