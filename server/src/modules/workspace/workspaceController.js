const workspaceService = require("./workspaceServices");

exports.createWorkspace = async (req, res, next) => {
    try {

        const workspace = await workspaceService.createWorkspace(
            req.user.id,
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Workspace created successfully",
            data: workspace,
        });

    } catch (error) {
        next(error);
    }
};

exports.getMyWorkspaces = async (req, res, next) => {

    try {

        const workspaces =
            await workspaceService.getMyWorkspaces(
                req.user.id
            );

        res.json({
            success: true,
            data: workspaces
        });

    } catch (err) {
        next(err);
    }

};

exports.getWorkspaceById = async (req, res, next) => {

    try {

        const workspace =
            await workspaceService.getWorkspaceById(
                req.params.id,
                req.user.id
            );

        res.json({
            success: true,
            data: workspace
        });

    } catch (err) {
        next(err);
    }

};

exports.deleteWorkspace = async (req, res, next) => {

    try {

        await workspaceService.deleteWorkspace(
            req.params.id,
            req.user.id
        );

        res.json({
            success: true,
            message: "Workspace deleted successfully"
        });

    } catch (err) {
        next(err);
    }

};