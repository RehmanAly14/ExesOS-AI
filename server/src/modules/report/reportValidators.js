const { body, query } = require("express-validator");

exports.createReportValidator = [
    body("businessId")
        .trim()
        .notEmpty()
        .withMessage("businessId is required"),
    body("prompt")
        .trim()
        .notEmpty()
        .withMessage("prompt is required"),
];

exports.listReportsValidator = [
    query("businessId")
        .trim()
        .notEmpty()
        .withMessage("businessId is required"),
];
