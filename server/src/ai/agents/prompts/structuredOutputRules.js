const FORBIDDEN = 'No preamble. JSON only. Start with { end with }.';

const SCHEMA = `{"title":"","executiveSummary":"max 60w","businessHealth":0,"confidence":0.0,"financialAnalysis":"max 80w","marketingAnalysis":"max 70w","businessAnalysis":"max 70w","customerSupportAnalysis":"max 50w","topRisks":["",""],"priorityActions":["",""],"actionPlan30Day":["",""],"expectedImpact":"max 50w"}`;

const COMPACT = 'ULTRA-COMPACT: half word limits, 2 items per list, one sentence per field.';

function buildExecutiveMessages({ prompt, executiveContext, compact = false }) {
  const data = JSON.stringify(executiveContext);

  const systemPrompt = `ExecOS AI. Output ONE concise executive report JSON as CFO+CMO+Analyst+CS+CEO.
${FORBIDDEN}
${compact ? COMPACT : 'Keep concise. No repeated KPIs. Short sentences. 2-3 list items max.'}
Schema: ${SCHEMA}`;

  const userMessage = `${compact ? 'SHORT ' : ''}Report JSON for: ${prompt}
Data: ${data}`;

  return { systemPrompt, userMessage };
}

function buildSpecialistSystemPrompt({ roleTitle, domainFocus, context }) {
  return `You are the ${roleTitle} of ExecOS AI. ${domainFocus}
${FORBIDDEN}
Return JSON: {"summary":"","confidence":0.9,"findings":[],"recommendations":[]}
Context: ${context || "none"}`;
}

module.exports = {
  buildSpecialistSystemPrompt,
  buildExecutiveMessages,
};
