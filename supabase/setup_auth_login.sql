-- ============================================================================
-- SQL Setup Skrip: Autentikasi Email, Google OAuth & Profil Supabase
-- SONAR Platform
-- ============================================================================
-- Jalankan skrip ini langsung di Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================================

-- 1. Ekstensi Dasar
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Tipe Enum Peran Aplikasi
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('student', 'reviewer', 'admin');
  END IF;
END $$;

-- 3. Tabel Profil Pengguna (public.profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  study_program TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tabel Peran Pengguna (public.user_roles)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'student',
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- 5. Tabel Preferensi Aksesibilitas (public.accessibility_preferences)
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
  preferred_language TEXT NOT NULL DEFAULT 'id' CHECK (preferred_language IN ('en', 'id')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Helper Keamanan has_role
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

-- 7. Fungsi Trigger Otomatis: Sinkronisasi auth.users ke profiles & user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert/update profil dari metadata autentikasi (email signup maupun Google OAuth)
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
    NEW.raw_user_meta_data->>'study_program'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    study_program = COALESCE(EXCLUDED.study_program, public.profiles.study_program),
    updated_at = NOW();

  -- Peran default saat mendaftar: student (mahasiswa)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Pengaturan preferensi awal
  INSERT INTO public.accessibility_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 8. Kaitkan Trigger ke auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Aktifkan RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessibility_preferences ENABLE ROW LEVEL SECURITY;

-- 10. Kebijakan Keamanan RLS
DROP POLICY IF EXISTS profiles_select_own_or_admin ON public.profiles;
CREATE POLICY profiles_select_own_or_admin ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.has_role('admin'));

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_insert_self ON public.profiles;
CREATE POLICY profiles_insert_self ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS user_roles_select_own_or_admin ON public.user_roles;
CREATE POLICY user_roles_select_own_or_admin ON public.user_roles
  FOR SELECT USING (user_id = auth.uid() OR public.has_role('admin'));

DROP POLICY IF EXISTS user_roles_manage_admin ON public.user_roles;
CREATE POLICY user_roles_manage_admin ON public.user_roles
  FOR ALL USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));

DROP POLICY IF EXISTS accessibility_prefs_own ON public.accessibility_preferences;
CREATE POLICY accessibility_prefs_own ON public.accessibility_preferences
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 11. Sinkronisasi Data Pengguna yang Sudah Ada
INSERT INTO public.profiles (id, email, full_name, avatar_url, study_program)
SELECT
  id,
  email,
  COALESCE(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    split_part(email, '@', 1)
  ),
  COALESCE(
    raw_user_meta_data->>'avatar_url',
    raw_user_meta_data->>'picture',
    NULL
  ),
  raw_user_meta_data->>'study_program'
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'student'
FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.accessibility_preferences (user_id)
SELECT id
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
