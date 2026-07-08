const express = require("express");

const router = express.Router();

const controller = require("./businessController");

const {protect} = require("../auth/auth.middleware");

const validate = require("../../middleware/validate");

const {
    createBusinessValidator
} = require("./businessValidators");

router.post(
    "/",
    protect,
    createBusinessValidator,
    validate,
    controller.createBusiness
);
router.get(
    "/:workspaceId/businesses",
    protect,
    controller.getWorkspaceBusinesses
);
router.get(
    "/:id",
    protect,
    controller.getBusinessById
);
router.patch(
    "/:id",
    protect,
    controller.updateBusiness
);
router.delete(
    "/:id",
    protect,
    controller.deleteBusiness
);

module.exports = router;