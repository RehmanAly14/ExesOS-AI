const axios = require("axios");
const { IEmbeddingProvider } = require("../interfaces/IEmbeddingProvider");

class FireworksEmbeddingProvider extends IEmbeddingProvider {
  constructor() {
    super();
    this.providerNameStr = "fireworks";
    this.dimensionsVal = 768; // Nomic-embed-text dimensions

    this.apiKey = process.env.FIREWORKS_API_KEY || "";
    this.model = process.env.FIREWORKS_EMBEDDING_MODEL || "nomic-ai/nomic-embed-text-v1.5";
    this.batchSize = 100; // API limits and optimal batching
    
    if (!this.apiKey) {
      console.warn("WARNING: FIREWORKS_API_KEY is not set in environment variables.");
    }
  }

  get providerName() {
    return this.providerNameStr;
  }

  get dimensions() {
    return this.dimensionsVal;
  }

  /**
   * Generates embeddings for a batch of text chunks using Fireworks AI.
   * Handles chunking into smaller API batches if necessary.
   * @param {string[]} texts An array of input strings (chunks) to embed.
   * @returns {Promise<number[][]>} A promise that resolves to a 2D array of numeric vectors.
   */
  async generateEmbeddingsBatch(texts) {
    if (texts.length === 0) return [];
    if (!this.apiKey) {
      throw new Error("Cannot generate embeddings: FIREWORKS_API_KEY is missing.");
    }

    const allEmbeddings = [];

    // Process in batches
    for (let i = 0; i < texts.length; i += this.batchSize) {
      const batch = texts.slice(i, i + this.batchSize);
      
      try {
        const response = await axios.post(
          "https://api.fireworks.ai/inference/v1/embeddings",
          {
            model: this.model,
            input: batch,
          },
          {
            headers: {
              "Authorization": `Bearer ${this.apiKey}`,
              "Content-Type": "application/json"
            }
          }
        );

        // Sort data by index just in case the API returns out of order
        const data = response.data.data.sort((a, b) => a.index - b.index);
        const embeddings = data.map((item) => item.embedding);
        
        allEmbeddings.push(...embeddings);
      } catch (error) {
        console.error("Fireworks AI Embedding Error:", error.response?.data || error.message);
        throw new Error(`Failed to generate embeddings: ${error.message}`);
      }
    }

    return allEmbeddings;
  }
}

module.exports = {
  FireworksEmbeddingProvider
};
