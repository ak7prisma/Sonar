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
DROP FUNCTION IF EXISTS public.has_role CASCADE;
DROP FUNCTION IF EXISTS public.create_sonar_user CASCADE;

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

-- Hapus tipe enum lama secara aman dengan CASCADE
DROP TYPE IF EXISTS public.app_role_old CASCADE;

-- 4. Rekreasi fungsi create_sonar_user() dengan tipe enum baru
CREATE OR REPLACE FUNCTION public.create_sonar_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_role public.app_role,
  p_study_program TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
DECLARE
  v_user_id UUID;
  v_encrypted_password TEXT;
BEGIN
  v_encrypted_password := crypt(p_password, gen_salt('bf', 10));

  SELECT id INTO v_user_id FROM auth.users WHERE email = LOWER(TRIM(p_email));

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      LOWER(TRIM(p_email)),
      v_encrypted_password,
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', p_full_name, 'study_program', p_study_program),
      NOW(),
      NOW(),
      'authenticated',
      'authenticated',
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', LOWER(TRIM(p_email))),
      'email',
      LOWER(TRIM(p_email)),
      NOW(),
      NOW(),
      NOW()
    ) ON CONFLICT (provider, provider_id) DO NOTHING;

  ELSE
    UPDATE auth.users
    SET
      encrypted_password = v_encrypted_password,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      raw_user_meta_data = jsonb_build_object('full_name', p_full_name, 'study_program', p_study_program),
      updated_at = NOW()
    WHERE id = v_user_id;

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', LOWER(TRIM(p_email))),
      'email',
      LOWER(TRIM(p_email)),
      NOW(),
      NOW(),
      NOW()
    ) ON CONFLICT (provider, provider_id) DO UPDATE SET
      updated_at = NOW();
  END IF;

  INSERT INTO public.profiles (id, email, full_name, study_program)
  VALUES (v_user_id, LOWER(TRIM(p_email)), p_full_name, p_study_program)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    study_program = EXCLUDED.study_program,
    updated_at = NOW();

  DELETE FROM public.user_roles WHERE user_id = v_user_id;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, p_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.accessibility_preferences (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN v_user_id;
END;
$$;

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
