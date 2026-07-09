# Chunking Strategy

## Overview
This strategy defines how large parsed documents are subdivided into smaller segments before vectorization.

## Selected Strategy: Semantic & Recursive Character Splitting

- **Chunk Size**: `512` to `1024` tokens.
- **Overlap**: `100` to `150` tokens.
- **Supported Document Types**: `PDF`, `DOCX`, `TXT`, `MD`, `CSV`.
- **Metadata Preservation**: Every chunk must inherit its parent document's metadata (workspace ID, document ID, title, etc.) while appending chunk-specific metadata (index, relative byte/character offset).

## Why This Strategy Was Selected
Recursive character splitting is essential for business documents because it attempts to preserve natural semantic boundaries (paragraphs, sentences) rather than arbitrarily slicing text mid-word or mid-sentence. An overlap of 100-150 tokens ensures that cross-boundary context is never lost. The 512-1024 token window provides enough density for quality embeddings without diluting specific concepts across a massive vector.
