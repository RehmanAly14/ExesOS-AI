/**
 * testEmbeddingPipeline.js
 *
 * End-to-end smoke test for the Embedding Pipeline + Retrieval.
 *
 * Usage:
 *   node scripts/testEmbeddingPipeline.js
 *
 * Prerequisites:
 *   1. DATABASE_URL set in .env
 *   2. FIREWORKS_API_KEY set in .env
 *   3. `npx prisma migrate dev` has been run
 *   4. A Document with status="extracted" exists for the BUSINESS_ID below
 *
 * What this script tests:
 *   1. EmbeddingPipeline fetches extracted documents and runs end-to-end.
 *   2. document_chunks rows are created in PostgreSQL.
 *   3. RetrievalService returns ranked chunks for a test query.
 */

require("dotenv").config();

const prisma = require("../src/config/prisma");
const { EmbeddingPipeline } = require("../src/ai/embeddings/processor/EmbeddingPipeline");
const { RetrievalService } = require("../src/ai/retrieval/RetrievalService");
const { PostgreSQLVectorStorage } = require("../src/ai/embeddings/storage/PostgreSQLVectorStorage");

// ─── Configuration ─────────────────────────────────────────────
// Change this to a real businessId that has extracted documents in your DB.
const TEST_BUSINESS_ID = process.env.TEST_BUSINESS_ID || "REPLACE_WITH_REAL_BUSINESS_ID";
const TEST_QUERY = "What is the business about?";
// ───────────────────────────────────────────────────────────────

async function main() {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  ExesOS AI — Embedding Pipeline End-to-End Test");
  console.log("═══════════════════════════════════════════════════════\n");

  // ── Step 1: Verify there are extracted documents ──────────────
  console.log(`[1] Checking for extracted documents for business: ${TEST_BUSINESS_ID}`);
  const docs = await prisma.document.findMany({
    where: { businessId: TEST_BUSINESS_ID, status: "extracted" },
    select: { id: true, filename: true, extractedText: true }
  });
  console.log(`    Found ${docs.length} document(s) with status=extracted.`);
  if (docs.length === 0) {
    console.warn("    ⚠  No extracted documents found. Upload and extract a document first.");
    process.exit(0);
  }

  // ── Step 2: Run the Embedding Pipeline ───────────────────────
  console.log("\n[2] Running EmbeddingPipeline...");
  const storage = new PostgreSQLVectorStorage();
  const pipeline = new EmbeddingPipeline(storage);
  await pipeline.processBusinessDocuments(TEST_BUSINESS_ID);
  console.log("    ✓ Pipeline completed.");

  // ── Step 3: Verify chunks were persisted ─────────────────────
  console.log("\n[3] Verifying document_chunks in PostgreSQL...");
  const chunkCount = await prisma.documentChunk.count({
    where: { businessId: TEST_BUSINESS_ID }
  });
  console.log(`    ✓ ${chunkCount} chunk(s) stored in document_chunks.`);

  if (chunkCount === 0) {
    console.error("    ✗ No chunks found — embedding may have failed. Check logs above.");
    process.exit(1);
  }

  // ── Step 4: Verify embeddingStatus updated on source docs ────
  console.log("\n[4] Verifying embeddingStatus on source documents...");
  const embeddedDocs = await prisma.document.findMany({
    where: { businessId: TEST_BUSINESS_ID, embeddingStatus: "embedded" },
    select: { id: true, filename: true }
  });
  console.log(`    ✓ ${embeddedDocs.length} document(s) marked as embedded:`);
  embeddedDocs.forEach(d => console.log(`      - [${d.id}] ${d.filename}`));

  // ── Step 5: Test retrieval ────────────────────────────────────
  console.log(`\n[5] Running RetrievalService with query: "${TEST_QUERY}"`);
  const retrieval = new RetrievalService();
  const results = await retrieval.retrieve({
    query: TEST_QUERY,
    businessId: TEST_BUSINESS_ID,
    topK: 3
  });

  console.log(`    ✓ ${results.length} relevant chunk(s) returned:`);
  results.forEach((r, i) => {
    console.log(`\n    ── Result ${i + 1} (score: ${r.score.toFixed(4)}) ──`);
    console.log(`    Document: ${r.title || r.documentId}`);
    console.log(`    Chunk #${r.chunkIndex}: ${r.content.slice(0, 120)}...`);
  });

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  ✅ All steps passed. Pipeline is working end-to-end.");
  console.log("═══════════════════════════════════════════════════════\n");
}

main()
  .catch((err) => {
    console.error("\n✗ Test failed:", err.message);
    console.error(err.stack);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
