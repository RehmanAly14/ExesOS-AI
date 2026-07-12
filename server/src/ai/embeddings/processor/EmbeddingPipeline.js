const prisma = require("../../../config/prisma");
const { RecursiveCharacterChunker } = require("../chunking/RecursiveCharacterChunker");
const { FireworksEmbeddingProvider } = require("../providers/FireworksEmbeddingProvider");
const { PostgreSQLVectorStorage } = require("../storage/PostgreSQLVectorStorage");

const MIME_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
};

function buildChunkMetadata(doc, businessId) {
  const workspaceId = doc.business?.workspaceId;
  if (!workspaceId) {
    throw new Error(`Missing workspaceId for document ${doc.id}`);
  }

  return {
    workspaceId,
    businessId,
    documentId: doc.id,
    documentType: doc.fileType || "unknown",
    mimeType: MIME_TYPES[doc.fileType] || "application/octet-stream",
    title: doc.filename || "Untitled",
    metadata: {},
  };
}

class EmbeddingPipeline {
  /**
   * @param {import('../interfaces/IVectorStorage').IVectorStorage} [vectorStorage]
   */
  constructor(vectorStorage) {
    this.chunker = new RecursiveCharacterChunker();
    this.embeddingProvider = new FireworksEmbeddingProvider();
    this.vectorStorage = vectorStorage || new PostgreSQLVectorStorage();
    this.prisma = prisma;
  }

  async getDocumentForEmbedding(documentId) {
    return this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        business: {
          select: { workspaceId: true },
        },
      },
    });
  }

  async updateDocumentEmbeddingStatus(documentId, status) {
    console.log(`[EmbeddingPipeline] Updating embeddingStatus for document ${documentId} → ${status}`);
    await this.prisma.document.update({
      where: { id: documentId },
      data: { embeddingStatus: status },
    });
  }

  /**
   * @param {string} documentId
   * @returns {Promise<{ documentId: string, chunkCount: number, embeddingStatus: "embedded" }>}
   */
  async processDocument(documentId) {
    console.log(`[EmbeddingPipeline] Starting embedding for document: ${documentId}`);

    const doc = await this.getDocumentForEmbedding(documentId);
    if (!doc) {
      throw new Error(`Document not found: ${documentId}`);
    }

    if (doc.status !== "extracted") {
      throw new Error(
        `Document ${documentId} is not ready for embedding (status: ${doc.status})`
      );
    }

    if (!doc.extractedText || !doc.extractedText.trim()) {
      throw new Error(`Document ${documentId} has no extracted text`);
    }

    try {
      const deletedCount = await this.vectorStorage.deleteChunksByDocumentId(documentId);
      if (deletedCount > 0) {
        console.log(`[EmbeddingPipeline] Removed ${deletedCount} existing chunk(s) for document: ${documentId}`);
      }

      const baseMetadata = buildChunkMetadata(doc, doc.businessId);
      const chunksMetadata = this.chunker.chunkDocument(doc.extractedText, baseMetadata);

      if (chunksMetadata.length === 0) {
        throw new Error(`No chunks generated for document ${documentId}`);
      }

      console.log(
        `[EmbeddingPipeline] Created ${chunksMetadata.length} chunk(s) for document: ${documentId}`
      );

      const chunkContents = chunksMetadata.map((chunk) => chunk.content);
      const embeddings = await this.embeddingProvider.generateEmbeddingsBatch(chunkContents);

      if (embeddings.length !== chunksMetadata.length) {
        throw new Error(
          `Embedding count mismatch for document ${documentId}. Expected ${chunksMetadata.length}, got ${embeddings.length}`
        );
      }

      console.log(
        `[EmbeddingPipeline] Generated ${embeddings.length} embedding(s) for document: ${documentId}`
      );

      const vectorRecords = chunksMetadata.map((meta, index) => ({
        id: meta.chunkId,
        embedding: embeddings[index],
        metadata: meta,
      }));

      await this.vectorStorage.upsertVectors(vectorRecords, documentId);
      await this.updateDocumentEmbeddingStatus(documentId, "embedded");

      console.log(
        `[EmbeddingPipeline] Successfully embedded document: ${documentId} (${chunksMetadata.length} chunk(s) saved)`
      );

      return {
        documentId,
        chunkCount: chunksMetadata.length,
        embeddingStatus: "embedded",
      };
    } catch (error) {
      console.error(
        `[EmbeddingPipeline] Embedding failed for document ${documentId}:`,
        error.message
      );

      try {
        await this.updateDocumentEmbeddingStatus(documentId, "failed");
      } catch (statusError) {
        console.error(
          `[EmbeddingPipeline] Failed to set embeddingStatus=failed for document ${documentId}:`,
          statusError.message
        );
      }

      throw error;
    }
  }

  async processBusinessDocuments(businessId) {
    console.log(`[EmbeddingPipeline] Starting pipeline for business: ${businessId}`);

    const documents = await this.prisma.document.findMany({
      where: {
        businessId,
        status: "extracted",
        embeddingStatus: "pending",
      },
      select: { id: true },
    });

    if (documents.length === 0) {
      console.log(
        `[EmbeddingPipeline] No pending extracted documents found for business: ${businessId}`
      );
      return { processed: 0, failed: 0 };
    }

    let processed = 0;
    let failed = 0;

    for (const doc of documents) {
      try {
        await this.processDocument(doc.id);
        processed += 1;
      } catch (_error) {
        failed += 1;
      }
    }

    console.log(
      `[EmbeddingPipeline] Completed pipeline for business: ${businessId} (${processed} succeeded, ${failed} failed)`
    );

    return { processed, failed };
  }
}

module.exports = {
  EmbeddingPipeline,
};
