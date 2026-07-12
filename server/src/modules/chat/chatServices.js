const prisma = require("../../config/prisma");
const { FireworksEmbeddingProvider } = require("../../ai/embeddings/providers/FireworksEmbeddingProvider");
const { PostgreSQLRetrievalService } = require("../../ai/retrieval/services/PostgreSQLRetrievalService");
const { FireworksLLMProvider } = require("../../ai/llm/providers/FireworksLLMProvider");

const embeddingProvider = new FireworksEmbeddingProvider();
const retrievalService = new PostgreSQLRetrievalService();
const llmProvider = new FireworksLLMProvider();

const RETRIEVAL_TOP_K = Number.parseInt(process.env.RETRIEVAL_TOP_K || "5", 10);

const verifyBusinessOwnership = async (businessId, userId) => {
    const business = await prisma.business.findFirst({
        where: {
            id: businessId,
            workspace: {
                ownerId: userId
            }
        },
        select: {
            id: true,
            name: true,
            workspaceId: true
        }
    });

    if (!business) {
        const error = new Error("Business not found");
        error.statusCode = 404;
        throw error;
    }

    return business;
};

const formatChatMessage = (message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
});

const saveChatMessage = async ({ businessId, userId, role, content }) => {
    const message = await prisma.chatMessage.create({
        data: {
            businessId,
            userId,
            role,
            content,
        },
    });

    return formatChatMessage(message);
};

const truncateForLog = (text, maxLength = 120) => {
    if (!text) return "";
    return text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;
};

const buildSystemPrompt = (contextText) => {
    const context = contextText && contextText.trim()
        ? contextText.trim()
        : "No relevant document context was found.";

    return `You are an AI executive assistant.

CONTEXT:
${context}`;
};

const logRetrievalHits = (businessId, chunks) => {
    console.log(
        `[ChatService] Retrieval hit for business ${businessId}: ${chunks.length} chunk(s)`
    );

    chunks.forEach((chunk, index) => {
        console.log(
            `[ChatService]   [${index + 1}] score=${chunk.score.toFixed(4)} ` +
            `documentId=${chunk.source.documentId} ` +
            `chunkId=${chunk.source.chunkId} ` +
            `chunkIndex=${chunk.source.chunkIndex} ` +
            `title="${chunk.source.title}"`
        );
    });
};

const retrieveContext = async ({ business, message }) => {
    const emptyResult = {
        contextText: "",
        retrievedChunks: [],
        missingContext: true,
    };

    try {
        const [queryEmbedding] = await embeddingProvider.generateEmbeddingsBatch([message]);

        if (!queryEmbedding || queryEmbedding.length === 0) {
            console.warn(
                `[ChatService] Retrieval miss for business ${business.id}: failed to generate query embedding`
            );
            return emptyResult;
        }

        const ragContext = await retrievalService.buildRagContext({
            workspaceId: business.workspaceId,
            businessId: business.id,
            query: message,
            queryEmbedding,
            topK: RETRIEVAL_TOP_K,
        });

        if (ragContext.missingContext) {
            console.log(
                `[ChatService] Retrieval miss for business ${business.id}: ` +
                `no relevant chunks for query "${truncateForLog(message)}"`
            );
            return emptyResult;
        }

        logRetrievalHits(business.id, ragContext.retrievedChunks);
        return ragContext;
    } catch (error) {
        console.error(
            `[ChatService] Retrieval error for business ${business.id}:`,
            error.message
        );
        return emptyResult;
    }
};

const formatRetrievalMetadata = (retrievedChunks, missingContext) => ({
    sourceCount: retrievedChunks.length,
    missingContext,
    scores: retrievedChunks.map((chunk) => chunk.score),
    sources: retrievedChunks.map((chunk) => ({
        documentId: chunk.source.documentId,
        chunkId: chunk.source.chunkId,
        chunkIndex: chunk.source.chunkIndex,
        title: chunk.source.title,
        score: chunk.score,
        contentPreview: chunk.content.slice(0, 200),
    })),
});

const getChatHistory = async ({ businessId, userId }) => {
    if (!businessId) {
        const error = new Error("businessId is required");
        error.statusCode = 400;
        throw error;
    }

    await verifyBusinessOwnership(businessId, userId);

    const messages = await prisma.chatMessage.findMany({
        where: {
            businessId,
            userId,
        },
        orderBy: {
            createdAt: "asc",
        },
        select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
        },
    });

    return messages.map(formatChatMessage);
};

const chatWithBusiness = async ({ businessId, message, userId }) => {
    if (!message || !message.trim()) {
        const error = new Error("message is required");
        error.statusCode = 400;
        throw error;
    }

    if (!businessId) {
        const error = new Error("businessId is required");
        error.statusCode = 400;
        throw error;
    }

    const business = await verifyBusinessOwnership(businessId, userId);
    const trimmedMessage = message.trim();

    console.log(
        `[ChatService] Processing chat for business ${business.id} (${business.name})`
    );

    const userMessage = await saveChatMessage({
        businessId,
        userId,
        role: "user",
        content: trimmedMessage,
    });

    const ragContext = await retrieveContext({
        business,
        message: trimmedMessage,
    });

    const systemPrompt = buildSystemPrompt(ragContext.contextText);
    const answer = await llmProvider.generateChatResponse({
        systemPrompt,
        userMessage: trimmedMessage,
    });

    const assistantMessage = await saveChatMessage({
        businessId,
        userId,
        role: "assistant",
        content: answer,
    });

    return {
        answer,
        businessId,
        message: trimmedMessage,
        retrieval: formatRetrievalMetadata(
            ragContext.retrievedChunks,
            ragContext.missingContext
        ),
        messages: [userMessage, assistantMessage],
    };
};

module.exports = {
    chatWithBusiness,
    getChatHistory,
};
