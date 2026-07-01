/**
 * Auth Validators
 * ────────────────────────────────────────────────
 * Input validation rules using express-validator.
 *
 * Validation is intentionally separated from
 * controllers to keep each layer focused on a
 * single responsibility.
 *
 * Usage:
 *   router.post('/register', registerValidator, controller)
 */

const { body, validationResult } = require("express-validator");

// ─────────────────────────────────────────────────
/**
 * Middleware that reads the results of express-validator
 * checks and, if errors exist, returns a 422 response
 * with a structured error list.
 *
 * Must be placed AFTER the validation chain in a route.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed. Please check your input.",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

// ─────────────────────────────────────────────────
/**
 * Validation rules for POST /api/auth/register
 */
const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number."),

  // Run the validation result check last
  validate,
];

// ─────────────────────────────────────────────────
/**
 * Validation rules for POST /api/auth/login
 */
const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required."),

  validate,
];

module.exports = { registerValidator, loginValidator, validate };
