const axios = require("axios");
const { RecursiveCharacterChunker } = require("../chunking/RecursiveCharacterChunker");
const { FireworksEmbeddingProvider } = require("../providers/FireworksEmbeddingProvider");
const { randomUUID } = require("crypto");

class EmbeddingPipeline {
  /**
   * @param {import('../interfaces/IVectorStorage').IVectorStorage} vectorStorage
   */
  constructor(vectorStorage) {
    this.chunker = new RecursiveCharacterChunker();
    this.embeddingProvider = new FireworksEmbeddingProvider();
    
    // TODO: Concrete vector database implementation will be added once the team finalizes the vector database.
    this.vectorStorage = vectorStorage;

    const port = process.env.PORT || 5000;
    this.apiBaseUrl = process.env.API_BASE_URL || `http://localhost:${port}`;
  }

  /**
   * Fetches extracted documents for a business.
   * @param {string} businessId
   * @returns {Promise<any[]>}
   */
  async getExtractedDocuments(businessId) {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/api/documents/business/${businessId}?status=extracted`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching documents for business ${businessId}:`, error.message);
      throw new Error(`Could not fetch documents for business ${businessId}`);
    }
  }

  /**
   * Updates the embedding status of a document.
   * @param {string} documentId
   * @param {"embedded" | "failed"} status
   * @returns {Promise<void>}
   */
  async updateDocumentStatus(documentId, status) {
    try {
      await axios.patch(`${this.apiBaseUrl}/api/documents/${documentId}/embedding-status`, {
        embeddingStatus: status
      });
    } catch (error) {
      console.error(`Error updating document status for ${documentId}:`, error.message);
    }
  }

  /**
   * Runs the complete pipeline for a given business ID.
   * @param {string} businessId
   * @returns {Promise<void>}
   */
  async processBusinessDocuments(businessId) {
    console.log(`Starting embedding pipeline for business: ${businessId}`);
    
    // 1. Document Processor - Fetch documents
    const documents = await this.getExtractedDocuments(businessId);
    
    if (documents.length === 0) {
      console.log(`No extracted documents found for business: ${businessId}`);
      return;
    }

    for (const doc of documents) {
      if (!doc.extractedText || doc.extractedText.trim() === "") {
        console.log(`Skipping document ${doc.id} due to empty extracted text.`);
        continue;
      }

      try {
        console.log(`Processing document: ${doc.id} - ${doc.title || doc.filename}`);

        // Base metadata strictly bound to VectorSchema requirements
        const baseMetadata = {
          workspaceId: doc.business?.workspaceId || "unknown",
          businessId: businessId,
          documentId: doc.id,
          documentType: doc.fileType || "unknown",
          mimeType: doc.mimeType || "application/octet-stream",
          title: doc.title || doc.filename || "Untitled",
          metadata: {}
        };

        // 2. Chunking
        const chunksMetadata = this.chunker.chunkDocument(doc.extractedText, baseMetadata);

        if (chunksMetadata.length === 0) {
          console.log(`No chunks generated for document ${doc.id}. Skipping.`);
          continue;
        }

        const chunkContents = chunksMetadata.map(c => c.content);

        // 3. Embedding Generation
        const embeddings = await this.embeddingProvider.generateEmbeddingsBatch(chunkContents);

        if (embeddings.length !== chunksMetadata.length) {
          throw new Error(`Embedding count mismatch. Expected ${chunksMetadata.length}, got ${embeddings.length}`);
        }

        // Prepare Vector Records
        const vectorRecords = chunksMetadata.map((meta, index) => ({
          id: meta.chunkId,
          embedding: embeddings[index],
          metadata: meta
        }));

        // 4. Vector Storage
        await this.vectorStorage.upsertVectors(vectorRecords);

        // 5. Document Status
        await this.updateDocumentStatus(doc.id, "embedded");
        console.log(`Successfully embedded and stored document: ${doc.id}`);

      } catch (error) {
        console.error(`Failed to process document ${doc.id}:`, error.message);
      }
    }
    console.log(`Completed embedding pipeline for business: ${businessId}`);
  }
}

module.exports = {
  EmbeddingPipeline
};
