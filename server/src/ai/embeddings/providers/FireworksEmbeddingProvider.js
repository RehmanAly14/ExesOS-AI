const axios = require("axios");
const { IEmbeddingProvider } = require("../interfaces/IEmbeddingProvider");

class FireworksEmbeddingProvider extends IEmbeddingProvider {
  constructor() {
    super();
    this.providerNameStr = "fireworks";
    this.dimensionsVal = 768;
    this.batchSize = 100;
  }

  get apiKey() {
    return process.env.FIREWORKS_API_KEY || "";
  }

  get model() {
    return process.env.FIREWORKS_EMBEDDING_MODEL || "nomic-ai/nomic-embed-text-v1.5";
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

    const apiKey = this.apiKey;
    if (!apiKey) {
      throw new Error("Cannot generate embeddings: FIREWORKS_API_KEY is missing.");
    }

    console.log(`[FireworksEmbeddingProvider] Generating embeddings for ${texts.length} text(s)`);

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
              "Authorization": `Bearer ${apiKey}`,
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

    console.log(`[FireworksEmbeddingProvider] Generated ${allEmbeddings.length} embedding(s)`);
    return allEmbeddings;
  }
}

module.exports = {
  FireworksEmbeddingProvider
};
