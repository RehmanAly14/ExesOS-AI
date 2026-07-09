/**
 * IEmbeddingProvider
 * 
 * Responsibilities:
 * - Acts as an independent abstraction layer between the processing pipeline and the external model APIs.
 * - Hides the complexity of API calls, batching, and token limit handling for generating vectors.
 * 
 * Provider Independence:
 * The pipeline relies only on this interface. This guarantees that the system can seamlessly switch
 * from one provider (e.g., Fireworks) to another (e.g., OpenAI, local models) by simply swapping the injected implementation.
 */
export interface IEmbeddingProvider {
  /**
   * The unique identifier for the provider (e.g., "fireworks", "openai").
   */
  readonly providerName: string;

  /**
   * The vector dimensionality returned by this specific provider.
   */
  readonly dimensions: number;

  /**
   * Generates embedding vectors for a batch of text inputs.
   * 
   * @param texts An array of input strings (chunks) to embed.
   * @returns A promise that resolves to a 2D array of numeric vectors.
   */
  generateEmbeddingsBatch(texts: string[]): Promise<number[][]>;
}
