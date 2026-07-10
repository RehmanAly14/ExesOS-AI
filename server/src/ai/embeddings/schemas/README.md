# Schemas

Defines the data shapes and metadata structures for the vector database. This ensures consistency when querying the database across different workspaces and agents.

## Vector Metadata Fields

When vectors are stored, they are enriched with metadata. Key identifiers include:

- **workspaceId**: identifies the tenant/workspace.
- **businessId**: identifies a specific business within a workspace.
- **documentId**: identifies the source document.

## Example Vector Metadata

```json
{
  "workspaceId": "ws_12345",
  "businessId": "biz_67890",
  "documentId": "doc_abcdef",
  "chunkId": "chk_98765",
  "chunkIndex": 0,
  "documentType": "invoice",
  "mimeType": "application/pdf",
  "title": "Q3_Invoice.pdf",
  "content": "Invoice details and billing...",
  "metadata": {
    "parsedPages": 1
  },
  "createdAt": "2026-07-10T10:00:00Z",
  "updatedAt": "2026-07-10T10:00:00Z"
}
```
