/**
 * JWT Utility
 * ────────────────────────────────────────────────
 * Provides token generation and verification
 * helpers used throughout the authentication flow.
 *
 * All configuration is read from environment
 * variables — never hardcoded.
 */

const jwt = require("jsonwebtoken");

// ── Constants ─────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ─────────────────────────────────────────────────
/**
 * Generates a signed JWT for the given payload.
 *
 * @param {object} payload - Data to embed in the token (e.g. { id, email })
 * @returns {string}        Signed JWT string
 */
const generateToken = (payload) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// ─────────────────────────────────────────────────
/**
 * Verifies a JWT and returns the decoded payload.
 * Throws a JsonWebTokenError if the token is
 * invalid or expired.
 *
 * @param {string} token - JWT string to verify
 * @returns {object}       Decoded payload
 */
const verifyToken = (token) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }

  return jwt.verify(token, JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
