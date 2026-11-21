# ADR-003: Durable Background Processing via Inngest

- **Status:** Accepted
- **Date:** 2026-11-21

## Decision
Use Inngest (`inngest/next`) for asynchronous multi-step PDF conversion (`sonar/document.uploaded`), decoupled behind `dispatchDocumentProcessingJob()`.

## Consequences
- Large PDFs never time out short-lived serverless HTTP upload requests.
- Each conversion stage (extraction, OCR/structuring, math/figure enrichment, embedding, finalization) is independently retryable and tracks live progress in `processing_jobs`.
