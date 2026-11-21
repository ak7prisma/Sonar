-- ============================================================================
-- Migration 0002: Core Relational & Vector Schema (22 Domain Entities)
-- ============================================================================

-- 1. User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  study_program TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. User Roles (isolated from self-editable profile attributes)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'student',
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- 3. Persistent Accessibility Preferences (private per user)
CREATE TABLE IF NOT EXISTS public.accessibility_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  reading_font TEXT NOT NULL DEFAULT 'atkinson' CHECK (reading_font IN ('atkinson', 'inter', 'lexend')),
  font_size_px INTEGER NOT NULL DEFAULT 18 CHECK (font_size_px BETWEEN 14 AND 28),
  line_height NUMERIC(3, 2) NOT NULL DEFAULT 1.72 CHECK (line_height BETWEEN 1.30 AND 2.40),
  letter_spacing_em NUMERIC(4, 3) NOT NULL DEFAULT 0.000 CHECK (letter_spacing_em BETWEEN 0.000 AND 0.120),
  reading_width TEXT NOT NULL DEFAULT 'comfortable' CHECK (reading_width IN ('narrow', 'comfortable', 'wide')),
  contrast_mode TEXT NOT NULL DEFAULT 'standard' CHECK (contrast_mode IN ('standard', 'high')),
  reading_surface TEXT NOT NULL DEFAULT 'default' CHECK (reading_surface IN ('default', 'warm')),
  narration_speed NUMERIC(3, 2) NOT NULL DEFAULT 1.00 CHECK (narration_speed BETWEEN 0.50 AND 2.50),
  reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'id')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Courses
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  discipline TEXT NOT NULL DEFAULT 'General',
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Course Members
CREATE TABLE IF NOT EXISTS public.course_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_role public.course_member_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, user_id)
);

-- 6. Documents
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
  page_count INTEGER NOT NULL DEFAULT 0 CHECK (page_count >= 0),
  current_version_id UUID,
  processing_status public.processing_status NOT NULL DEFAULT 'queued',
  review_status public.review_status NOT NULL DEFAULT 'unreviewed',
  overall_confidence NUMERIC(4, 3) CHECK (overall_confidence BETWEEN 0 AND 1),
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'id')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, file_hash)
);

-- 7. Document Versions
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1 CHECK (version_number >= 1),
  source_storage_path TEXT NOT NULL,
  change_summary TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (document_id, version_number)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'documents_current_version_fk'
  ) THEN
    ALTER TABLE public.documents
      ADD CONSTRAINT documents_current_version_fk
      FOREIGN KEY (current_version_id) REFERENCES public.document_versions(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- 8. Document Pages
CREATE TABLE IF NOT EXISTS public.document_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES public.document_versions(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL CHECK (page_number >= 1),
  has_text_layer BOOLEAN NOT NULL DEFAULT FALSE,
  ocr_applied BOOLEAN NOT NULL DEFAULT FALSE,
  raw_text TEXT,
  confidence_score NUMERIC(4, 3) CHECK (confidence_score BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (version_id, page_number)
);

-- 9. Document Sections (Semantic Heading Outline)
CREATE TABLE IF NOT EXISTS public.document_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES public.document_versions(id) ON DELETE CASCADE,
  heading_level INTEGER NOT NULL DEFAULT 2 CHECK (heading_level BETWEEN 1 AND 6),
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL CHECK (order_index >= 0),
  start_page INTEGER NOT NULL DEFAULT 1 CHECK (start_page >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Document Blocks (Atomic Screen-Reader & Review Units)
CREATE TABLE IF NOT EXISTS public.document_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES public.document_versions(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.document_sections(id) ON DELETE SET NULL,
  page_number INTEGER NOT NULL CHECK (page_number >= 1),
  reading_order INTEGER NOT NULL CHECK (reading_order >= 0),
  block_type public.block_type NOT NULL,
  heading_level INTEGER CHECK (heading_level BETWEEN 1 AND 6),
  content_text TEXT NOT NULL,
  content_html TEXT,
  spoken_text TEXT,
  ai_generated BOOLEAN NOT NULL DEFAULT TRUE,
  confidence_score NUMERIC(4, 3) CHECK (confidence_score BETWEEN 0 AND 1),
  needs_review BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Document Tables (Semantic Header/Cell Matrices)
CREATE TABLE IF NOT EXISTS public.document_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL UNIQUE REFERENCES public.document_blocks(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  caption TEXT,
  headers JSONB NOT NULL DEFAULT '[]'::jsonb,
  rows JSONB NOT NULL DEFAULT '[]'::jsonb,
  row_count INTEGER NOT NULL DEFAULT 0 CHECK (row_count >= 0),
  column_count INTEGER NOT NULL DEFAULT 0 CHECK (column_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Document Equations (LaTeX + MathML + Deterministic Bilingual Speech)
CREATE TABLE IF NOT EXISTS public.document_equations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL UNIQUE REFERENCES public.document_blocks(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  latex TEXT NOT NULL,
  mathml TEXT,
  narration_en TEXT NOT NULL,
  narration_id TEXT NOT NULL,
  is_supported BOOLEAN NOT NULL DEFAULT TRUE,
  unsupported_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Document Figures (Layered Multimodal Descriptions)
CREATE TABLE IF NOT EXISTS public.document_figures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL UNIQUE REFERENCES public.document_blocks(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  figure_label TEXT NOT NULL,
  figure_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  axes_and_units TEXT,
  trends TEXT,
  key_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  uncertainty_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Document Chunks & Embeddings (pgvector 768-dim + Full-Text Search)
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES public.document_versions(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL CHECK (chunk_index >= 0),
  page_number INTEGER NOT NULL CHECK (page_number >= 1),
  section_heading TEXT,
  block_ids UUID[] NOT NULL DEFAULT '{}'::uuid[],
  content TEXT NOT NULL,
  token_count INTEGER NOT NULL DEFAULT 0 CHECK (token_count >= 0),
  embedding VECTOR(768),
  fts TSVECTOR GENERATED ALWAYS AS (to_tsvector('simple', coalesce(section_heading, '') || ' ' || content)) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (version_id, chunk_index)
);

-- 15. Document Reviews
CREATE TABLE IF NOT EXISTS public.document_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES public.document_versions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  status public.review_status NOT NULL DEFAULT 'in_review',
  notes TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER CHECK (duration_seconds >= 0)
);

-- 16. Review Comments & Edit Diffs
CREATE TABLE IF NOT EXISTS public.review_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.document_reviews(id) ON DELETE CASCADE,
  block_id UUID REFERENCES public.document_blocks(id) ON DELETE SET NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  body TEXT NOT NULL,
  previous_text TEXT,
  revised_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Controlled Document Shares (Zero-Trust Explicit Grants)
CREATE TABLE IF NOT EXISTS public.document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  granted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  permission public.share_permission NOT NULL DEFAULT 'view',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (document_id, shared_with_user_id)
);

-- 18. AI Assistant Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Document Conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. AI Conversation Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  citations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. Processing Jobs (Background Workflow State)
CREATE TABLE IF NOT EXISTS public.processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES public.document_versions(id) ON DELETE CASCADE,
  inngest_run_id TEXT,
  status public.processing_status NOT NULL DEFAULT 'queued',
  current_stage public.job_stage NOT NULL DEFAULT 'validate',
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  error_message TEXT,
  logs JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. User Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  href TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. Security & Compliance Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Query & Vector Search Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_course_members_user ON public.course_members(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_course ON public.documents(course_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_review_status ON public.documents(review_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_blocks_doc_order ON public.document_blocks(document_id, version_id, reading_order);
CREATE INDEX IF NOT EXISTS idx_document_blocks_needs_review ON public.document_blocks(document_id) WHERE needs_review = TRUE;
CREATE INDEX IF NOT EXISTS idx_document_chunks_doc ON public.document_chunks(document_id, version_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_fts ON public.document_chunks USING GIN(fts);
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw ON public.document_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_document_shares_recipient ON public.document_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_doc ON public.conversations(user_id, document_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_doc ON public.processing_jobs(document_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
