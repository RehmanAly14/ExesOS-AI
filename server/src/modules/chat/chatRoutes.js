const express = require("express");

const router = express.Router();

const controller = require("./chatController");
const { chatValidator, chatHistoryValidator } = require("./chatValidators");
const { protect } = require("../auth/auth.middleware");
const validate = require("../../middleware/validate");

router.get(
    "/history",
    protect,
    chatHistoryValidator,
    validate,
    controller.getChatHistory
);

router.post(
    "/",
    protect,
    chatValidator,
    validate,
    controller.chat
);

module.exports = router;
