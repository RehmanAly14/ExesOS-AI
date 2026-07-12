const axios = require("axios");
const { isJsonTruncated } = require("../../agents/utils/extractJson");
const {
  getChatModel,
  getExecutiveModel,
  getFallbackModel,
  getStructuredOutputMode,
  FIREWORKS_CHAT_URL,
} = require("../../../config/fireworks");

const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.FIREWORKS_REQUEST_TIMEOUT_MS || "35000", 10);
const EXECUTIVE_MAX_TOKENS = Number.parseInt(process.env.FIREWORKS_EXECUTIVE_MAX_TOKENS || "1200", 10);
const MAX_STRUCTURED_RETRIES = 1;

class FireworksLLMProvider {
  get apiKey() {
    return process.env.FIREWORKS_API_KEY || "";
  }

  get headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  assertApiKey() {
    if (!this.apiKey) {
      throw new Error("Cannot generate chat response: FIREWORKS_API_KEY is missing.");
    }
  }

  extractContent(response) {
    const message = response.data?.choices?.[0]?.message;
    const answer = message?.content;
    if (!answer || !answer.trim()) {
      const error = new Error("LLM returned an empty response");
      error.code = "EMPTY_RESPONSE";
      throw error;
    }
    return answer.trim();
  }

  logExecutiveCompletion({
    model,
    latencyMs,
    usage,
    truncated,
    finishReason,
    attempt,
  }) {
    console.log(
      `[FireworksLLM] executive-json model=${model} latencyMs=${latencyMs} ` +
        `promptTokens=${usage?.prompt_tokens ?? 0} completionTokens=${usage?.completion_tokens ?? 0} ` +
        `truncated=${truncated} finishReason=${finishReason || "unknown"} attempt=${attempt}`
    );
  }

  isModelUnavailableError(error) {
    const message = error.response?.data?.error?.message || error.message || "";
    return /not found|inaccessible|not deployed|404/i.test(message);
  }

  async postCompletion(payload, context = "completion") {
    this.assertApiKey();
    const startedAt = Date.now();

    try {
      const response = await axios.post(FIREWORKS_CHAT_URL, payload, {
        headers: this.headers,
        timeout: REQUEST_TIMEOUT_MS,
      });

      const latencyMs = Date.now() - startedAt;
      const content = this.extractContent(response);
      const usage = response.data?.usage || {};
      const finishReason = response.data?.choices?.[0]?.finish_reason || null;
      const truncated =
        finishReason === "length" || isJsonTruncated(content);

      return { content, usage, latencyMs, model: payload.model, finishReason, truncated };
    } catch (error) {
      if (this.isModelUnavailableError(error)) {
        const modelError = new Error(`Model unavailable: ${payload.model}`);
        modelError.code = "MODEL_UNAVAILABLE";
        modelError.model = payload.model;
        throw modelError;
      }

      console.error(
        "[FireworksLLM] Error:",
        error.response?.data?.error?.message || error.message
      );
      throw new Error(`Failed to generate chat response: ${error.message}`);
    }
  }

  buildResponseFormat(modelId) {
    const mode = getStructuredOutputMode(modelId);
    if (mode === "json_schema") return null;
    return { type: "json_object" };
  }

  async generateChatResponse({ systemPrompt, userMessage }) {
    if (!userMessage || !userMessage.trim()) {
      throw new Error("userMessage is required");
    }

    const result = await this.postCompletion(
      {
        model: getChatModel(),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      },
      "chat"
    );

    return result.content;
  }

  /**
   * Executive JSON — returns full metadata for truncation detection.
   */
  async generateExecutiveJson({ systemPrompt, userMessage, attempt = 1 }) {
    if (!userMessage || !userMessage.trim()) {
      throw new Error("userMessage is required");
    }

    const useFallbackModel = attempt > 1;
    const model = useFallbackModel ? getFallbackModel() : getExecutiveModel();
    const responseFormat = this.buildResponseFormat(model);

    const result = await this.postCompletion({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0,
      max_tokens: EXECUTIVE_MAX_TOKENS,
      ...(responseFormat ? { response_format: responseFormat } : {}),
    });

    this.logExecutiveCompletion({
      model: result.model,
      latencyMs: result.latencyMs,
      usage: result.usage,
      truncated: result.truncated,
      finishReason: result.finishReason,
      attempt,
    });

    if (!result.content.trim().startsWith("{")) {
      const error = new Error("Model returned non-JSON output");
      error.code = "NON_JSON_OUTPUT";
      throw error;
    }

    return result;
  }

  /** @deprecated Use generateExecutiveJson for reports */
  async generateStructuredResponse({ systemPrompt, userMessage, attempt = 1 }) {
    const result = await this.generateExecutiveJson({ systemPrompt, userMessage, attempt });
    return result.content;
  }

  get maxStructuredRetries() {
    return MAX_STRUCTURED_RETRIES;
  }
}

module.exports = {
  FireworksLLMProvider,
};
