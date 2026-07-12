const reportService = require("./reportServices");

const sendValidationError = (res, details) =>
    res.status(400).json({
        success: false,
        error: "Invalid request.",
        details,
    });

exports.createReport = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const businessId = req.body?.businessId;
        const prompt = req.body?.prompt;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: "Authentication required.",
                details: "userId is missing from the authenticated session.",
            });
        }

        if (!businessId || typeof businessId !== "string" || !businessId.trim()) {
            return sendValidationError(res, "businessId is required.");
        }

        if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
            return sendValidationError(res, "prompt is required.");
        }

        const report = await reportService.createReport({
            businessId: businessId.trim(),
            prompt: prompt.trim(),
            userId,
        });

        res.status(201).json({ success: true, data: report });
    } catch (err) {
        next(err);
    }
};

exports.listReports = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const businessId = req.query?.businessId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: "Authentication required.",
                details: "userId is missing from the authenticated session.",
            });
        }

        if (!businessId || typeof businessId !== "string" || !businessId.trim()) {
            return sendValidationError(res, "businessId is required.");
        }

        const reports = await reportService.listReports({
            businessId: businessId.trim(),
            userId,
        });

        res.status(200).json({ success: true, data: reports });
    } catch (err) {
        next(err);
    }
};

exports.getReportById = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: "Authentication required.",
                details: "userId is missing from the authenticated session.",
            });
        }

        if (!id || typeof id !== "string" || !id.trim()) {
            return sendValidationError(res, "Report id is required.");
        }

        const report = await reportService.getReportById({
            id: id.trim(),
            userId,
        });

        res.status(200).json({ success: true, data: report });
    } catch (err) {
        next(err);
    }
};

exports.deleteReport = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: "Authentication required.",
                details: "userId is missing from the authenticated session.",
            });
        }

        if (!id || typeof id !== "string" || !id.trim()) {
            return sendValidationError(res, "Report id is required.");
        }

        await reportService.deleteReport({
            id: id.trim(),
            userId,
        });

        res.status(200).json({ success: true, message: "Report deleted successfully" });
    } catch (err) {
        next(err);
    }
};
