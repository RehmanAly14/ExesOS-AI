/**
 * @typedef {Object} IVectorMetadata
 * @property {string} workspaceId - Unique identifier for the workspace (tenant).
 * @property {string} businessId - Identifies a specific business within a workspace.
 * @property {string} documentId - Identifies the source document.
 * @property {string} chunkId - Unique identifier specifically for this chunk.
 * @property {number} chunkIndex - The sequential index of this chunk within the original document.
 * @property {string} documentType - The business category or original extension of the document.
 * @property {string} mimeType - The MIME type of the original file.
 * @property {string} title - The human-readable title of the document.
 * @property {string} content - The raw text content of the chunk.
 * @property {Record<string, any>} [metadata] - An open-ended JSON object to store custom metadata.
 * @property {string} createdAt - Timestamp of when this chunk was created.
 * @property {string} updatedAt - Timestamp of the most recent update to this chunk's data.
 */

/**
 * @typedef {Object} IVectorRecord
 * @property {string} id - The globally unique identifier for the vector record.
 * @property {number[]} embedding - The high-dimensional numerical vector.
 * @property {IVectorMetadata} metadata - The comprehensive metadata payload.
 */

module.exports = {};
