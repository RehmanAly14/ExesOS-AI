const { body } = require("express-validator");

exports.createBusinessValidator = [
  body("workspaceId")
    .trim()
    .notEmpty()
    .withMessage("Workspace ID is required"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Business name is required"),

  body("industry")
    .trim()
    .notEmpty()
    .withMessage("Industry is required"),

  body("employees")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Employees must be a positive number"),
];