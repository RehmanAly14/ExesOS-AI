const express = require("express");
const router = express.Router();

const controller = require("./reportController");
const { createReportValidator, listReportsValidator } = require("./reportValidators");
const { protect } = require("../auth/auth.middleware");
const validate = require("../../middleware/validate");

router.post("/", protect, createReportValidator, validate, controller.createReport);
router.get("/", protect, listReportsValidator, validate, controller.listReports);
router.get("/:id", protect, controller.getReportById);
router.delete("/:id", protect, controller.deleteReport);

module.exports = router;
