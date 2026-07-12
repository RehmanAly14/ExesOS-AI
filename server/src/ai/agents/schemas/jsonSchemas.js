const specialistJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    confidence: { type: "number" },
    findings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          impact: { type: "string" },
          description: { type: "string" },
        },
        required: ["title", "impact", "description"],
      },
    },
    recommendations: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["summary", "confidence", "findings", "recommendations"],
};

const executiveJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    executiveSummary: { type: "string" },
    businessHealth: { type: "integer" },
    confidence: { type: "number" },
    financialAnalysis: { type: "string" },
    marketingAnalysis: { type: "string" },
    businessAnalysis: { type: "string" },
    customerSupportAnalysis: { type: "string" },
    topRisks: {
      type: "array",
      items: { type: "string" },
    },
    priorityActions: {
      type: "array",
      items: { type: "string" },
    },
    actionPlan30Day: {
      type: "array",
      items: { type: "string" },
    },
    expectedImpact: { type: "string" },
  },
  required: [
    "title",
    "executiveSummary",
    "businessHealth",
    "confidence",
    "financialAnalysis",
    "marketingAnalysis",
    "businessAnalysis",
    "customerSupportAnalysis",
    "topRisks",
    "priorityActions",
    "actionPlan30Day",
    "expectedImpact",
  ],
};

module.exports = {
  specialistJsonSchema,
  executiveJsonSchema,
};
