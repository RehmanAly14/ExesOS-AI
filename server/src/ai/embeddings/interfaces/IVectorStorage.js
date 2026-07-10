/**
 * @interface IVectorStorage
 */
class IVectorStorage {
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
