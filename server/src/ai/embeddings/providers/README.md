# Embedding Providers

This directory houses concrete implementations of the `IEmbeddingProvider` interface. The providers are responsible only for receiving text arrays and returning numeric vector arrays. They hold no knowledge of the document origin, the chunking strategy, or the vector database.
