# ADR-002: Supabase PostgreSQL, RLS Isolation, and pgvector Hybrid Retrieval

- **Status:** Accepted
- **Date:** 2026-11-21

## Decision
Use Supabase as the unified database, Auth, private object storage (`course-documents`), and pgvector store (`VECTOR(768)` + HNSW index + generated `tsvector` GIN index). Enforce Row Level Security on all 22 tables using `SECURITY DEFINER` helpers (`has_role`, `is_course_member`, `can_access_document`, `can_review_document`).

## Consequences
- Knowledge of a document UUID or URL never grants access without course membership, ownership, or an explicit `document_shares` grant.
- Student `accessibility_preferences` and AI `conversations` remain strictly private from volunteer reviewers.
