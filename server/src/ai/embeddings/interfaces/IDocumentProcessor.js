/**
 * @typedef {Object} IParsedDocument
 * @property {string} documentId
 * @property {string} workspaceId
 * @property {string} content
 * @property {string} source
 * @property {string} [title]
 */

/**
 * @typedef {Object} IChunk
 * @property {string} chunkId
 * @property {string} documentId
 * @property {string} content
 * @property {number} index
 */

/**
 * @interface IDocumentProcessor
 */
class IDocumentProcessor {
  /**
   * Parses a raw document into extractable text and metadata.
   * @param {any} rawInput
   * @returns {Promise<IParsedDocument>}
   */
  async parseDocument(rawInput) {
    throw new Error("Method 'parseDocument()' must be implemented.");
  }

  /**
   * Chunks a parsed document into smaller segments based on the chosen strategy.
   * @param {IParsedDocument} document
   * @returns {Promise<IChunk[]>}
   */
  async chunkDocument(document) {
    throw new Error("Method 'chunkDocument()' must be implemented.");
  }
}

module.exports = {
  IDocumentProcessor
};
