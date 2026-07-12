
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
const documentRoutes = require("./modules/document/documentRoutes");
const chatRoutes = require("./modules/chat/chatRoutes");
const reportRoutes = require("./modules/report/reportRoutes");

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
    message: "ExecOS AI API is running.",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/reports", reportRoutes);
 
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});


app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`, {
    details: err.details,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  const errorMessage =
    err.publicError ||
    (statusCode === 500 && isProduction
      ? "An internal server error occurred. Please try again later."
      : err.message || "An unexpected error occurred.");

  const response = {
    success: false,
    message: errorMessage,
    error: errorMessage,
  };

  if (err.details) {
    response.details = err.details;
  } else if (!isProduction && err.message) {
    response.details = err.message;
  }

  res.status(statusCode).json(response);
});

module.exports = app;
