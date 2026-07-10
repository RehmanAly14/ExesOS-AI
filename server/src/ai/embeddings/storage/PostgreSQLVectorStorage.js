const prisma = require("../../../config/prisma");
const { IVectorStorage } = require("../interfaces/IVectorStorage");

/**
 * PostgreSQLVectorStorage
 *
 * Concrete implementation of IVectorStorage using Prisma + PostgreSQL.
 *
 * MVP Storage Strategy:
 *   Embeddings are stored as JSON arrays (float[]) in the `embedding` column.
 *   This avoids needing the pgvector extension during MVP.
 *
 * Migration Path (future):
 *   1. Enable pgvector on PostgreSQL: `CREATE EXTENSION IF NOT EXISTS vector;`
 *   2. Change `embedding Json` → `embedding Unsupported("vector(768)")` in schema.prisma.
 *   3. Update upsertVectors to use raw SQL: `INSERT ... ON CONFLICT DO UPDATE`.
 *   4. SimilaritySearch can then use `<=>` cosine operator instead of in-process JS.
 */
class PostgreSQLVectorStorage extends IVectorStorage {
  /**
   * Upserts an array of vector records into document_chunks.
   * If a chunk with the same `id` already exists it is replaced.
   *
   * @param {Array<{id: string, embedding: number[], metadata: import('../schemas/VectorSchema').IVectorMetadata}>} records
   * @returns {Promise<void>}
   */
  async upsertVectors(records) {
    if (!records || records.length === 0) return;

    // Prisma does not support bulk upsert natively, so we use a transaction
    // to batch individual upserts and commit atomically.
    await prisma.$transaction(
      records.map((record) =>
        prisma.documentChunk.upsert({
          where: { id: record.id },
          update: {
            content: record.metadata.content,
            embedding: record.embedding,       // stored as JSON array
            chunkIndex: record.metadata.chunkIndex,
            workspaceId: record.metadata.workspaceId,
            businessId: record.metadata.businessId,
            documentType: record.metadata.documentType || null,
            mimeType: record.metadata.mimeType || null,
            title: record.metadata.title || null,
            metadata: record.metadata.metadata || null,
          },
          create: {
            id: record.id,
            documentId: record.metadata.documentId,
            content: record.metadata.content,
            embedding: record.embedding,       // stored as JSON array
            chunkIndex: record.metadata.chunkIndex,
            workspaceId: record.metadata.workspaceId,
            businessId: record.metadata.businessId,
            documentType: record.metadata.documentType || null,
            mimeType: record.metadata.mimeType || null,
            title: record.metadata.title || null,
            metadata: record.metadata.metadata || null,
          },
        })
      )
    );
  }

  /**
   * Retrieves all chunks for a given businessId.
   * Used by SimilaritySearch to load candidate vectors.
   *
   * @param {string} businessId
   * @returns {Promise<Array<{id: string, content: string, embedding: number[], chunkIndex: number, documentId: string, title: string}>>}
   */
  async getChunksByBusiness(businessId) {
    const rows = await prisma.documentChunk.findMany({
      where: { businessId },
      select: {
        id: true,
        documentId: true,
        content: true,
        embedding: true,
        chunkIndex: true,
        title: true,
        workspaceId: true,
        businessId: true,
        metadata: true,
      },
    });

    return rows.map((row) => ({
      ...row,
      embedding: Array.isArray(row.embedding) ? row.embedding : JSON.parse(row.embedding),
    }));
  }
}

module.exports = {
  PostgreSQLVectorStorage,
};
