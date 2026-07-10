const { randomUUID } = require("crypto");

class RecursiveCharacterChunker {
  /**
   * @param {Object} [options]
   * @param {number} [options.chunkSize]
   * @param {number} [options.chunkOverlap]
   */
  constructor(options = { chunkSize: 1000, chunkOverlap: 200 }) {
    this.options = options;
  }

  /**
   * Splits text into smaller chunks recursively.
   * @param {string} text
   * @returns {string[]}
   */
  splitText(text) {
    const chunks = [];
    const paragraphs = text.split("\n\n");
    let current = "";

    for (const p of paragraphs) {
      if ((current.length + p.length + 2) > this.options.chunkSize) {
        if (current.trim().length > 0) chunks.push(current.trim());
        current = p;
      } else {
        current = current ? current + "\n\n" + p : p;
      }
    }
    if (current.trim().length > 0) chunks.push(current.trim());
    
    const refinedChunks = [];
    for (const chunk of chunks) {
      if (chunk.length <= this.options.chunkSize) {
        refinedChunks.push(chunk);
      } else {
        let start = 0;
        while (start < chunk.length) {
          const slice = chunk.slice(start, start + this.options.chunkSize);
          if (slice.trim().length > 0) {
            refinedChunks.push(slice.trim());
          }
          start += this.options.chunkSize - this.options.chunkOverlap;
        }
      }
    }
    return refinedChunks;
  }

  /**
   * Generates full Vector schema metadata for each chunk.
   * @param {string} text
   * @param {Omit<import('../schemas/VectorSchema').IVectorMetadata, 'chunkId' | 'chunkIndex' | 'content' | 'createdAt' | 'updatedAt'>} baseMetadata
   * @returns {Omit<import('../schemas/VectorSchema').IVectorMetadata, 'embedding'>[]}
   */
  chunkDocument(text, baseMetadata) {
    const stringChunks = this.splitText(text);
    const now = new Date().toISOString();

    return stringChunks.map((content, index) => ({
      ...baseMetadata,
      chunkId: randomUUID(),
      chunkIndex: index,
      content,
      createdAt: now,
      updatedAt: now
    }));
  }
}

module.exports = {
  RecursiveCharacterChunker
};
