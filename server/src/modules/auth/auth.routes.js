/**
 * Auth Routes
 * ────────────────────────────────────────────────
 * Defines all /api/auth/* endpoints.
 *
 * Middleware pipeline per route:
 *   validator → protect (if needed) → controller
 */

const express = require("express");
const router = express.Router();

const authController = require("./auth.controller");
const { protect } = require("./auth.middleware");
const {
  registerValidator,
  loginValidator,
} = require("./auth.validator");

// ── Public Routes ─────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", registerValidator, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Log in and receive a JWT
 * @access  Public
 */
router.post("/login", loginValidator, authController.login);

// ── Protected Routes ──────────────────────────────

/**
 * @route   GET /api/auth/me
 * @desc    Get the currently authenticated user
 * @access  Private
 */
router.get("/me", protect, authController.getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Log out (clear cookie / discard token)
 * @access  Private
 */
router.post("/logout", protect, authController.logout);

module.exports = router;
