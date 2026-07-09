const express = require("express");

const router = express.Router();

const controller = require("./documentController");

const { protect } = require("../auth/auth.middleware");

const validate = require("../../middleware/validate");

const upload = require("./documentUpload");

const {
    uploadDocumentValidator
} = require("./documentValidators");

router.post(
    "/",
    protect,
    upload.single("file"),
    uploadDocumentValidator,
    validate,
    controller.uploadDocument
);
router.get(
    "/business/:businessId",
    protect,
    controller.getBusinessDocuments
);
router.get(
    "/:id",
    protect,
    controller.getDocumentById
);
router.delete(
    "/:id",
    protect,
    controller.deleteDocument
);

module.exports = router;
