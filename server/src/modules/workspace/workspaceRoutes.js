const router = require("express").Router();

const controller = require("./workspaceController");

const {protect} = require("../auth/auth.middleware");

const {
    createWorkspaceValidator,
} = require("./workspaceValidators");

const validate = require("../../middleware/validate");

router.post(
    "/",
    protect,
    createWorkspaceValidator,
    validate,
    controller.createWorkspace
);
router.get(
    "/",
    protect,
    controller.getMyWorkspaces
);
router.get(
    "/:id",
    protect,
    controller.getWorkspaceById
);
router.delete(
    "/:id",
    protect,
    controller.deleteWorkspace
);

module.exports = router;