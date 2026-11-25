-- ==============================================================================
-- 0007_separate_role_and_study_program.sql
-- Memisahkan kolom peran (role) dan program studi (study_program) di database:
-- 1. Menambahkan kolom 'role' eksplisit pada tabel public.profiles (jika belum ada)
-- 2. Memperbarui fungsi trigger handle_new_user() agar membaca role dari metadata
--    pendaftaran dan menyimpannya secara terpisah ke profiles dan user_roles
-- ==============================================================================

-- 1. Tambahkan kolom role pada tabel public.profiles jika belum ada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN role public.app_role NOT NULL DEFAULT 'student';
  END IF;
END $$;

-- 2. Sinkronkan nilai role pada profiles dengan data di user_roles jika ada
UPDATE public.profiles p
SET role = COALESCE(
  (SELECT ur.role FROM public.user_roles ur WHERE ur.user_id = p.id LIMIT 1),
  'student'::public.app_role
)
WHERE p.role IS NULL OR p.role = 'student';

-- 3. Perbarui Fungsi Trigger handle_new_user() untuk membaca role dari metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.app_role := 'student';
  v_meta_role text;
BEGIN
  -- Ambil peran dari metadata jika disertakan saat pendaftaran
  v_meta_role := LOWER(TRIM(COALESCE(
    NEW.raw_user_meta_data->>'role',
    ''
  )));

  IF v_meta_role IN ('student', 'volunteer', 'reviewer', 'admin') THEN
    v_role := v_meta_role::public.app_role;
  END IF;

  -- Insert/update profil dengan kolom study_program dan role yang terpisah
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    study_program,
    role
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
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'study_program', '')), ''),
    v_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    study_program = COALESCE(EXCLUDED.study_program, public.profiles.study_program),
    role = COALESCE(EXCLUDED.role, public.profiles.role),
    updated_at = NOW();

  -- Simpan juga peran ke public.user_roles untuk kompatibilitas RBAC
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Preferensi aksesibilitas awal
  INSERT INTO public.accessibility_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 4. Pastikan trigger terpasang pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
