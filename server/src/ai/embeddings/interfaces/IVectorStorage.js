/**
 * @interface IVectorStorage
 */
class IVectorStorage {
  /**
   * Removes all stored chunks for a document.
   * @param {string} documentId
   * @returns {Promise<number>}
   */
  async deleteChunksByDocumentId(documentId) {
    throw new Error("Method 'deleteChunksByDocumentId()' must be implemented.");
  }

  /**
   * Upserts an array of vector records into the storage backend.
   * @param {import('../schemas/VectorSchema').IVectorRecord[]} records Array of complete vector records.
   * @returns {Promise<void>}
   */
  async upsertVectors(records) {
    throw new Error("Method 'upsertVectors()' must be implemented.");
  }
}

module.exports = {
  IVectorStorage
};
