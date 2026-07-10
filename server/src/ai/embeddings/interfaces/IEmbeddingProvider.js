/**
 * @interface IEmbeddingProvider
 */
class IEmbeddingProvider {
  /**
   * The unique identifier for the provider (e.g., "fireworks", "openai").
   * @type {string}
   */
  get providerName() {
    throw new Error("Property 'providerName' must be implemented.");
  }

  /**
   * The vector dimensionality returned by this specific provider.
   * @type {number}
   */
  get dimensions() {
    throw new Error("Property 'dimensions' must be implemented.");
  }

  /**
   * Generates embedding vectors for a batch of text inputs.
   * 
   * @param {string[]} texts An array of input strings (chunks) to embed.
   * @returns {Promise<number[][]>} A promise that resolves to a 2D array of numeric vectors.
   */
  async generateEmbeddingsBatch(texts) {
    throw new Error("Method 'generateEmbeddingsBatch()' must be implemented.");
  }
}

module.exports = {
  IEmbeddingProvider
};
