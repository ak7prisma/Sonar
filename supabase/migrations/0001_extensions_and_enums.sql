-- ============================================================================
-- Migration 0001: Extensions & Domain Enums
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('student', 'reviewer', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_member_role') THEN
    CREATE TYPE public.course_member_role AS ENUM ('student', 'reviewer', 'instructor');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'processing_status') THEN
    CREATE TYPE public.processing_status AS ENUM (
      'queued',
      'extracting',
      'ocr',
      'structuring',
      'enriching',
      'embedding',
      'completed',
      'failed'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_status') THEN
    CREATE TYPE public.review_status AS ENUM (
      'unreviewed',
      'in_review',
      'needs_revision',
      'verified'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'block_type') THEN
    CREATE TYPE public.block_type AS ENUM (
      'heading',
      'paragraph',
      'list',
      'table',
      'equation',
      'figure'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'share_permission') THEN
    CREATE TYPE public.share_permission AS ENUM ('view', 'comment', 'edit');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_stage') THEN
    CREATE TYPE public.job_stage AS ENUM (
      'validate',
      'extract_text',
      'ocr_pages',
      'structure',
      'math_narration',
      'figure_vision',
      'embed_rag',
      'finalize'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE public.notification_type AS ENUM (
      'processing_completed',
      'processing_failed',
      'review_completed',
      'share_granted',
      'system'
    );
  END IF;
END
$$;
