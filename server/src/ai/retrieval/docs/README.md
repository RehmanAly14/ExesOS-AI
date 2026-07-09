# Retrieval Flow Notes

## Vector Search

Vector search accepts a workspace-scoped query embedding and returns ranked vector chunks. It may filter by business ID, document ID, document type, MIME type, or custom metadata.

The query embedding is produced upstream by the embedding pipeline. Retrieval does not create embeddings.

## Context Retrieval

Context retrieval converts ranked vector results into source-backed chunks for agent use. Each result must preserve document ID, chunk ID, chunk index, title, content, and score.

## RAG Context Assembly

RAG context assembly joins selected chunks into a bounded `contextText` payload and returns source citations alongside the raw retrieved chunks.

If no relevant chunks are found, the context package must set `missingContext` and include a warning.

## Boundary

This module consumes vectors after storage. It does not parse documents, chunk documents, generate embeddings, write vectors, or produce the final answer.
