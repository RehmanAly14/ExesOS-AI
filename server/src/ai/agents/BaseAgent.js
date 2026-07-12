const axios = require("axios");

class BaseAgent {
  constructor(role, systemPrompt) {
    this.role = role;
    this.systemPrompt = systemPrompt;
    this.apiKey = process.env.FIREWORKS_API_KEY || "";
    this.model = process.env.FIREWORKS_CHAT_MODEL || "accounts/fireworks/models/llama-v3p1-8b-instruct";
  }

  async generateResponse(query, context) {
    if (!this.apiKey) {
      throw new Error("FIREWORKS_API_KEY is missing. Cannot generate chat response.");
    }

    const messages = [
      {
        role: "system",
        content: `${this.systemPrompt}\n\nContext:\n${context || "No specific context provided."}`
      },
      {
        role: "user",
        content: query
      }
    ];

    try {
      const response = await axios.post(
        "https://api.fireworks.ai/inference/v1/chat/completions",
        {
          model: this.model,
          messages,
          max_tokens: 1024,
          temperature: 0.2
        },
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error(`[${this.role} Agent] Error generating response:`, error.response?.data || error.message);
      throw new Error(`Agent ${this.role} failed to generate a response.`);
    }
  }
}

module.exports = BaseAgent;
