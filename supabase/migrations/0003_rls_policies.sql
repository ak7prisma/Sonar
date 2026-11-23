-- ============================================================================
-- Migration 0003: Row Level Security (RLS) & Zero-Trust Storage Policies
-- Idempotent / Safe for existing tables and existing policies
-- ============================================================================

-- Pastikan tipe enum app_role ada
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('student', 'reviewer', 'admin');
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Security Helper Functions (SECURITY DEFINER to avoid infinite policy recursion)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_role(required_role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = required_role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_course_member(target_course_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role('admin') OR EXISTS (
    SELECT 1
    FROM public.course_members cm
    WHERE cm.course_id = target_course_id
      AND cm.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_document(target_document_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role('admin') OR EXISTS (
    SELECT 1
    FROM public.documents d
    LEFT JOIN public.course_members cm
      ON cm.course_id = d.course_id AND cm.user_id = auth.uid()
    LEFT JOIN public.document_shares ds
      ON ds.document_id = d.id
     AND ds.shared_with_user_id = auth.uid()
     AND (ds.expires_at IS NULL OR ds.expires_at > NOW())
    WHERE d.id = target_document_id
      AND (
        d.uploaded_by = auth.uid()
        OR cm.id IS NOT NULL
        OR ds.id IS NOT NULL
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_review_document(target_document_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role('admin') OR EXISTS (
    SELECT 1
    FROM public.documents d
    JOIN public.course_members cm
      ON cm.course_id = d.course_id
     AND cm.user_id = auth.uid()
     AND cm.member_role IN ('reviewer', 'instructor')
    WHERE d.id = target_document_id
      AND public.has_role('reviewer')
  );
$$;

-- ----------------------------------------------------------------------------
-- Enable RLS safely on tables that exist
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'profiles', 'user_roles', 'accessibility_preferences', 'courses',
    'course_members', 'documents', 'document_versions', 'document_pages',
    'document_sections', 'document_blocks', 'document_tables', 'document_equations',
    'document_figures', 'document_chunks', 'document_reviews', 'review_comments',
    'document_shares', 'conversations', 'messages', 'processing_jobs',
    'notifications', 'audit_logs'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    END IF;
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- Profiles (privacy-preserving: reviewers cannot see student profile details unless own or admin)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    DROP POLICY IF EXISTS profiles_select_own_or_admin ON public.profiles;
    CREATE POLICY profiles_select_own_or_admin ON public.profiles
      FOR SELECT USING (id = auth.uid() OR public.has_role('admin'));

    DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
    CREATE POLICY profiles_update_own ON public.profiles
      FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

    DROP POLICY IF EXISTS profiles_insert_self ON public.profiles;
    CREATE POLICY profiles_insert_self ON public.profiles
      FOR INSERT WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- User Roles
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    DROP POLICY IF EXISTS user_roles_select_own_or_admin ON public.user_roles;
    CREATE POLICY user_roles_select_own_or_admin ON public.user_roles
      FOR SELECT USING (user_id = auth.uid() OR public.has_role('admin'));

    DROP POLICY IF EXISTS user_roles_manage_admin ON public.user_roles;
    CREATE POLICY user_roles_manage_admin ON public.user_roles
      FOR ALL USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Accessibility Preferences (strictly private per user)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'accessibility_preferences') THEN
    DROP POLICY IF EXISTS accessibility_prefs_own ON public.accessibility_preferences;
    CREATE POLICY accessibility_prefs_own ON public.accessibility_preferences
      FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Courses & Memberships
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
    DROP POLICY IF EXISTS courses_select_member_or_admin ON public.courses;
    CREATE POLICY courses_select_member_or_admin ON public.courses
      FOR SELECT USING (public.is_course_member(id));

    DROP POLICY IF EXISTS courses_manage_admin ON public.courses;
    CREATE POLICY courses_manage_admin ON public.courses
      FOR ALL USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'course_members') THEN
    DROP POLICY IF EXISTS course_members_select_self_or_admin ON public.course_members;
    CREATE POLICY course_members_select_self_or_admin ON public.course_members
      FOR SELECT USING (user_id = auth.uid() OR public.has_role('admin'));

    DROP POLICY IF EXISTS course_members_manage_admin ON public.course_members;
    CREATE POLICY course_members_manage_admin ON public.course_members
      FOR ALL USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Documents
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'documents') THEN
    DROP POLICY IF EXISTS documents_select_authorized ON public.documents;
    CREATE POLICY documents_select_authorized ON public.documents
      FOR SELECT USING (public.can_access_document(id));

    DROP POLICY IF EXISTS documents_insert_course_member ON public.documents;
    CREATE POLICY documents_insert_course_member ON public.documents
      FOR INSERT WITH CHECK (
        uploaded_by = auth.uid() AND public.is_course_member(course_id)
      );

    DROP POLICY IF EXISTS documents_update_authorized ON public.documents;
    CREATE POLICY documents_update_authorized ON public.documents
      FOR UPDATE USING (
        uploaded_by = auth.uid() OR public.can_review_document(id)
      );

    DROP POLICY IF EXISTS documents_delete_owner_or_admin ON public.documents;
    CREATE POLICY documents_delete_owner_or_admin ON public.documents
      FOR DELETE USING (uploaded_by = auth.uid() OR public.has_role('admin'));
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Document Structural Child Tables
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_versions') THEN
    DROP POLICY IF EXISTS doc_versions_select ON public.document_versions;
    CREATE POLICY doc_versions_select ON public.document_versions
      FOR SELECT USING (public.can_access_document(document_id));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_pages') THEN
    DROP POLICY IF EXISTS doc_pages_select ON public.document_pages;
    CREATE POLICY doc_pages_select ON public.document_pages
      FOR SELECT USING (public.can_access_document(document_id));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_sections') THEN
    DROP POLICY IF EXISTS doc_sections_select ON public.document_sections;
    CREATE POLICY doc_sections_select ON public.document_sections
      FOR SELECT USING (public.can_access_document(document_id));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_blocks') THEN
    DROP POLICY IF EXISTS doc_blocks_select ON public.document_blocks;
    CREATE POLICY doc_blocks_select ON public.document_blocks
      FOR SELECT USING (public.can_access_document(document_id));

    DROP POLICY IF EXISTS doc_blocks_update_reviewer ON public.document_blocks;
    CREATE POLICY doc_blocks_update_reviewer ON public.document_blocks
      FOR UPDATE USING (public.can_review_document(document_id));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_tables') THEN
    DROP POLICY IF EXISTS doc_tables_select ON public.document_tables;
    CREATE POLICY doc_tables_select ON public.document_tables
      FOR SELECT USING (public.can_access_document(document_id));

    DROP POLICY IF EXISTS doc_tables_update_reviewer ON public.document_tables;
    CREATE POLICY doc_tables_update_reviewer ON public.document_tables
      FOR UPDATE USING (public.can_review_document(document_id));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_equations') THEN
    DROP POLICY IF EXISTS doc_equations_select ON public.document_equations;
    CREATE POLICY doc_equations_select ON public.document_equations
      FOR SELECT USING (public.can_access_document(document_id));

    DROP POLICY IF EXISTS doc_equations_update_reviewer ON public.document_equations;
    CREATE POLICY doc_equations_update_reviewer ON public.document_equations
      FOR UPDATE USING (public.can_review_document(document_id));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_figures') THEN
    DROP POLICY IF EXISTS doc_figures_select ON public.document_figures;
    CREATE POLICY doc_figures_select ON public.document_figures
      FOR SELECT USING (public.can_access_document(document_id));

    DROP POLICY IF EXISTS doc_figures_update_reviewer ON public.document_figures;
    CREATE POLICY doc_figures_update_reviewer ON public.document_figures
      FOR UPDATE USING (public.can_review_document(document_id));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_chunks') THEN
    DROP POLICY IF EXISTS doc_chunks_select ON public.document_chunks;
    CREATE POLICY doc_chunks_select ON public.document_chunks
      FOR SELECT USING (public.can_access_document(document_id));
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Reviews & Comments
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_reviews') THEN
    DROP POLICY IF EXISTS reviews_select_authorized ON public.document_reviews;
    CREATE POLICY reviews_select_authorized ON public.document_reviews
      FOR SELECT USING (public.can_access_document(document_id));

    DROP POLICY IF EXISTS reviews_manage_reviewer ON public.document_reviews;
    CREATE POLICY reviews_manage_reviewer ON public.document_reviews
      FOR ALL USING (public.can_review_document(document_id))
      WITH CHECK (reviewer_id = auth.uid() AND public.can_review_document(document_id));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'review_comments') THEN
    DROP POLICY IF EXISTS review_comments_select ON public.review_comments;
    CREATE POLICY review_comments_select ON public.review_comments
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.document_reviews r
          WHERE r.id = review_id AND public.can_access_document(r.document_id)
        )
      );

    DROP POLICY IF EXISTS review_comments_insert_reviewer ON public.review_comments;
    CREATE POLICY review_comments_insert_reviewer ON public.review_comments
      FOR INSERT WITH CHECK (
        author_id = auth.uid() AND EXISTS (
          SELECT 1 FROM public.document_reviews r
          WHERE r.id = review_id AND public.can_review_document(r.document_id)
        )
      );
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Document Shares
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_shares') THEN
    DROP POLICY IF EXISTS document_shares_select ON public.document_shares;
    CREATE POLICY document_shares_select ON public.document_shares
      FOR SELECT USING (
        shared_with_user_id = auth.uid()
        OR granted_by = auth.uid()
        OR public.has_role('admin')
      );

    DROP POLICY IF EXISTS document_shares_manage ON public.document_shares;
    CREATE POLICY document_shares_manage ON public.document_shares
      FOR ALL USING (
        granted_by = auth.uid() OR public.has_role('admin')
      ) WITH CHECK (
        granted_by = auth.uid() AND public.can_access_document(document_id)
      );
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Conversations & Messages (private per student)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversations') THEN
    DROP POLICY IF EXISTS conversations_own ON public.conversations;
    CREATE POLICY conversations_own ON public.conversations
      FOR ALL USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid() AND public.can_access_document(document_id));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
    DROP POLICY IF EXISTS messages_own_conversation ON public.messages;
    CREATE POLICY messages_own_conversation ON public.messages
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.conversations c
          WHERE c.id = conversation_id AND c.user_id = auth.uid()
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.conversations c
          WHERE c.id = conversation_id AND c.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Processing Jobs, Notifications, Audit Logs
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'processing_jobs') THEN
    DROP POLICY IF EXISTS processing_jobs_select ON public.processing_jobs;
    CREATE POLICY processing_jobs_select ON public.processing_jobs
      FOR SELECT USING (public.can_access_document(document_id));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    DROP POLICY IF EXISTS notifications_own ON public.notifications;
    CREATE POLICY notifications_own ON public.notifications
      FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
    DROP POLICY IF EXISTS audit_logs_admin_select ON public.audit_logs;
    CREATE POLICY audit_logs_admin_select ON public.audit_logs
      FOR SELECT USING (public.has_role('admin'));
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Private Storage Bucket: course-documents (Signed URLs Only)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'buckets') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'course-documents',
      'course-documents',
      FALSE,
      52428800,
      ARRAY['application/pdf']
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects') THEN
    DROP POLICY IF EXISTS storage_course_docs_read ON storage.objects;
    CREATE POLICY storage_course_docs_read ON storage.objects
      FOR SELECT TO authenticated
      USING (
        bucket_id = 'course-documents'
        AND (
          public.has_role('admin')
          OR public.is_course_member((split_part(name, '/', 1))::uuid)
        )
      );

    DROP POLICY IF EXISTS storage_course_docs_insert ON storage.objects;
    CREATE POLICY storage_course_docs_insert ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'course-documents'
        AND public.is_course_member((split_part(name, '/', 1))::uuid)
      );
  END IF;
END $$;
