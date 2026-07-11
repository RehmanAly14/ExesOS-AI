/**
 * @typedef {Object} IVectorSearchFilters
 * @property {string} [businessId] - Optional business-level scope within the workspace.
 * @property {string[]} [documentIds] - Optional source document filter.
 * @property {string[]} [documentTypes] - Optional document type filter.
 * @property {string[]} [mimeTypes] - Optional MIME type filter.
 * @property {Record<string, unknown>} [metadata] - Optional metadata filters.
 */

/**
 * @typedef {Object} IVectorSearchRequest
 * @property {string} workspaceId - Required workspace scope.
 * @property {string} [businessId] - Optional business-level scope inside the workspace.
 * @property {string} query - Original user or agent query text.
 * @property {number[]} queryEmbedding - Generated upstream by the embedding pipeline.
 * @property {number} topK - Maximum number of chunks to return.
 * @property {IVectorSearchFilters} [filters] - Optional document and metadata filters.
 */

/**
 * @typedef {Object} ISourceCitation
 * @property {string} documentId - Source document ID.
 * @property {string} chunkId - Source chunk ID.
 * @property {number} chunkIndex - Chunk position in the source document.
 * @property {string} title - Human-readable source title.
 * @property {string} [source] - Optional source path or label.
 */

/**
 * @typedef {Object} IVectorSearchResult
 * @property {string} content - Retrieved chunk content.
 * @property {number} score - Similarity score.
 * @property {ISourceCitation} source - Source citation metadata.
 * @property {import("../../embeddings/schemas/VectorSchema").IVectorMetadata} metadata - Full vector metadata.
 */

/**
 * @typedef {Object} IRagContextPackage
 * @property {string} workspaceId - Workspace scope used for retrieval.
 * @property {string} [businessId] - Present when retrieval was scoped to one business.
 * @property {string} query - Original query text.
 * @property {string} contextText - Assembled context for downstream agents.
 * @property {ISourceCitation[]} sources - Source citations included in the context.
 * @property {IVectorSearchResult[]} retrievedChunks - Raw ranked chunks.
 * @property {boolean} missingContext - True when no relevant chunks were found.
 * @property {string} [warning] - Optional retrieval warning.
 */

/**
 * @interface IRetrievalService
 */
class IRetrievalService {
  /**
   * Searches stored vectors and returns ranked chunks.
   *
   * @param {IVectorSearchRequest} request
   * @returns {Promise<IVectorSearchResult[]>}
   */
  async searchVectors(request) {
    throw new Error("Method 'searchVectors()' must be implemented.");
  }

  /**
   * Builds a cited RAG context package from stored vectors.
   *
   * @param {IVectorSearchRequest} request
   * @returns {Promise<IRagContextPackage>}
   */
  async buildRagContext(request) {
    throw new Error("Method 'buildRagContext()' must be implemented.");
  }
}

module.exports = {
  IRetrievalService,
};
