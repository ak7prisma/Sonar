-- ============================================================================
-- Migration 0003: Row Level Security (RLS) & Zero-Trust Storage Policies
-- ============================================================================

-- Security Helper Functions (SECURITY DEFINER to avoid infinite policy recursion)
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

-- Enable RLS on ALL 22 Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessibility_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_equations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_figures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles (privacy-preserving: reviewers cannot see student profile details unless own or admin)
CREATE POLICY profiles_select_own_or_admin ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.has_role('admin'));
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- User Roles
CREATE POLICY user_roles_select_own_or_admin ON public.user_roles
  FOR SELECT USING (user_id = auth.uid() OR public.has_role('admin'));
CREATE POLICY user_roles_manage_admin ON public.user_roles
  FOR ALL USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));

-- Accessibility Preferences (strictly private per user)
CREATE POLICY accessibility_prefs_own ON public.accessibility_preferences
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Courses & Memberships
CREATE POLICY courses_select_member_or_admin ON public.courses
  FOR SELECT USING (public.is_course_member(id));
CREATE POLICY courses_manage_admin ON public.courses
  FOR ALL USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));

CREATE POLICY course_members_select_self_or_admin ON public.course_members
  FOR SELECT USING (user_id = auth.uid() OR public.has_role('admin'));
CREATE POLICY course_members_manage_admin ON public.course_members
  FOR ALL USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));

-- Documents
CREATE POLICY documents_select_authorized ON public.documents
  FOR SELECT USING (public.can_access_document(id));
CREATE POLICY documents_insert_course_member ON public.documents
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND public.is_course_member(course_id)
  );
CREATE POLICY documents_update_authorized ON public.documents
  FOR UPDATE USING (
    uploaded_by = auth.uid() OR public.can_review_document(id)
  );
CREATE POLICY documents_delete_owner_or_admin ON public.documents
  FOR DELETE USING (uploaded_by = auth.uid() OR public.has_role('admin'));

-- Document Structural Child Tables
CREATE POLICY doc_versions_select ON public.document_versions
  FOR SELECT USING (public.can_access_document(document_id));
CREATE POLICY doc_pages_select ON public.document_pages
  FOR SELECT USING (public.can_access_document(document_id));
CREATE POLICY doc_sections_select ON public.document_sections
  FOR SELECT USING (public.can_access_document(document_id));

CREATE POLICY doc_blocks_select ON public.document_blocks
  FOR SELECT USING (public.can_access_document(document_id));
CREATE POLICY doc_blocks_update_reviewer ON public.document_blocks
  FOR UPDATE USING (public.can_review_document(document_id));

CREATE POLICY doc_tables_select ON public.document_tables
  FOR SELECT USING (public.can_access_document(document_id));
CREATE POLICY doc_tables_update_reviewer ON public.document_tables
  FOR UPDATE USING (public.can_review_document(document_id));

CREATE POLICY doc_equations_select ON public.document_equations
  FOR SELECT USING (public.can_access_document(document_id));
CREATE POLICY doc_equations_update_reviewer ON public.document_equations
  FOR UPDATE USING (public.can_review_document(document_id));

CREATE POLICY doc_figures_select ON public.document_figures
  FOR SELECT USING (public.can_access_document(document_id));
CREATE POLICY doc_figures_update_reviewer ON public.document_figures
  FOR UPDATE USING (public.can_review_document(document_id));

CREATE POLICY doc_chunks_select ON public.document_chunks
  FOR SELECT USING (public.can_access_document(document_id));

-- Reviews & Comments
CREATE POLICY reviews_select_authorized ON public.document_reviews
  FOR SELECT USING (public.can_access_document(document_id));
CREATE POLICY reviews_manage_reviewer ON public.document_reviews
  FOR ALL USING (public.can_review_document(document_id))
  WITH CHECK (reviewer_id = auth.uid() AND public.can_review_document(document_id));

CREATE POLICY review_comments_select ON public.review_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.document_reviews r
      WHERE r.id = review_id AND public.can_access_document(r.document_id)
    )
  );
CREATE POLICY review_comments_insert_reviewer ON public.review_comments
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.document_reviews r
      WHERE r.id = review_id AND public.can_review_document(r.document_id)
    )
  );

-- Document Shares
CREATE POLICY document_shares_select ON public.document_shares
  FOR SELECT USING (
    shared_with_user_id = auth.uid()
    OR granted_by = auth.uid()
    OR public.has_role('admin')
  );
CREATE POLICY document_shares_manage ON public.document_shares
  FOR ALL USING (
    granted_by = auth.uid() OR public.has_role('admin')
  ) WITH CHECK (
    granted_by = auth.uid() AND public.can_access_document(document_id)
  );

-- Conversations & Messages (private per student)
CREATE POLICY conversations_own ON public.conversations
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND public.can_access_document(document_id));

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

-- Processing Jobs
CREATE POLICY processing_jobs_select ON public.processing_jobs
  FOR SELECT USING (public.can_access_document(document_id));

-- Notifications
CREATE POLICY notifications_own ON public.notifications
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Audit Logs (Admin read-only)
CREATE POLICY audit_logs_admin_select ON public.audit_logs
  FOR SELECT USING (public.has_role('admin'));

-- ============================================================================
-- Private Storage Bucket: course-documents (Signed URLs Only)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-documents',
  'course-documents',
  FALSE,
  52428800,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY storage_course_docs_read ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'course-documents'
    AND (
      public.has_role('admin')
      OR public.is_course_member((split_part(name, '/', 1))::uuid)
    )
  );

CREATE POLICY storage_course_docs_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'course-documents'
    AND public.is_course_member((split_part(name, '/', 1))::uuid)
  );
