-- ==============================================================================
-- Migration 0009: Merge 'reviewer' role into 'volunteer'
-- 1. Mengubah data eksisting dengan role 'reviewer' menjadi 'volunteer'
-- 2. Memperbarui tipe enum public.app_role menjadi ('student', 'volunteer', 'admin')
-- 3. Memperbarui fungsi has_role() dan trigger handle_new_user()
-- ==============================================================================

-- 1. Ubah data eksisting di user_roles dari 'reviewer' menjadi 'volunteer'
UPDATE public.user_roles
SET role = 'volunteer'
WHERE role::text = 'reviewer';

-- Update di tabel profiles jika kolom role ada
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    UPDATE public.profiles
    SET role = 'volunteer'
    WHERE role::text = 'reviewer';
  END IF;
END $$;

-- 2. Hapus sementara fungsi yang bergantung pada app_role
DROP FUNCTION IF EXISTS public.has_role(public.app_role) CASCADE;

-- 3. Rekreasi enum app_role tanpa nilai 'reviewer'
ALTER TYPE public.app_role RENAME TO app_role_old;
CREATE TYPE public.app_role AS ENUM ('student', 'volunteer', 'admin');

-- Ubah kolom di user_roles ke tipe enum baru
ALTER TABLE public.user_roles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE public.app_role 
  USING (
    CASE 
      WHEN role::text = 'reviewer' THEN 'volunteer'::public.app_role 
      ELSE role::text::public.app_role 
    END
  );
ALTER TABLE public.user_roles ALTER COLUMN role SET DEFAULT 'student'::public.app_role;

-- Ubah kolom di profiles jika ada
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
    ALTER TABLE public.profiles 
      ALTER COLUMN role TYPE public.app_role 
      USING (
        CASE 
          WHEN role::text = 'reviewer' THEN 'volunteer'::public.app_role 
          ELSE role::text::public.app_role 
        END
      );
    ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'student'::public.app_role;
  END IF;
END $$;

-- Hapus tipe enum lama
DROP TYPE public.app_role_old;

-- 4. Rekreasi fungsi has_role() dengan tipe enum baru
CREATE OR REPLACE FUNCTION public.has_role(required_role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
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

-- 5. Rekreasi RLS policy documents yang sebelumnya mengacu pada 'reviewer'
DROP POLICY IF EXISTS documents_select_accessible ON public.documents;
CREATE POLICY documents_select_accessible ON public.documents
  FOR SELECT USING (
    uploaded_by = auth.uid()
    OR review_status = 'verified'
    OR public.is_course_member(course_id)
    OR public.has_role('admin')
    OR public.has_role('volunteer')
  );

-- 6. Perbarui trigger handle_new_user() agar hanya menggunakan 'student', 'volunteer', atau 'admin'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_assigned_role public.app_role := 'student';
  v_meta_role text;
BEGIN
  v_meta_role := LOWER(TRIM(COALESCE(NEW.raw_user_meta_data->>'role', '')));

  IF v_meta_role IN ('volunteer', 'reviewer') THEN
    v_assigned_role := 'volunteer';
  ELSIF v_meta_role = 'admin' AND NEW.email IN ('admin@sonar.ac.id', 'hendra.gunawan@faculty.ac.id') THEN
    v_assigned_role := 'admin';
  ELSE
    v_assigned_role := 'student';
  END IF;

  -- Insert/update profil dari metadata autentikasi
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    study_program
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NULL
    ),
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'study_program', '')), '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    study_program = COALESCE(EXCLUDED.study_program, public.profiles.study_program),
    updated_at = NOW();

  -- Simpan peran ke tabel user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Preferensi aksesibilitas awal
  INSERT INTO public.accessibility_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;
