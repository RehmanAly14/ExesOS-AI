const MAX_DOC_SUMMARY_CHARS = 500;
const MAX_CHAT_MESSAGES = 3;
const MAX_CHAT_MSG_CHARS = 120;

function truncateText(text, maxChars) {
  if (!text || typeof text !== "string") return "";
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxChars) return cleaned;
  return `${cleaned.slice(0, maxChars)}...`;
}

function pickDefined(source, keys) {
  if (!source || typeof source !== "object") return {};
  return keys.reduce((acc, key) => {
    const value = source[key];
    if (value != null && value !== "") acc[key] = value;
    return acc;
  }, {});
}

function summarizeRetrievedDocuments(rawText) {
  if (!rawText || !rawText.trim()) {
    return "No document excerpts available.";
  }

  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 4);

  return truncateText(lines.join(" | "), MAX_DOC_SUMMARY_CHARS);
}

function summarizeChatHistory(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "No recent chat.";
  }

  return messages
    .slice(-MAX_CHAT_MESSAGES)
    .map((msg) => `[${msg.role}] ${truncateText(msg.content, MAX_CHAT_MSG_CHARS)}`)
    .join(" ");
}

/**
 * Compact context bundle — KPIs and trends only, no verbose RAG dumps.
 */
function buildCompactExecutiveContext({
  business,
  profile,
  aiContext,
  financialMetrics,
  marketingMetrics,
  customerMetrics,
  retrievedDocuments,
  chatHistory,
}) {
  const mergedFinancial = {
    ...pickDefined(profile, ["revenue", "expenses", "profit", "margin", "cashFlow", "budget"]),
    ...pickDefined(aiContext, ["financial", "finance"]),
    ...financialMetrics,
  };

  const mergedMarketing = {
    ...pickDefined(profile, ["marketingSpend", "leads", "conversionRate", "campaigns"]),
    ...pickDefined(aiContext, ["marketing"]),
    ...marketingMetrics,
  };

  const mergedCustomer = {
    ...pickDefined(profile, ["customers", "retention", "supportTickets", "satisfaction", "churn", "nps", "csat"]),
    ...pickDefined(aiContext, ["customer", "support"]),
    ...customerMetrics,
  };

  return {
    business: pickDefined(business, [
      "name",
      "industry",
      "businessStage",
      "employees",
      "currency",
    ]),
    kpis: pickDefined(profile, [
      "revenue",
      "expenses",
      "profit",
      "margin",
      "growthRate",
      "mrr",
      "arr",
      "churn",
      "cac",
      "ltv",
      "nps",
      "csat",
    ]),
    financial: mergedFinancial,
    marketing: mergedMarketing,
    customer: mergedCustomer,
    inventory: pickDefined(profile, ["inventory", "stock", "warehouse"]),
    recentTrends: summarizeRetrievedDocuments(retrievedDocuments),
    recentChat: summarizeChatHistory(chatHistory),
  };
}

module.exports = {
  buildCompactExecutiveContext,
  summarizeRetrievedDocuments,
  summarizeChatHistory,
  truncateText,
};
