# ADR-004: Modular AI SDK v7 Abstraction (Gemini Default) & Grounded RAG

- **Status:** Accepted
- **Date:** 2026-11-21

## Decision
Isolate all LLM, Vision, and Embedding access behind `src/lib/ai/provider.ts` using Vercel AI SDK v7 (`ai`, `@ai-sdk/google`, `@ai-sdk/react`). Wrap all retrieved document chunks in `<untrusted_document_sources>` tags after stripping XML control tags to mitigate prompt injection, and enforce inline page/section citations.

## Consequences
- Switching models or adding alternative providers requires updating only `provider.ts` and environment variables.
- Assistant answers never invent equations or page references when supporting context is absent.
