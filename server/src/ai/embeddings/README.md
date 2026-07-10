# Embedding Pipeline Architecture

## Overview
This directory contains the complete architecture for the ExesOS AI Embedding Pipeline. It processes uploaded business documents into text chunks, generates vector embeddings, and stores them in PostgreSQL for retrieval.

**The pipeline lifecycle strictly stops at Vector Storage.** Retrieval and RAG are Owen's responsibility.

---

## Current Architecture (MVP)

```
Document (status=extracted)
       ↓
RecursiveCharacterChunker       [chunking/]
       ↓
FireworksEmbeddingProvider      [providers/]
       ↓
PostgreSQLVectorStorage         [storage/]
       ↓  stores chunks + embeddings as JSON in document_chunks table
PostgreSQL (document_chunks)
       ↑
IVectorStorage abstraction maintained — future migration to pgvector is possible

STOP — retrieval is out of scope for this module
```

---

## Folder Responsibilities
- `chunking/` — Recursive character text splitting with configurable size + overlap.
- `docs/` — Architecture notes and implementation guidelines.
- `interfaces/` — Core abstractions: `IVectorStorage`, `IEmbeddingProvider`, `IDocumentProcessor`.
- `parsers/` — (Future) Extract text from raw document types.
- `processor/` — `EmbeddingPipeline.js` orchestrates the full ingestion flow.
- `providers/` — `FireworksEmbeddingProvider.js` — concrete `IEmbeddingProvider`.
- `schemas/` — `VectorSchema.js` — JSDoc typedefs for `IVectorMetadata` and `IVectorRecord`.
- `storage/` — `PostgreSQLVectorStorage.js` — concrete `IVectorStorage` for MVP.

---

## Vector Storage — MVP vs Future

| Aspect | MVP (current) | Future (pgvector) |
|---|---|---|
| Embedding column type | `Json` (float array) | `vector(768)` |
| Similarity search | In-process cosine similarity (JS) | SQL `<=>` operator |
| Migration effort | Swap column type + one SQL query in `SimilaritySearch.js` | Low |

---

## Ownership

**Owner**: Dinesh (Lead AI Architect)

**In scope**:
- Embedding Pipeline ingestion (Document → Chunks → Embeddings → Storage)
- `PostgreSQLVectorStorage` and `IVectorStorage` abstraction
- Chunking strategy and `FireworksEmbeddingProvider`

**Out of scope (Owen)**:
- RAG context packaging
- Re-ranking / MMR
- LangGraph agent integration
- Anything after `IVectorStorage.upsertVectors()`

---

## Quick Start

1. Copy `.env.example` to `.env` and fill in `DATABASE_URL` and `FIREWORKS_API_KEY`.
2. Run: `npx prisma migrate dev`
3. Upload and extract a document via the Document API.
4. Run: `node scripts/testEmbeddingPipeline.js`
