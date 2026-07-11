const { IRetrievalService } = require("../interfaces/IRetrievalService");

/**
 * PostgreSQLRetrievalService
 *
 * MVP retrieval strategy:
 * - Load scoped DocumentChunk rows from PostgreSQL via Prisma.
 * - Score JSON-array embeddings in JavaScript.
 * - Return ranked chunks and RAG context packages.
 *
 * @implements {IRetrievalService}
 */
class PostgreSQLRetrievalService extends IRetrievalService {
  /**
   * @param {{documentChunk: {findMany: Function}}} [prismaClient]
   */
  constructor(prismaClient) {
    super();
    this.prisma = prismaClient || getPrisma();
  }

  /**
   * @param {import("../interfaces/IRetrievalService").IVectorSearchRequest} request
   * @returns {Promise<import("../interfaces/IRetrievalService").IVectorSearchResult[]>}
   */
  async searchVectors(request) {
    validateSearchRequest(request);

    const rows = await this.prisma.documentChunk.findMany({
      where: buildWhere(request),
      select: {
        id: true,
        documentId: true,
        content: true,
        embedding: true,
        chunkIndex: true,
        workspaceId: true,
        businessId: true,
        documentType: true,
        mimeType: true,
        title: true,
        metadata: true,
        createdAt: true,
      },
    });

    return rows
      .filter((row) => matchesMetadata(row.metadata, request.filters && request.filters.metadata))
      .map((row) => {
        const score = cosineSimilarity(request.queryEmbedding, parseEmbedding(row.embedding));
        return score > 0 ? toSearchResult(row, score) : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, request.topK);
  }

  /**
   * @param {import("../interfaces/IRetrievalService").IVectorSearchRequest} request
   * @returns {Promise<import("../interfaces/IRetrievalService").IRagContextPackage>}
   */
  async buildRagContext(request) {
    const retrievedChunks = await this.searchVectors(request);
    const sources = retrievedChunks.map((chunk) => chunk.source);

    if (retrievedChunks.length === 0) {
      return {
        workspaceId: request.workspaceId,
        businessId: request.businessId,
        query: request.query,
        contextText: "",
        sources,
        retrievedChunks,
        missingContext: true,
        warning: "No relevant document chunks found for the retrieval request.",
      };
    }

    return {
      workspaceId: request.workspaceId,
      businessId: request.businessId,
      query: request.query,
      contextText: retrievedChunks.map(formatContextChunk).join("\n\n"),
      sources,
      retrievedChunks,
      missingContext: false,
    };
  }
}

function getPrisma() {
  return require("../../../config/prisma");
}

/**
 * @param {import("../interfaces/IRetrievalService").IVectorSearchRequest} request
 */
function validateSearchRequest(request) {
  if (!request || !request.workspaceId) {
    throw new Error("workspaceId is required for retrieval");
  }
  if (!Array.isArray(request.queryEmbedding)) {
    throw new Error("queryEmbedding must be an array");
  }
  if (!Number.isInteger(request.topK) || request.topK <= 0) {
    throw new Error("topK must be a positive integer");
  }
}

/**
 * @param {import("../interfaces/IRetrievalService").IVectorSearchRequest} request
 * @returns {Record<string, unknown>}
 */
function buildWhere(request) {
  const filters = request.filters || {};
  const businessId = request.businessId || filters.businessId;
  const where = {
    workspaceId: request.workspaceId,
  };

  if (businessId) where.businessId = businessId;
  if (filters.documentIds && filters.documentIds.length > 0) {
    where.documentId = { in: filters.documentIds };
  }
  if (filters.documentTypes && filters.documentTypes.length > 0) {
    where.documentType = { in: filters.documentTypes };
  }
  if (filters.mimeTypes && filters.mimeTypes.length > 0) {
    where.mimeType = { in: filters.mimeTypes };
  }

  return where;
}

/**
 * @param {unknown} embedding
 * @returns {number[]}
 */
function parseEmbedding(embedding) {
  if (Array.isArray(embedding)) return embedding.filter((value) => typeof value === "number");
  if (typeof embedding !== "string") return [];

  try {
    const parsed = JSON.parse(embedding);
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === "number") : [];
  } catch (_error) {
    return [];
  }
}

/**
 * @param {number[]} left
 * @param {number[]} right
 * @returns {number}
 */
function cosineSimilarity(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length === 0 || left.length !== right.length) {
    return 0;
  }

  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;

  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] * left[index];
    rightNorm += right[index] * right[index];
  }

  if (leftNorm === 0 || rightNorm === 0) return 0;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

/**
 * @param {Record<string, unknown>|null|undefined} rowMetadata
 * @param {Record<string, unknown>|undefined} expectedMetadata
 * @returns {boolean}
 */
function matchesMetadata(rowMetadata, expectedMetadata) {
  if (!expectedMetadata || Object.keys(expectedMetadata).length === 0) return true;
  if (!rowMetadata || typeof rowMetadata !== "object") return false;

  return Object.entries(expectedMetadata).every(([key, value]) => rowMetadata[key] === value);
}

/**
 * @param {Record<string, unknown>} row
 * @param {number} score
 * @returns {import("../interfaces/IRetrievalService").IVectorSearchResult}
 */
function toSearchResult(row, score) {
  const createdAt = toIsoString(row.createdAt);
  const title = row.title || "Untitled document";

  return {
    content: row.content || "",
    score,
    source: {
      documentId: row.documentId,
      chunkId: row.id,
      chunkIndex: row.chunkIndex,
      title,
    },
    metadata: {
      workspaceId: row.workspaceId,
      businessId: row.businessId,
      documentId: row.documentId,
      chunkId: row.id,
      chunkIndex: row.chunkIndex,
      documentType: row.documentType || "",
      mimeType: row.mimeType || "",
      title,
      content: row.content || "",
      metadata: row.metadata || {},
      createdAt,
      updatedAt: createdAt,
    },
  };
}

/**
 * @param {import("../interfaces/IRetrievalService").IVectorSearchResult} chunk
 * @returns {string}
 */
function formatContextChunk(chunk) {
  return `[${chunk.source.title}#${chunk.source.chunkIndex}]\n${chunk.content}`;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function toIsoString(value) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

module.exports = {
  PostgreSQLRetrievalService,
  cosineSimilarity,
};
