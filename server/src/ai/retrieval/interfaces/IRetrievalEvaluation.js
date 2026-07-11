/**
 * @typedef {Object} IRetrievalEvaluationCase
 * @property {string} id - Stable evaluation case ID.
 * @property {string} name - Human-readable evaluation case name.
 * @property {string} workspaceId - Workspace scope for the query.
 * @property {string} query - Retrieval query text.
 * @property {number[]} queryEmbedding - Query embedding generated upstream.
 * @property {number} topK - Number of ranked chunks to evaluate.
 * @property {string[]} [expectedDocumentIds] - Relevant document IDs expected in results.
 * @property {string[]} [expectedChunkIds] - Relevant chunk IDs expected in results.
 */

/**
 * @typedef {Object} IRetrievalMetricResult
 * @property {number} recallAtK - Fraction of expected relevant items found in top K.
 * @property {number} precisionAtK - Fraction of top K results that are relevant.
 * @property {number} mrr - Reciprocal rank of the first relevant result.
 */

/**
 * @typedef {Object} IRetrievalEvaluationResult
 * @property {string} caseId - Evaluation case ID.
 * @property {IRetrievalMetricResult} metrics - Metric scores.
 * @property {import("./IRetrievalService").IVectorSearchResult[]} retrievedResults - Retrieved chunks used for evaluation.
 * @property {boolean} passed - Whether the case passed the acceptance threshold.
 * @property {string} [notes] - Optional evaluation notes.
 */

/**
 * @interface IRetrievalEvaluator
 */
class IRetrievalEvaluator {
  /**
   * Evaluates retrieval output for one case.
   *
   * @param {IRetrievalEvaluationCase} evaluationCase
   * @param {import("./IRetrievalService").IVectorSearchResult[]} retrievedResults
   * @returns {IRetrievalEvaluationResult}
   */
  evaluateCase(evaluationCase, retrievedResults) {
    throw new Error("Method 'evaluateCase()' must be implemented.");
  }
}

module.exports = {
  IRetrievalEvaluator,
};
