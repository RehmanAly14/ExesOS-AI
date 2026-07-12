const prisma = require("../../config/prisma");
const { FireworksEmbeddingProvider } = require("../embeddings/providers/FireworksEmbeddingProvider");
const { PostgreSQLRetrievalService } = require("./services/PostgreSQLRetrievalService");

/**
 * High-level retrieval facade that embeds the query and searches stored chunks.
 */
class RetrievalService {
  constructor() {
    this.retrieval = new PostgreSQLRetrievalService();
    this.embeddingProvider = new FireworksEmbeddingProvider();
  }

  /**
   * @param {Object} params
   * @param {string} params.query
   * @param {string} params.businessId
   * @param {string} [params.workspaceId]
   * @param {number} [params.topK]
   * @returns {Promise<import("./interfaces/IRetrievalService").IVectorSearchResult[]>}
   */
  async retrieve({ query, businessId, workspaceId, topK = 5 }) {
    if (!query || !query.trim()) {
      throw new Error("query is required for retrieval");
    }
    if (!businessId) {
      throw new Error("businessId is required for retrieval");
    }

    let resolvedWorkspaceId = workspaceId;
    if (!resolvedWorkspaceId) {
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { workspaceId: true },
      });

      if (!business) {
        throw new Error(`Business not found: ${businessId}`);
      }

      resolvedWorkspaceId = business.workspaceId;
    }

    const [queryEmbedding] = await this.embeddingProvider.generateEmbeddingsBatch([query]);

    if (!queryEmbedding || queryEmbedding.length === 0) {
      throw new Error("Failed to generate query embedding");
    }

    return this.retrieval.searchVectors({
      workspaceId: resolvedWorkspaceId,
      businessId,
      query,
      queryEmbedding,
      topK,
    });
  }
}

module.exports = {
  RetrievalService,
};
