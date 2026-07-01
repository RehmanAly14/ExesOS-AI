/**
 * Auth Controller
 * ────────────────────────────────────────────────
 * Thin HTTP layer — responsible ONLY for:
 *   - Reading the request (req)
 *   - Calling the appropriate service method
 *   - Sending the response (res)
 *
 * Zero business logic lives here.
 * All errors are forwarded to the global error handler via next().
 */

const authService = require("./auth.service");

// ─────────────────────────────────────────────────
/**
 * POST /api/auth/register
 *
 * Registers a new user and returns a JWT.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const { user, token } = await authService.registerUser({
      name,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
/**
 * POST /api/auth/login
 *
 * Authenticates an existing user and returns a JWT.
 * Optionally sets an HttpOnly cookie for browser clients.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await authService.loginUser({ email, password });

    // Optional: Set HttpOnly cookie for browser-based clients
    // This works alongside Bearer token support
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user.
 * Requires the `protect` middleware to run first.
 */
const getMe = async (req, res, next) => {
  try {
    const user = authService.getCurrentUser(req.user);

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully.",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
/**
 * POST /api/auth/logout
 *
 * Clears the authentication cookie.
 * For Bearer token clients, the client should simply
 * discard the token — JWTs are stateless.
 */
const logout = async (req, res, next) => {
  try {
    // Clear the HttpOnly cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, logout };
