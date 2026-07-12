const { z } = require("zod");

const findingSchema = z.object({
  title: z.string().optional(),
  impact: z.string().optional(),
  description: z.string().optional(),
});

const specialistResponseSchema = z.object({
  agent: z.string().optional(),
  summary: z.string().min(1, "summary is required"),
  confidence: z.union([z.number(), z.string()]).optional(),
  findings: z.array(findingSchema).optional().default([]),
  recommendations: z.array(z.union([z.string(), z.number()])).optional().default([]),
});

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function maxWords(max, label) {
  return z
    .string()
    .min(8, `${label} is required`)
    .refine((value) => countWords(value) <= max, {
      message: `${label} must be at most ${max} words`,
    });
}

const shortList = z
  .array(z.string().min(3))
  .min(2, "at least 2 items required")
  .max(3, "at most 3 items allowed");

const executiveResponseSchema = z.object({
  title: z.string().min(3).max(100),
  executiveSummary: maxWords(60, "executiveSummary"),
  businessHealth: z.union([z.number(), z.string()]),
  confidence: z.union([z.number(), z.string()]),
  financialAnalysis: maxWords(80, "financialAnalysis"),
  marketingAnalysis: maxWords(70, "marketingAnalysis"),
  businessAnalysis: maxWords(70, "businessAnalysis"),
  customerSupportAnalysis: maxWords(50, "customerSupportAnalysis"),
  topRisks: shortList,
  priorityActions: shortList,
  actionPlan30Day: shortList,
  expectedImpact: maxWords(50, "expectedImpact"),
});

module.exports = {
  specialistResponseSchema,
  executiveResponseSchema,
  countWords,
};
