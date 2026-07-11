const chatWithBusiness = async ({ businessId, message, userId }) => {
    // TODO:
    // 1. Verify business ownership
    // 2. Retrieve relevant chunks
    // 3. Send context + question to Fireworks
    // 4. Return AI response

    return {
        answer: "Chat service ready",
        businessId,
        message
    };
};

module.exports = {
    chatWithBusiness
};