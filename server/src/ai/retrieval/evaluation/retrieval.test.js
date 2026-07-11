const assert = require("assert");

const { RetrievalEvaluator } = require("./RetrievalEvaluator");
const { PostgreSQLRetrievalService, cosineSimilarity } = require("../services/PostgreSQLRetrievalService");

const rows = [
  chunk({ id: "chunk-1", documentId: "doc-1", workspaceId: "workspace-1", businessId: "business-1", embedding: [1, 0], metadata: { department: "finance" } }),
  chunk({ id: "chunk-2", documentId: "doc-2", workspaceId: "workspace-1", businessId: "business-1", embedding: [0.4, 0.6], metadata: { department: "marketing" } }),
  chunk({ id: "chunk-3", documentId: "doc-3", workspaceId: "workspace-1", businessId: "business-2", embedding: [1, 0] }),
  chunk({ id: "chunk-4", documentId: "doc-4", workspaceId: "workspace-2", businessId: "business-1", embedding: [1, 0] }),
];

async function main() {
  await verifiesWorkspaceAndBusinessIsolation();
  await verifiesDocumentAndMetadataFilters();
  await verifiesEmptyRagContext();
  await verifiesZeroScoreChunksAreExcluded();
  verifiesCosineEdgeCases();
  verifiesRetrievalMetrics();
}

async function verifiesWorkspaceAndBusinessIsolation() {
  const service = new PostgreSQLRetrievalService(fakePrisma(rows));
  const results = await service.searchVectors({
    workspaceId: "workspace-1",
    businessId: "business-1",
    query: "finance plan",
    queryEmbedding: [1, 0],
    topK: 2,
  });

  assert.deepStrictEqual(results.map((result) => result.source.chunkId), ["chunk-1", "chunk-2"]);
  assert(results.every((result) => result.metadata.workspaceId === "workspace-1"));
  assert(results.every((result) => result.metadata.businessId === "business-1"));
  assert(results[0].score > results[1].score);
}

async function verifiesDocumentAndMetadataFilters() {
  const service = new PostgreSQLRetrievalService(fakePrisma(rows));
  const results = await service.searchVectors({
    workspaceId: "workspace-1",
    query: "finance plan",
    queryEmbedding: [1, 0],
    topK: 2,
    filters: {
      documentIds: ["doc-1", "doc-2"],
      metadata: { department: "finance" },
    },
  });

  assert.deepStrictEqual(results.map((result) => result.source.chunkId), ["chunk-1"]);
}

async function verifiesEmptyRagContext() {
  const service = new PostgreSQLRetrievalService(fakePrisma(rows));
  const context = await service.buildRagContext({
    workspaceId: "workspace-missing",
    query: "missing",
    queryEmbedding: [1, 0],
    topK: 3,
  });

  assert.strictEqual(context.missingContext, true);
  assert.strictEqual(context.contextText, "");
  assert.strictEqual(context.retrievedChunks.length, 0);
  assert(context.warning);
}

async function verifiesZeroScoreChunksAreExcluded() {
  const service = new PostgreSQLRetrievalService(
    fakePrisma([
      chunk({ id: "chunk-zero", documentId: "doc-zero", workspaceId: "workspace-1", embedding: [0, 1] }),
      chunk({ id: "chunk-bad", documentId: "doc-bad", workspaceId: "workspace-1", embedding: [1] }),
    ])
  );
  const context = await service.buildRagContext({
    workspaceId: "workspace-1",
    query: "finance plan",
    queryEmbedding: [1, 0],
    topK: 5,
  });

  assert.strictEqual(context.missingContext, true);
  assert.deepStrictEqual(context.retrievedChunks, []);
}

function verifiesCosineEdgeCases() {
  assert.strictEqual(cosineSimilarity([1, 0], [1, 0]), 1);
  assert.strictEqual(cosineSimilarity([1, 0], [0, 1]), 0);
  assert.strictEqual(cosineSimilarity([1, 0], [1]), 0);
  assert.strictEqual(cosineSimilarity([], []), 0);
}

function verifiesRetrievalMetrics() {
  const evaluator = new RetrievalEvaluator();
  const result = evaluator.evaluateCase(
    {
      id: "case-1",
      name: "find finance chunk",
      workspaceId: "workspace-1",
      query: "finance",
      queryEmbedding: [1, 0],
      topK: 2,
      expectedDocumentIds: ["doc-1"],
    },
    [
      searchResult({ documentId: "doc-1", chunkId: "chunk-1" }),
      searchResult({ documentId: "doc-2", chunkId: "chunk-2" }),
    ]
  );

  assert.strictEqual(result.metrics.recallAtK, 1);
  assert.strictEqual(result.metrics.precisionAtK, 0.5);
  assert.strictEqual(result.metrics.mrr, 1);
  assert.strictEqual(result.passed, true);

  const resultWithDocumentAndChunkExpected = evaluator.evaluateCase(
    {
      id: "case-2",
      name: "find exact chunk",
      workspaceId: "workspace-1",
      query: "finance",
      queryEmbedding: [1, 0],
      topK: 1,
      expectedDocumentIds: ["doc-1"],
      expectedChunkIds: ["chunk-1"],
    },
    [searchResult({ documentId: "doc-1", chunkId: "chunk-1" })]
  );

  assert.strictEqual(resultWithDocumentAndChunkExpected.metrics.recallAtK, 1);
  assert.strictEqual(resultWithDocumentAndChunkExpected.metrics.precisionAtK, 1);
  assert.strictEqual(resultWithDocumentAndChunkExpected.passed, true);
}

/**
 * @param {Array<Record<string, unknown>>} chunks
 * @returns {{documentChunk: {findMany: Function}}}
 */
function fakePrisma(chunks) {
  return {
    documentChunk: {
      async findMany({ where }) {
        return chunks.filter((candidate) => matchesWhere(candidate, where));
      },
    },
  };
}

function matchesWhere(candidate, where) {
  return Object.entries(where).every(([key, value]) => {
    if (value && typeof value === "object" && Array.isArray(value.in)) {
      return value.in.includes(candidate[key]);
    }
    return candidate[key] === value;
  });
}

function chunk(overrides) {
  return {
    id: "chunk",
    documentId: "doc",
    content: "Chunk content",
    embedding: [1, 0],
    chunkIndex: 0,
    workspaceId: "workspace",
    businessId: "business",
    documentType: "txt",
    mimeType: "text/plain",
    title: "Demo Document",
    metadata: {},
    createdAt: new Date("2026-07-11T00:00:00.000Z"),
    ...overrides,
  };
}

function searchResult({ documentId, chunkId }) {
  return {
    content: "content",
    score: 1,
    source: {
      documentId,
      chunkId,
      chunkIndex: 0,
      title: "title",
    },
    metadata: {
      workspaceId: "workspace-1",
      businessId: "business-1",
      documentId,
      chunkId,
      chunkIndex: 0,
      documentType: "txt",
      mimeType: "text/plain",
      title: "title",
      content: "content",
      metadata: {},
      createdAt: "2026-07-11T00:00:00.000Z",
      updatedAt: "2026-07-11T00:00:00.000Z",
    },
  };
}

main();
