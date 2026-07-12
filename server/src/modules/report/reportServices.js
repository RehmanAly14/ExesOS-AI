const prisma = require("../../config/prisma");
const { FireworksEmbeddingProvider } = require("../../ai/embeddings/providers/FireworksEmbeddingProvider");
const { PostgreSQLRetrievalService } = require("../../ai/retrieval/services/PostgreSQLRetrievalService");
const { WorkflowOrchestrator } = require("../../ai/orchestrator/WorkflowOrchestrator");
const { validateExecutiveReport } = require("./reportValidation");
const { buildCompactExecutiveContext } = require("./compactExecutiveContext");

const embeddingProvider = new FireworksEmbeddingProvider();
const retrievalService = new PostgreSQLRetrievalService();
const orchestrator = new WorkflowOrchestrator();

const RETRIEVAL_TOP_K = Number.parseInt(process.env.RETRIEVAL_TOP_K || "3", 10);
const CHAT_HISTORY_LIMIT = 3;

const createServiceError = (message, statusCode = 500, details = null) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.publicError = message;
    if (details) error.details = details;
    return error;
};

const assertReportModel = () => {
    if (!prisma?.report || typeof prisma.report.create !== "function") {
        throw createServiceError(
            "Failed to save executive report.",
            500,
            "Report model not initialized. Run: npx prisma generate"
        );
    }
};

const verifyBusinessOwnership = async (businessId, userId) => {
    const business = await prisma.business.findFirst({
        where: {
            id: businessId,
            workspace: { ownerId: userId },
        },
        select: {
            id: true,
            name: true,
            workspaceId: true,
        },
    });

    if (!business) {
        throw createServiceError("Business not found", 404, "Invalid businessId or access denied.");
    }

    return business;
};

const retrieveContext = async ({ business, prompt }) => {
    try {
        const [queryEmbedding] = await embeddingProvider.generateEmbeddingsBatch([prompt]);
        if (!queryEmbedding?.length) return "";

        const ragContext = await retrievalService.buildRagContext({
            workspaceId: business.workspaceId,
            businessId: business.id,
            query: prompt,
            queryEmbedding,
            topK: RETRIEVAL_TOP_K,
        });

        return ragContext.contextText || "";
    } catch (error) {
        console.error(`[ReportService] Retrieval error:`, error.message);
        return "";
    }
};

const pickMetrics = (source, keys) => {
    if (!source || typeof source !== "object") return {};
    return keys.reduce((acc, key) => {
        if (source[key] != null) acc[key] = source[key];
        return acc;
    }, {});
};

const gatherExecutiveContext = async ({ business, userId, prompt }) => {
    const [fullBusiness, chatHistory, retrievedDocuments] = await Promise.all([
        prisma.business.findUnique({
            where: { id: business.id },
            select: {
                id: true,
                name: true,
                description: true,
                industry: true,
                businessType: true,
                businessStage: true,
                website: true,
                country: true,
                city: true,
                currency: true,
                employees: true,
                profile: true,
                aiPreferences: true,
                aiContext: true,
            },
        }),
        prisma.chatMessage.findMany({
            where: { businessId: business.id, userId },
            orderBy: { createdAt: "desc" },
            take: CHAT_HISTORY_LIMIT,
            select: { role: true, content: true, createdAt: true },
        }),
        retrieveContext({ business, prompt }),
    ]);

    if (!fullBusiness) {
        throw createServiceError("Business not found", 404);
    }

    const profile = fullBusiness.profile && typeof fullBusiness.profile === "object" ? fullBusiness.profile : {};
    const aiContext = fullBusiness.aiContext && typeof fullBusiness.aiContext === "object" ? fullBusiness.aiContext : {};

    const financialMetrics = {
        ...pickMetrics(profile, ["revenue", "profit", "expenses", "cashFlow", "budget", "margin"]),
        ...pickMetrics(aiContext, ["financial", "finance", "financialMetrics"]),
    };

    const marketingMetrics = {
        ...pickMetrics(profile, ["marketingSpend", "leads", "conversionRate", "campaigns"]),
        ...pickMetrics(aiContext, ["marketing", "marketingMetrics"]),
    };

    const customerMetrics = {
        ...pickMetrics(profile, ["customers", "retention", "supportTickets", "satisfaction"]),
        ...pickMetrics(aiContext, ["customer", "customerMetrics", "support"]),
    };

    return buildCompactExecutiveContext({
        business: {
            name: fullBusiness.name,
            industry: fullBusiness.industry,
            businessStage: fullBusiness.businessStage,
            employees: fullBusiness.employees,
            currency: fullBusiness.currency,
        },
        profile,
        aiContext,
        financialMetrics,
        marketingMetrics,
        customerMetrics,
        retrievedDocuments,
        chatHistory,
    });
};

const formatReportListItem = (report) => ({
    id: report.id,
    title: report.title,
    businessId: report.businessId,
    businessName: report.business?.name || "",
    prompt: report.prompt,
    executiveSummary: report.executiveSummary,
    businessHealth: report.businessHealth,
    confidence: report.confidence,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
});

const formatReportDetail = (report) => ({
    ...formatReportListItem(report),
    reportMarkdown: report.reportMarkdown,
    reportData: report.reportData,
});

const createReport = async ({ businessId, userId, prompt }) => {
    assertReportModel();

    const business = await verifyBusinessOwnership(businessId, userId);
    const trimmedPrompt = prompt.trim();
    const startedAt = Date.now();

    console.log(`[ReportService] Fast-path executive report for business ${business.id}`);

    const executiveContext = await gatherExecutiveContext({
        business,
        userId,
        prompt: trimmedPrompt,
    });

    let executiveReport;
    try {
        executiveReport = await orchestrator.executeExecutiveWorkflow({
            prompt: trimmedPrompt,
            executiveContext,
        });
    } catch (error) {
        console.error("[ReportService] Generation failed:", error.message);
        throw createServiceError(
            "Executive report generation failed.",
            502,
            error.message
        );
    }

    const validation = validateExecutiveReport(executiveReport);
    if (!validation.valid || !executiveReport.executiveSummary?.trim()) {
        console.error("[ReportService] Report validation failed:", validation.errors.join("; "));
        throw createServiceError(
            "Executive report generation failed.",
            502,
            validation.valid
              ? "Executive summary is missing"
              : `Report quality check failed: ${validation.errors.join("; ")}`
        );
    }

    const reportData = {
        title: executiveReport.title || "Executive Report",
        businessId,
        userId,
        prompt: trimmedPrompt,
        executiveSummary: executiveReport.executiveSummary,
        reportMarkdown: executiveReport.reportMarkdown,
        reportData: executiveReport,
        businessHealth: executiveReport.businessHealth,
        confidence: executiveReport.confidence,
    };

    console.log("Saving report", { title: reportData.title, businessId, userId });

    try {
        const saved = await prisma.report.create({
            data: {
                title: reportData.title,
                businessId: reportData.businessId,
                userId: reportData.userId,
                prompt: reportData.prompt,
                executiveSummary: reportData.executiveSummary,
                reportMarkdown: reportData.reportMarkdown,
                reportData: reportData.reportData,
                businessHealth: reportData.businessHealth,
                confidence: reportData.confidence,
            },
            include: {
                business: { select: { name: true } },
            },
        });

        console.log(`Saved report ${saved.id} in ${Date.now() - startedAt}ms`);
        return formatReportDetail(saved);
    } catch (error) {
        console.error("[ReportService] Failed to persist report:", error.message);
        throw createServiceError(
            "Failed to save executive report.",
            500,
            error.message
        );
    }
};

const listReports = async ({ businessId, userId }) => {
    assertReportModel();
    await verifyBusinessOwnership(businessId, userId);

    const reports = await prisma.report.findMany({
        where: { businessId, userId },
        orderBy: { createdAt: "desc" },
        include: {
            business: { select: { name: true } },
        },
    });

    return reports.map(formatReportListItem);
};

const getReportById = async ({ id, userId }) => {
    assertReportModel();

    const report = await prisma.report.findFirst({
        where: {
            id,
            user: { id: userId },
        },
        include: {
            business: { select: { name: true } },
        },
    });

    if (!report) {
        throw createServiceError("Report not found", 404, "No report exists for this id.");
    }

    return formatReportDetail(report);
};

const deleteReport = async ({ id, userId }) => {
    assertReportModel();

    const report = await prisma.report.findFirst({
        where: { id, userId },
        select: { id: true },
    });

    if (!report) {
        throw createServiceError("Report not found", 404, "No report exists for this id.");
    }

    await prisma.report.delete({ where: { id } });
};

module.exports = {
    createReport,
    listReports,
    getReportById,
    deleteReport,
};
