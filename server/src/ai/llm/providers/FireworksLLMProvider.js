const axios = require("axios");

class FireworksLLMProvider {
  get apiKey() {
    return process.env.FIREWORKS_API_KEY || "";
  }

  get model() {
    return (
      process.env.FIREWORKS_LLM_MODEL ||
      "accounts/fireworks/models/kimi-k2p6"
    );
  }

  /**
   * @param {Object} params
   * @param {string} params.systemPrompt
   * @param {string} params.userMessage
   * @returns {Promise<string>}
   */
  async generateChatResponse({ systemPrompt, userMessage }) {
    if (!this.apiKey) {
      throw new Error("Cannot generate chat response: FIREWORKS_API_KEY is missing.");
    }

    if (!userMessage || !userMessage.trim()) {
      throw new Error("userMessage is required");
    }

    try {
      const response = await axios.post(
        "https://api.fireworks.ai/inference/v1/chat/completions",
        {
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.3,
          max_tokens: 1024,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const answer = response.data?.choices?.[0]?.message?.content;
      if (!answer || !answer.trim()) {
        throw new Error("LLM returned an empty response");
      }

      return answer.trim();
    } catch (error) {
      console.error(
        "Fireworks LLM Error:",
        error.response?.data || error.message
      );
      throw new Error(`Failed to generate chat response: ${error.message}`);
    }
  }
}

module.exports = {
  FireworksLLMProvider,
};
