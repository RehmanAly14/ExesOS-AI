const businessService = require("./businessServices");

exports.createBusiness = async (req, res, next) => {

    try {

        const business =
            await businessService.createBusiness(
                req.body,
                req.user.id
            );

        res.status(201).json({

            success: true,

            message: "Business created successfully",

            data: business

        });

    } catch (err) {

        next(err);

    }

};

exports.getWorkspaceBusinesses = async (req, res, next) => {
    try {

        const businesses = await businessService.getWorkspaceBusinesses(
            req.params.workspaceId,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            data: businesses,
        });

    } catch (error) {
        next(error);
    }
};

exports.getBusinessById = async (req, res, next) => {

    try {

        const business =
            await businessService.getBusinessById(
                req.params.id,
                req.user.id
            );

        res.status(200).json({
            success: true,
            data: business
        });

    } catch (err) {
        next(err);
    }

};

exports.updateBusiness = async (req, res, next) => {
    try {

        const updatedBusiness = await businessService.updateBusiness(
            req.params.id,
            req.user.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Business updated successfully",
            data: updatedBusiness,
        });

    } catch (error) {
        next(error);
    }
};

exports.deleteBusiness = async (req, res, next) => {

    try {

        await businessService.deleteBusiness(
            req.params.id,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Business deleted successfully"
        });

    } catch (err) {
        next(err);
    }

};