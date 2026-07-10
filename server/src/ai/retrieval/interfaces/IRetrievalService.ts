import type { IVectorMetadata } from "../../embeddings/schemas/VectorSchema";

export interface IVectorSearchFilters {
  businessId?: string;
  documentIds?: string[];
  documentTypes?: string[];
  mimeTypes?: string[];
  metadata?: Record<string, unknown>;
}

export interface IVectorSearchRequest {
  workspaceId: string;
  /**
   * Optional business-level scope inside the workspace.
   */
  businessId?: string;
  query: string;
  /**
   * Generated upstream by the embedding pipeline.
   * Retrieval does not create embeddings.
   */
  queryEmbedding: number[];
  topK: number;
  filters?: IVectorSearchFilters;
}

export interface ISourceCitation {
  documentId: string;
  chunkId: string;
  chunkIndex: number;
  title: string;
  source?: string;
}

export interface IVectorSearchResult {
  content: string;
  score: number;
  source: ISourceCitation;
  metadata: IVectorMetadata;
}

export interface IRagContextPackage {
  workspaceId: string;
  /**
   * Present when retrieval was scoped to one business inside the workspace.
   */
  businessId?: string;
  query: string;
  contextText: string;
  sources: ISourceCitation[];
  retrievedChunks: IVectorSearchResult[];
  missingContext: boolean;
  warning?: string;
}

export interface IRetrievalService {
  searchVectors(request: IVectorSearchRequest): Promise<IVectorSearchResult[]>;
  buildRagContext(request: IVectorSearchRequest): Promise<IRagContextPackage>;
}
