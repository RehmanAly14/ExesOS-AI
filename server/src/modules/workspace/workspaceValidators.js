const { body } = require("express-validator");

exports.createWorkspaceValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Workspace name is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Workspace name must be between 3 and 100 characters"),

    body("description")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters"),
];