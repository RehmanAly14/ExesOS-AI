# Processor

The processor acts as the central coordinator for the Embedding Pipeline. Its sole responsibility is orchestrating the sequential flow:
Receiving the document -> Triggering the Parser -> Chunking the text -> Invoking the Embedding Provider -> Constructing the Vector Record -> Calling the Vector Storage client.

The process explicitly stops once the data is persisted to the Vector Store.
