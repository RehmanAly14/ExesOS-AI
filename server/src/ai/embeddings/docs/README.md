# Architecture Documentation

## Architecture Diagram

```mermaid
flowchart TD
    A[Business Documents] --> B[Parser]
    B --> C[Chunker]
    C --> D[Embedding Provider]
    D --> E[(Vector Storage)]
    
    style E fill:#f9f,stroke:#333,stroke-width:2px
```

*Note: The architecture explicitly terminates at Vector Storage.*
