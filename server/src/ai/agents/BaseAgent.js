const { FireworksLLMProvider } = require("../llm/providers/FireworksLLMProvider");
const { buildSpecialistSystemPrompt } = require("./prompts/structuredOutputRules");
const { fetchStructuredResponse } = require("./utils/structuredFetch");
const { parseSpecialistResponse } = require("./utils/parseAgentJson");
const { formatSpecialistMarkdown } = require("./utils/formatAgentMarkdown");

class BaseAgent {
  constructor({ role, roleTitle, domainFocus }) {
    this.role = role;
    this.roleTitle = roleTitle;
    this.domainFocus = domainFocus;
    this.llmProvider = new FireworksLLMProvider();
  }

  buildSystemPrompt(context) {
    return buildSpecialistSystemPrompt({
      roleTitle: this.roleTitle,
      domainFocus: this.domainFocus,
      context,
    });
  }

  buildSpecialistFallback() {
    return {
      agent: this.roleTitle,
      summary: "Insight is temporarily unavailable. Please try again.",
      confidence: 0.5,
      findings: [],
      recommendations: [],
    };
  }

  async generateBusinessInsight(query, context) {
    const systemPrompt = this.buildSystemPrompt(context);

    return fetchStructuredResponse({
      label: this.roleTitle,
      maxAttempts: this.llmProvider.maxStructuredRetries + 1,
      fetchRaw: () =>
        this.llmProvider.generateStructuredResponse({
          systemPrompt,
          userMessage: query,
        }),
      parseFn: (raw) => {
        const { insight, parseMeta } = parseSpecialistResponse(raw, this.roleTitle);
        return { result: insight, parseMeta };
      },
      fallback: () => this.buildSpecialistFallback(),
    });
  }

  async generateResponse(query, context) {
    const insight = await this.generateBusinessInsight(query, context);
    return formatSpecialistMarkdown(insight);
  }
}

module.exports = BaseAgent;
