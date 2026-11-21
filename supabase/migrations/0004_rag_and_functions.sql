-- ============================================================================
-- Migration 0004: Hybrid RAG Retrieval Function & Triggers
-- ============================================================================

-- Updated-at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_courses_updated_at ON public.courses;
CREATE TRIGGER trg_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_documents_updated_at ON public.documents;
CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_document_blocks_updated_at ON public.document_blocks;
CREATE TRIGGER trg_document_blocks_updated_at
  BEFORE UPDATE ON public.document_blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_processing_jobs_updated_at ON public.processing_jobs;
CREATE TRIGGER trg_processing_jobs_updated_at
  BEFORE UPDATE ON public.processing_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-provision profile, default role, and accessibility prefs on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.accessibility_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Hybrid Vector + Full-Text Search with Authorization Guard
CREATE OR REPLACE FUNCTION public.match_document_chunks(
  p_document_id UUID,
  p_query_embedding VECTOR(768),
  p_query_text TEXT DEFAULT '',
  p_match_count INTEGER DEFAULT 6,
  p_similarity_threshold DOUBLE PRECISION DEFAULT 0.35
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  version_id UUID,
  page_number INTEGER,
  section_heading TEXT,
  block_ids UUID[],
  content TEXT,
  similarity DOUBLE PRECISION,
  hybrid_score DOUBLE PRECISION
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_version_id UUID;
  v_tsquery TSQUERY;
BEGIN
  IF NOT public.can_access_document(p_document_id) THEN
    RAISE EXCEPTION 'Forbidden: caller lacks access to document %', p_document_id
      USING ERRCODE = '42501';
  END IF;

  SELECT d.current_version_id
  INTO v_version_id
  FROM public.documents d
  WHERE d.id = p_document_id;

  IF NULLIF(trim(coalesce(p_query_text, '')), '') IS NOT NULL THEN
    v_tsquery := websearch_to_tsquery('simple', p_query_text);
  END IF;

  RETURN QUERY
  SELECT
    c.id AS chunk_id,
    c.document_id,
    c.version_id,
    c.page_number,
    c.section_heading,
    c.block_ids,
    c.content,
    (1 - (c.embedding <=> p_query_embedding))::DOUBLE PRECISION AS similarity,
    (
      0.78 * (1 - (c.embedding <=> p_query_embedding)) +
      0.22 * COALESCE(
        CASE
          WHEN v_tsquery IS NOT NULL THEN ts_rank_cd(c.fts, v_tsquery)
          ELSE 0
        END,
        0
      )
    )::DOUBLE PRECISION AS hybrid_score
  FROM public.document_chunks c
  WHERE c.document_id = p_document_id
    AND (v_version_id IS NULL OR c.version_id = v_version_id)
    AND c.embedding IS NOT NULL
    AND (1 - (c.embedding <=> p_query_embedding)) >= p_similarity_threshold
  ORDER BY hybrid_score DESC
  LIMIT GREATEST(1, LEAST(p_match_count, 20));
END;
$$;
