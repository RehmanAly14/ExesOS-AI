const documentService = require("./documentServices");

exports.uploadDocument = async (req, res, next) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const document = await documentService.uploadDocument(
            req.body.businessId,
            req.user.id,
            req.file
        );

        res.status(201).json({
            success: true,
            message: "Document uploaded successfully",
            data: document
        });

    } catch (err) {
        next(err);
    }

};

exports.getBusinessDocuments = async (req, res, next) => {
    try {

        const documents = await documentService.getBusinessDocuments(
            req.params.businessId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: documents
        });

    } catch (err) {
        next(err);
    }
};

exports.getDocumentById = async (req, res, next) => {

    try {

        const document = await documentService.getDocumentById(
            req.params.id,
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: document
        });

    } catch (err) {
        next(err);
    }

};

exports.deleteDocument = async (req, res, next) => {

    try {

        await documentService.deleteDocument(
            req.params.id,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Document deleted successfully"
        });

    } catch (err) {
        next(err);
    }

};
