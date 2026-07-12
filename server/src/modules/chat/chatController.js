const chatService = require("./chatServices");

exports.chat = async (req, res, next) => {
    try {
        const response = await chatService.chatWithBusiness({
            businessId: req.body.businessId,
            message: req.body.message,
            userId: req.user.id
        });

        res.status(200).json({
            success: true,
            data: response
        });

    } catch (err) {
        next(err);
    }
};

exports.getChatHistory = async (req, res, next) => {
    try {
        const messages = await chatService.getChatHistory({
            businessId: req.query.businessId,
            userId: req.user.id,
        });

        res.status(200).json({
            success: true,
            data: messages,
        });
    } catch (err) {
        next(err);
    }
};
