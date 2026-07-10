# Retrieval and RAG Architecture

## Overview

This directory contains the architecture scaffold for ExesOS AI Retrieval and RAG. It is responsible for querying stored vectors, retrieving relevant document chunks, and packaging cited context for CEO and specialist agents.

The lifecycle in this module starts strictly after Vector Storage.

## Folder Responsibilities

- `docs/`: Flow notes for vector search, context retrieval, and RAG context assembly.
- `evaluation/`: Retrieval quality evaluation strategy.
- `interfaces/`: TypeScript contracts for retrieval requests, results, context packages, and evaluation cases.

## Retrieval/RAG Flow

1. **User Query**: A CEO or agent workflow provides the user's question and workspace scope.
2. **Query Embedding**: The embedding pipeline provides the query embedding.
3. **Vector Search**: Retrieval searches stored vectors within the workspace, optional business scope, and optional metadata filters.
4. **Context Retrieval**: Ranked chunks are selected and prepared with source metadata.
5. **RAG Context Package**: Retrieved chunks are assembled into a cited context payload for downstream agents.
6. **STOP**: This module does not generate the final executive answer.

## Ownership

**Owner**: Owen

**Responsibilities**:

- Vector search contract
- Context retrieval contract
- RAG context packaging contract
- Retrieval quality evaluation design

**Out of Scope**:

- Document parsing
- Chunking strategy
- Embedding generation
- Vector schema design
- Vector storage write path
- Business-context document generation
- CEO synthesis
- LangGraph orchestration
