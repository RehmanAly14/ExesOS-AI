const { PostgreSQLRetrievalService } = require("../../ai/retrieval/services/PostgreSQLRetrievalService");
const { FireworksEmbeddingProvider } = require("../../ai/embeddings/providers/FireworksEmbeddingProvider");
const agentRouter = require("../../ai/agents/AgentRouter");
const prisma = require("../../config/prisma");

const chatWithBusiness = async ({ businessId, message, userId }) => {
    // 1. Verify business ownership and get workspaceId
    const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { workspaceId: true }
    });

    if (!business) {
        throw new Error("Business not found");
    }

    // 2. Retrieve relevant chunks
    const embeddingProvider = new FireworksEmbeddingProvider();
    const queryEmbeddings = await embeddingProvider.generateEmbeddingsBatch([message]);
    const queryEmbedding = queryEmbeddings[0];

    const retrievalService = new PostgreSQLRetrievalService();
    const ragContext = await retrievalService.buildRagContext({
        workspaceId: business.workspaceId,
        businessId,
        query: message,
        queryEmbedding,
        topK: 5
    });

    // 3. Agent Router
    const specialistAgent = agentRouter.route(message);

    // 4. Send context + question to Agent (which uses Fireworks Chat)
    const aiResponse = await specialistAgent.generateResponse(message, ragContext.contextText);

    // 5. Return AI response
    return {
        answer: aiResponse,
        businessId,
        message,
        agent: specialistAgent.role,
        sources: ragContext.sources || []
    };
};

module.exports = {
    chatWithBusiness
};