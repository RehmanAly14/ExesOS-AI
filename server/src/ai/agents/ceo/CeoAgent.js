const { FireworksLLMProvider } = require("../../llm/providers/FireworksLLMProvider");
const { buildExecutiveMessages } = require("../prompts/structuredOutputRules");
const { parseExecutiveResponse } = require("../utils/parseAgentJson");
const { formatExecutiveReportMarkdown } = require("../utils/formatAgentMarkdown");

class CeoAgent {
  constructor() {
    this.role = "CEO";
    this.roleTitle = "ExecOS Executive";
    this.llmProvider = new FireworksLLMProvider();
  }

  logExecutiveResult({ attempt, llmResult, parseMeta, totalLatencyMs }) {
    console.log(
      `[${this.roleTitle}] attempt=${attempt} latencyMs=${totalLatencyMs} ` +
        `promptTokens=${llmResult.usage?.prompt_tokens ?? 0} ` +
        `completionTokens=${llmResult.usage?.completion_tokens ?? 0} ` +
        `truncated=${llmResult.truncated} ` +
        `jsonParse=${parseMeta.extractionSucceeded} ` +
        `validation=${parseMeta.schemaValidationPassed}`
    );
  }

  async generateExecutiveReport({ prompt, executiveContext }) {
    const startedAt = Date.now();
    const maxAttempts = this.llmProvider.maxStructuredRetries + 1;
    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const compact = attempt > 1;

      const { systemPrompt, userMessage } = buildExecutiveMessages({
        prompt,
        executiveContext,
        compact,
      });

      try {
        const llmResult = await this.llmProvider.generateExecutiveJson({
          systemPrompt,
          userMessage,
          attempt,
        });

        if (llmResult.truncated) {
          const error = new Error("Truncated JSON response");
          error.code = "JSON_TRUNCATED";
          throw error;
        }

        const { report, parseMeta } = parseExecutiveResponse(llmResult.content);

        if (!report.executiveSummary?.trim()) {
          throw new Error("Executive summary is missing");
        }

        this.logExecutiveResult({
          attempt,
          llmResult,
          parseMeta,
          totalLatencyMs: Date.now() - startedAt,
        });

        return {
          ...report,
          reportMarkdown: formatExecutiveReportMarkdown(report),
        };
      } catch (error) {
        lastError = error;
        console.error(
          `[${this.roleTitle}] attempt=${attempt} failed: ${error.message}`
        );

        if (error.code === "MODEL_UNAVAILABLE") break;
      }
    }

    throw lastError || new Error("Executive report generation failed");
  }
}

module.exports = CeoAgent;
