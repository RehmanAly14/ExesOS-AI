# Retrieval Evaluation

## Goal

Evaluate whether retrieval returns the right document chunks for a business question.

## Metrics

- `recall@k`: Whether expected documents or chunks appear in the top `k` results.
- `precision@k`: How many top `k` results are relevant.
- `MRR`: Reciprocal rank of the first relevant result.

## Evaluation Cases

Each case should define a workspace-scoped query, expected document IDs or chunk IDs, and the `topK` value used for scoring.

## Required Scenarios

- Expected document appears in top results.
- Expected chunk appears in top results.
- No relevant chunks exist.
- Retrieved chunks are irrelevant.
- Metadata filters exclude out-of-scope documents.

## Boundary

This directory defines evaluation contracts, strategy, and focused assert-based checks for retrieval scoring behavior.
