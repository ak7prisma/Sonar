# SONAR System Architecture

## Overview

SONAR is an accessible academic document conversion, reading, verification, and grounded Q&A platform designed for blind and visually impaired university students and volunteer peer reviewers.

```text
Browser (Next.js App Router, WCAG 2.2 AA UI, Web Speech TTS, Atkinson/Lexend/High Contrast)
   │
   ├── Auth & Session Boundary (src/proxy.ts + Supabase SSR cookie validation)
   ├── Route Handlers (/api/documents/upload, /api/ai/chat, /api/courses, /api/preferences)
   │      ├── Vercel AI SDK v7 (@ai-sdk/google -> Gemini Multimodal + gemini-embedding-001)
   │      ├── Hybrid RAG Retrieval (pgvector cosine similarity + PostgreSQL tsvector)
   │      └── Inngest Durable Worker (/api/inngest)
   │             ├── 1. PDF Magic-Byte Validation & SHA-256 Deduplication
   │             ├── 2. Text-Layer Extraction (pdfjs-dist legacy Node worker-safe build)
   │             ├── 3. Multimodal Vision OCR & Table/Figure Structuring
   │             ├── 4. Deterministic Bilingual Math Narration (EN + ID) & MathJax MathML
   │             └── 5. Semantic Chunking -> 768-dim pgvector Embeddings -> Audit Log
   └── Supabase (PostgreSQL + pgvector, Private Storage Bucket, Row Level Security)
```

## Domain Boundaries

1. **`src/app/(marketing)`**: Public entry point featuring SONAR's real deterministic MathML + speech engine sandbox.
2. **`src/app/(auth)`**: GOV.UK-pattern accessible sign-in and registration connected to Supabase Auth Server Actions.
3. **`src/app/(student)`**: Dashboard, enrolled course catalog, accessible PDF upload, 3-pane document reader + AI assistant, and persistent accessibility preferences.
4. **`src/app/(reviewer)`**: TanStack Table v9 review queue and Linear/Notion-style block audit workbench with live MathML/speech preview.
5. **`src/app/(admin)`**: Course management, member enrollment context, and background job queue monitoring.
6. **`src/lib/ai` & `src/lib/rag`**: Provider-agnostic AI wrapper, prompt-injection-resistant XML source isolation, hybrid retrieval, and server rate limiting.
7. **`src/features/*`**: PDF validation, PDF text extraction, Inngest workflow steps, OCR provider interface, MathJax MathML converter, deterministic EN/ID LaTeX narrator, figure describer, and Web Speech reader hook.
