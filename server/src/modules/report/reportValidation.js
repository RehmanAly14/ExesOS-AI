const PLACEHOLDER_PATTERNS = [
  /temporarily unavailable/i,
  /no financial analysis/i,
  /no marketing analysis/i,
  /no business analysis/i,
  /no customer support analysis/i,
  /no material risks/i,
  /no priority actions/i,
  /no action plan/i,
  /impact assessment pending/i,
  /not available/i,
  /\bn\/a\b/i,
  /\bpending\b/i,
  /\bunknown\b/i,
];

const MIN_SECTION_LENGTH = 25;

function hasPlaceholderText(text) {
  if (!text || typeof text !== "string") return true;
  const trimmed = text.trim();
  if (trimmed.length < MIN_SECTION_LENGTH) return true;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function validateExecutiveReport(report) {
  const errors = [];

  const textSections = [
    "executiveSummary",
    "financialAnalysis",
    "marketingAnalysis",
    "businessAnalysis",
    "customerSupportAnalysis",
    "expectedImpact",
  ];

  textSections.forEach((section) => {
    if (hasPlaceholderText(report[section])) {
      errors.push(`${section} is missing or too short`);
    }
  });

  ["topRisks", "priorityActions", "actionPlan30Day"].forEach((section) => {
    if (!Array.isArray(report[section]) || report[section].length < 2) {
      errors.push(`${section} must contain at least 2 items`);
    } else {
      report[section].forEach((item, index) => {
        if (hasPlaceholderText(String(item))) {
          errors.push(`${section}[${index}] contains placeholder text`);
        }
      });
    }
  });

  if (report.businessHealth == null || Number.isNaN(Number(report.businessHealth))) {
    errors.push("businessHealth is required");
  }

  if (report.confidence == null || Number.isNaN(Number(report.confidence))) {
    errors.push("confidence is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateExecutiveReport,
  hasPlaceholderText,
};
