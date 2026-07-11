const { IRetrievalEvaluator } = require("../interfaces/IRetrievalEvaluation");

/**
 * Basic retrieval evaluator for recall@k, precision@k, and MRR.
 *
 * @implements {IRetrievalEvaluator}
 */
class RetrievalEvaluator extends IRetrievalEvaluator {
  /**
   * @param {import("../interfaces/IRetrievalEvaluation").IRetrievalEvaluationCase} evaluationCase
   * @param {import("../interfaces/IRetrievalService").IVectorSearchResult[]} retrievedResults
   * @returns {import("../interfaces/IRetrievalEvaluation").IRetrievalEvaluationResult}
   */
  evaluateCase(evaluationCase, retrievedResults) {
    const topResults = retrievedResults.slice(0, evaluationCase.topK);
    const expected = expectedIds(evaluationCase);

    if (expected.size === 0) {
      const passed = topResults.length === 0;
      return {
        caseId: evaluationCase.id,
        metrics: {
          recallAtK: passed ? 1 : 0,
          precisionAtK: passed ? 1 : 0,
          mrr: 0,
        },
        retrievedResults,
        passed,
      };
    }

    const matched = new Set();
    const relevantFlags = topResults.map((result) => {
      const matches = matchingExpectedIds(result, expected);
      matches.forEach((id) => matched.add(id));
      return matches.length > 0;
    });
    const relevantCount = relevantFlags.filter(Boolean).length;
    const firstRelevantIndex = relevantFlags.findIndex(Boolean);

    return {
      caseId: evaluationCase.id,
      metrics: {
        recallAtK: matched.size / expected.size,
        precisionAtK: relevantCount / evaluationCase.topK,
        mrr: firstRelevantIndex === -1 ? 0 : 1 / (firstRelevantIndex + 1),
      },
      retrievedResults,
      passed: matched.size === expected.size,
    };
  }
}

/**
 * @param {import("../interfaces/IRetrievalEvaluation").IRetrievalEvaluationCase} evaluationCase
 * @returns {Set<string>}
 */
function expectedIds(evaluationCase) {
  return new Set([
    ...(evaluationCase.expectedDocumentIds || []).map((id) => `document:${id}`),
    ...(evaluationCase.expectedChunkIds || []).map((id) => `chunk:${id}`),
  ]);
}

/**
 * @param {import("../interfaces/IRetrievalService").IVectorSearchResult} result
 * @param {Set<string>} expected
 * @returns {string[]}
 */
function matchingExpectedIds(result, expected) {
  return [`document:${result.source.documentId}`, `chunk:${result.source.chunkId}`].filter((id) => expected.has(id));
}

module.exports = {
  RetrievalEvaluator,
};
