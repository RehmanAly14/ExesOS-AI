import type { IVectorSearchResult } from "./IRetrievalService";

export interface IRetrievalEvaluationCase {
  id: string;
  name: string;
  workspaceId: string;
  query: string;
  queryEmbedding: number[];
  topK: number;
  expectedDocumentIds?: string[];
  expectedChunkIds?: string[];
}

export interface IRetrievalMetricResult {
  recallAtK: number;
  precisionAtK: number;
  mrr: number;
}

export interface IRetrievalEvaluationResult {
  caseId: string;
  metrics: IRetrievalMetricResult;
  retrievedResults: IVectorSearchResult[];
  passed: boolean;
  notes?: string;
}

export interface IRetrievalEvaluator {
  evaluateCase(
    evaluationCase: IRetrievalEvaluationCase,
    retrievedResults: IVectorSearchResult[]
  ): IRetrievalEvaluationResult;
}
