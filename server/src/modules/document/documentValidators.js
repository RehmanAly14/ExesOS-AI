const { body } = require("express-validator");

exports.uploadDocumentValidator = [
  body("businessId")
    .trim()
    .notEmpty()
    .withMessage("Business ID is required"),
];
