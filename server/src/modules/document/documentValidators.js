const { body } = require("express-validator");

exports.uploadDocumentValidator = [
  body("businessId")
    .trim()
    .notEmpty()
    .withMessage("Business ID is required"),
];

exports.updateEmbeddingStatusValidator = [
  body("embeddingStatus")
    .trim()
    .notEmpty()
    .withMessage("embeddingStatus is required")
    .isIn(["pending", "embedded", "failed"])
    .withMessage("embeddingStatus must be one of: pending, embedded, failed"),
];
