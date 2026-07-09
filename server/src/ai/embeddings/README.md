# Embedding Pipeline Architecture

## Overview
This directory contains the complete architecture for the ExesOS AI Embedding Pipeline. It is responsible for processing uploaded business documents into optimized vector records for storage. The entire lifecycle in this module stops strictly after Vector Storage. 

## Folder Responsibilities
- `chunking/`: Defines the algorithms for splitting large texts into precise tokens (chunk size, overlap, metadata preservation).
- `docs/`: Architecture diagrams, component notes, and implementation guidelines.
- `interfaces/`: Core abstractions ensuring loose coupling (e.g., `IEmbeddingProvider`).
- `parsers/`: Extract text and standard metadata from various raw document types.
- `processor/`: The orchestrator that handles the end-to-end flow from parsing to vector storage.
- `providers/`: Concrete implementations of `IEmbeddingProvider` (e.g., Fireworks).
- `schemas/`: Defines the strict data shape and metadata requirements for vectors entering the vector store.

## Business Document Flow
1. **Business Documents**: Raw documents (PDF, DOCX, TXT, etc.) are received by the pipeline.
2. **Document Parsing**: The `parsers` extract clean, unified text and basic metadata from the raw formats.
3. **Chunking**: The extracted text is divided into semantically intact segments with appropriate token overlaps.
4. **Embedding Generation**: The chunks are processed by an `IEmbeddingProvider` to produce numerical high-dimensional vectors.
5. **Vector Storage**: The vectors, along with robust metadata, are constructed according to the `VectorSchema` and written to the database.
6. **STOP**: The pipeline explicitly terminates here.

## Ownership
**Owner**: Dinesh (Lead AI Architect)
**Responsibilities**:
- Embedding Pipeline Architecture
- Business Document Processing Flow
- Chunking Strategy
- Embedding Generation Architecture
- Embedding Provider Abstraction
- Vector Schema Design

**Future Implementation Notes**:
- Any integration or code that touches logic *after* the Vector Storage step (Retrieval, RAG, etc.) is strictly out of bounds for this module.
