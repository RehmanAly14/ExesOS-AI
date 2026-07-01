/**
 * Auth Service
 * ────────────────────────────────────────────────
 * Contains ALL business logic for authentication.
 *
 * Controllers are kept thin — they only handle
 * HTTP request/response. This service handles:
 *   - Password hashing & comparison
 *   - User lookups
 *   - Token generation
 *   - Business rule enforcement (e.g. duplicate email)
 *
 * Throws descriptive Error objects that controllers
 * can catch and forward to the error handler.
 */

const bcrypt = require("bcryptjs");
const prisma = require("../../config/prisma");
const { generateToken } = require("../../utils/jwt");

// ── Constants ─────────────────────────────────────
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;

// ─────────────────────────────────────────────────
/**
 * Strips the password field from a user object
 * before returning it to the client.
 *
 * @param {object} user - Prisma User record
 * @returns {object}      User without password
 */
const sanitizeUser = (user) => {
  const { password, ...sanitized } = user;
  return sanitized;
};

// ─────────────────────────────────────────────────
/**
 * Registers a new user.
 *
 * Steps:
 *  1. Check if email is already taken
 *  2. Hash the password with bcrypt
 *  3. Create the user record
 *  4. Generate a JWT
 *  5. Return sanitized user + token
 *
 * @param {{ name: string, email: string, password: string }} data
 * @returns {{ user: object, token: string }}
 * @throws {Error} If email is already registered
 */
const registerUser = async ({ name, email, password }) => {
  // ── Step 1: Duplicate email check ────────────────
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error = new Error("An account with this email already exists.");
    error.statusCode = 409; // HTTP Conflict
    throw error;
  }

  // ── Step 2: Hash password ─────────────────────────
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // ── Step 3: Create user ───────────────────────────
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // ── Step 4: Generate JWT ──────────────────────────
  const token = generateToken({ id: user.id, email: user.email });

  // ── Step 5: Return safe user + token ─────────────
  return { user: sanitizeUser(user), token };
};

// ─────────────────────────────────────────────────
/**
 * Logs in an existing user.
 *
 * Steps:
 *  1. Find the user by email
 *  2. Compare the provided password with the hash
 *  3. Generate a JWT
 *  4. Return sanitized user + token
 *
 * @param {{ email: string, password: string }} data
 * @returns {{ user: object, token: string }}
 * @throws {Error} If credentials are invalid
 */
const loginUser = async ({ email, password }) => {
  // ── Step 1: Find user (include password for comparison) ──
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Use a generic message to prevent user enumeration attacks
  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // ── Step 2: Compare password ──────────────────────
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // ── Step 3: Generate JWT ──────────────────────────
  const token = generateToken({ id: user.id, email: user.email });

  // ── Step 4: Return safe user + token ─────────────
  return { user: sanitizeUser(user), token };
};

// ─────────────────────────────────────────────────
/**
 * Returns the currently authenticated user.
 * The user is already loaded and sanitized by the
 * auth middleware — this service method is here for
 * consistency and future extensibility.
 *
 * @param {object} user - req.user attached by middleware
 * @returns {object}      The authenticated user
 */
const getCurrentUser = (user) => {
  return user;
};

module.exports = { registerUser, loginUser, getCurrentUser };
