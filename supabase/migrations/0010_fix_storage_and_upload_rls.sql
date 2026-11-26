-- ============================================================================
-- Migration 0010: Fix Storage & Document Upload RLS Policies
-- Allows authenticated students, volunteers, and admins to upload & process course documents
-- ============================================================================

-- 1. Ensure storage bucket 'course-documents' exists and permissions are granted
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'buckets') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'course-documents',
      'course-documents',
      true,
      52428800,
      ARRAY['application/pdf']
    )
    ON CONFLICT (id) DO UPDATE SET public = true;
  END IF;

  -- 2. Storage Policies for storage.objects
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects') THEN
    DROP POLICY IF EXISTS storage_course_docs_insert ON storage.objects;
    DROP POLICY IF EXISTS storage_course_docs_read ON storage.objects;
    DROP POLICY IF EXISTS storage_course_docs_update ON storage.objects;
    DROP POLICY IF EXISTS storage_course_docs_delete ON storage.objects;

    -- Allow authenticated users to upload files to course-documents
    CREATE POLICY storage_course_docs_insert ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'course-documents');

    -- Allow authenticated users to read files from course-documents
    CREATE POLICY storage_course_docs_read ON storage.objects
      FOR SELECT TO authenticated
      USING (bucket_id = 'course-documents');

    -- Allow authenticated users to update files in course-documents
    CREATE POLICY storage_course_docs_update ON storage.objects
      FOR UPDATE TO authenticated
      USING (bucket_id = 'course-documents')
      WITH CHECK (bucket_id = 'course-documents');

    -- Allow authenticated users to delete files in course-documents
    CREATE POLICY storage_course_docs_delete ON storage.objects
      FOR DELETE TO authenticated
      USING (bucket_id = 'course-documents');
  END IF;

  -- 3. Update public.is_course_member function to recognize volunteers and admins
  CREATE OR REPLACE FUNCTION public.is_course_member(target_course_id UUID)
  RETURNS BOOLEAN
  LANGUAGE SQL
  STABLE
  SECURITY DEFINER
  SET search_path = public
  AS $func$
    SELECT public.has_role('admin') OR public.has_role('volunteer') OR EXISTS (
      SELECT 1
      FROM public.course_members cm
      WHERE cm.course_id = target_course_id
        AND cm.user_id = auth.uid()
    );
  $func$;

  -- 4. Course Members RLS: allow users to enroll themselves
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'course_members') THEN
    DROP POLICY IF EXISTS course_members_select_all ON public.course_members;
    CREATE POLICY course_members_select_all ON public.course_members
      FOR SELECT TO authenticated
      USING (true);

    DROP POLICY IF EXISTS course_members_insert_self ON public.course_members;
    CREATE POLICY course_members_insert_self ON public.course_members
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid() OR public.has_role('admin') OR public.has_role('volunteer'));

    DROP POLICY IF EXISTS course_members_delete_self ON public.course_members;
    CREATE POLICY course_members_delete_self ON public.course_members
      FOR DELETE TO authenticated
      USING (user_id = auth.uid() OR public.has_role('admin'));
  END IF;

  -- 5. Documents table RLS: allow authenticated users to insert uploaded documents
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'documents') THEN
    DROP POLICY IF EXISTS documents_insert_course_member ON public.documents;
    DROP POLICY IF EXISTS documents_insert_authenticated ON public.documents;
    CREATE POLICY documents_insert_authenticated ON public.documents
      FOR INSERT TO authenticated
      WITH CHECK (uploaded_by = auth.uid() OR public.has_role('admin') OR public.has_role('volunteer'));

    DROP POLICY IF EXISTS documents_update_authorized ON public.documents;
    CREATE POLICY documents_update_authorized ON public.documents
      FOR UPDATE TO authenticated
      USING (uploaded_by = auth.uid() OR public.can_review_document(id) OR public.has_role('admin') OR public.has_role('volunteer'));
  END IF;

  -- 6. Document Versions RLS: allow version creation
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_versions') THEN
    DROP POLICY IF EXISTS doc_versions_insert_authorized ON public.document_versions;
    CREATE POLICY doc_versions_insert_authorized ON public.document_versions
      FOR INSERT TO authenticated
      WITH CHECK (created_by = auth.uid() OR public.can_access_document(document_id) OR public.has_role('admin') OR public.has_role('volunteer'));

    DROP POLICY IF EXISTS doc_versions_update_authorized ON public.document_versions;
    CREATE POLICY doc_versions_update_authorized ON public.document_versions
      FOR UPDATE TO authenticated
      USING (created_by = auth.uid() OR public.can_review_document(document_id) OR public.has_role('admin') OR public.has_role('volunteer'));
  END IF;

  -- 7. Document Structural Child Tables RLS (pages, sections, blocks, tables, equations, figures)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_pages') THEN
    DROP POLICY IF EXISTS doc_pages_insert ON public.document_pages;
    CREATE POLICY doc_pages_insert ON public.document_pages
      FOR INSERT TO authenticated
      WITH CHECK (public.can_access_document(document_id) OR public.has_role('admin') OR public.has_role('volunteer'));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_sections') THEN
    DROP POLICY IF EXISTS doc_sections_insert ON public.document_sections;
    CREATE POLICY doc_sections_insert ON public.document_sections
      FOR INSERT TO authenticated
      WITH CHECK (public.can_access_document(document_id) OR public.has_role('admin') OR public.has_role('volunteer'));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_blocks') THEN
    DROP POLICY IF EXISTS doc_blocks_insert ON public.document_blocks;
    CREATE POLICY doc_blocks_insert ON public.document_blocks
      FOR INSERT TO authenticated
      WITH CHECK (public.can_access_document(document_id) OR public.has_role('admin') OR public.has_role('volunteer'));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_tables') THEN
    DROP POLICY IF EXISTS doc_tables_insert ON public.document_tables;
    CREATE POLICY doc_tables_insert ON public.document_tables
      FOR INSERT TO authenticated
      WITH CHECK (public.can_access_document(document_id) OR public.has_role('admin') OR public.has_role('volunteer'));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_equations') THEN
    DROP POLICY IF EXISTS doc_equations_insert ON public.document_equations;
    CREATE POLICY doc_equations_insert ON public.document_equations
      FOR INSERT TO authenticated
      WITH CHECK (public.can_access_document(document_id) OR public.has_role('admin') OR public.has_role('volunteer'));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_figures') THEN
    DROP POLICY IF EXISTS doc_figures_insert ON public.document_figures;
    CREATE POLICY doc_figures_insert ON public.document_figures
      FOR INSERT TO authenticated
      WITH CHECK (public.can_access_document(document_id) OR public.has_role('admin') OR public.has_role('volunteer'));
  END IF;

  -- 8. Processing Jobs RLS
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'processing_jobs') THEN
    DROP POLICY IF EXISTS processing_jobs_insert ON public.processing_jobs;
    CREATE POLICY processing_jobs_insert ON public.processing_jobs
      FOR INSERT TO authenticated
      WITH CHECK (public.can_access_document(document_id) OR public.has_role('admin') OR public.has_role('volunteer'));

    DROP POLICY IF EXISTS processing_jobs_update ON public.processing_jobs;
    CREATE POLICY processing_jobs_update ON public.processing_jobs
      FOR UPDATE TO authenticated
      USING (public.can_access_document(document_id) OR public.has_role('admin') OR public.has_role('volunteer'));
  END IF;
END $$;
