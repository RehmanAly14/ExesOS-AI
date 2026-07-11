const express = require("express");

const router = express.Router();

const controller = require("./chatController");

const { protect } = require("../auth/auth.middleware");

router.post(
    "/",
    protect,
    controller.chat
);

module.exports = router;