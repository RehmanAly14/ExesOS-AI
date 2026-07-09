export interface IParsedDocument {
  documentId: string;
  workspaceId: string;
  content: string;
  source: string;
  title?: string;
}

export interface IChunk {
  chunkId: string;
  documentId: string;
  content: string;
  index: number;
}

/**
 * Defines the contract for the document processing pipeline steps.
 */
export interface IDocumentProcessor {
  /**
   * Parses a raw document into extractable text and metadata.
   */
  parseDocument(rawInput: any): Promise<IParsedDocument>;

  /**
   * Chunks a parsed document into smaller segments based on the chosen strategy.
   */
  chunkDocument(document: IParsedDocument): Promise<IChunk[]>;
}
