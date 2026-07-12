const { FireworksLLMProvider } = require("../llm/providers/FireworksLLMProvider");

class BaseAgent {
  constructor(role, systemPrompt) {
    this.role = role;
    this.systemPrompt = systemPrompt;
    this.llmProvider = new FireworksLLMProvider();
  }

  async generateResponse(query, context) {
    const systemPrompt = `${this.systemPrompt}\n\nContext:\n${context || "No specific context provided."}`;

    try {
      const answer = await this.llmProvider.generateChatResponse({
        systemPrompt,
        userMessage: query,
      });

      return answer;
    } catch (error) {
      console.error(`[${this.role} Agent] Error generating response:`, error.message);
      throw new Error(`Agent ${this.role} failed to generate a response.`);
    }
  }
}

module.exports = BaseAgent;
