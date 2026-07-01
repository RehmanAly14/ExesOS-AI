/**
 * Auth Middleware
 * ────────────────────────────────────────────────
 * Protects routes that require authentication.
 *
 * Flow:
 *  1. Extract JWT from Authorization header or cookie
 *  2. Verify the token signature & expiry
 *  3. Look up the user in the database
 *  4. Attach the user object to req.user
 *  5. Call next() or reject with 401
 */

const { verifyToken } = require("../../utils/jwt");
const prisma = require("../../config/prisma");

// ─────────────────────────────────────────────────
/**
 * Extracts the raw JWT string from the incoming request.
 * Supports:
 *   - Authorization: Bearer <token>  (recommended)
 *   - Cookie: token=<token>          (optional)
 *
 * @param {import('express').Request} req
 * @returns {string|null}
 */
const extractToken = (req) => {
  // 1. Check Authorization header first (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  // 2. Fall back to HttpOnly cookie
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
};

// ─────────────────────────────────────────────────
/**
 * Authentication middleware.
 * Attaches `req.user` (without password) on success.
 */
const protect = async (req, res, next) => {
  try {
    // ── Step 1: Extract token ─────────────────────
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // ── Step 2: Verify token ──────────────────────
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      const isExpired = err.name === "TokenExpiredError";
      return res.status(401).json({
        success: false,
        message: isExpired
          ? "Session expired. Please log in again."
          : "Invalid token. Please log in again.",
      });
    }

    // ── Step 3: Load user from database ──────────
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        // password is intentionally omitted
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists. Please log in again.",
      });
    }

    // ── Step 4: Attach user to request ───────────
    req.user = user;

    next();
  } catch (error) {
    next(error); // Delegate to centralised error handler
  }
};

module.exports = { protect };
