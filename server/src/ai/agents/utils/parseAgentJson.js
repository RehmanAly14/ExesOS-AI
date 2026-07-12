const {
  specialistResponseSchema,
  executiveResponseSchema,
} = require("../schemas/agentSchemas");
const { extractJson } = require("./extractJson");

function normalizeFindings(findings) {
  if (!Array.isArray(findings)) return [];
  return findings
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      title: String(item.title || "Finding"),
      impact: String(item.impact || "Medium"),
      description: String(item.description || ""),
    }));
}

function normalizeList(items, maxItems = 3) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => String(item)).filter(Boolean).slice(0, maxItems);
}

function clampConfidence(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 0.75;
  if (num > 1) return Math.min(num / 100, 1);
  return Math.max(0, Math.min(1, num));
}

function clampHealth(value) {
  const num = Number.parseInt(value, 10);
  if (Number.isNaN(num)) return 75;
  return Math.max(0, Math.min(100, num));
}

function parseWithValidation(rawText, schema, label) {
  const { value, extractionSucceeded, repairSucceeded } = extractJson(rawText);
  const result = schema.safeParse(value);

  const parseMeta = {
    extractionSucceeded,
    repairSucceeded,
    schemaValidationPassed: result.success,
  };

  if (!result.success) {
    const details = result.error.issues.map((issue) => issue.message).join("; ");
    const error = new Error(`${label} schema validation failed: ${details}`);
    error.parseMeta = parseMeta;
    throw error;
  }

  return { data: result.data, parseMeta };
}

function parseSpecialistResponse(rawText, fallbackAgentName) {
  const { data: parsed, parseMeta } = parseWithValidation(
    rawText,
    specialistResponseSchema,
    "Specialist"
  );

  return {
    insight: {
      agent: String(parsed.agent || fallbackAgentName),
      summary: String(parsed.summary),
      confidence: clampConfidence(parsed.confidence),
      findings: normalizeFindings(parsed.findings),
      recommendations: normalizeList(parsed.recommendations, 10),
    },
    parseMeta,
  };
}

function parseExecutiveResponse(rawText) {
  const { data: parsed, parseMeta } = parseWithValidation(
    rawText,
    executiveResponseSchema,
    "Executive"
  );

  return {
    report: {
      title: String(parsed.title || "Executive Report"),
      executiveSummary: String(parsed.executiveSummary),
      businessHealth: clampHealth(parsed.businessHealth),
      confidence: clampConfidence(parsed.confidence),
      financialAnalysis: String(parsed.financialAnalysis),
      marketingAnalysis: String(parsed.marketingAnalysis),
      businessAnalysis: String(parsed.businessAnalysis),
      customerSupportAnalysis: String(parsed.customerSupportAnalysis),
      topRisks: normalizeList(parsed.topRisks),
      priorityActions: normalizeList(parsed.priorityActions),
      actionPlan30Day: normalizeList(parsed.actionPlan30Day),
      expectedImpact: String(parsed.expectedImpact),
    },
    parseMeta,
  };
}

module.exports = {
  extractJson,
  parseSpecialistResponse,
  parseExecutiveResponse,
};
