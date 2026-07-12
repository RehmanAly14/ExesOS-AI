const { body, query } = require("express-validator");

exports.chatValidator = [
    body("businessId")
        .trim()
        .notEmpty()
        .withMessage("businessId is required"),
    body("message")
        .trim()
        .notEmpty()
        .withMessage("message is required"),
];

exports.chatHistoryValidator = [
    query("businessId")
        .trim()
        .notEmpty()
        .withMessage("businessId is required"),
];
