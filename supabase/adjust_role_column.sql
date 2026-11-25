-- Jalankan script SQL ini di SQL Editor Supabase untuk menyesuaikan database:
-- 1. Menambahkan kolom 'role' terpisah pada tabel profiles
-- 2. Memperbarui trigger handle_new_user agar kolom peran dan program studi terpisah

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

UPDATE public.profiles p
SET role = COALESCE(
  (SELECT ur.role FROM public.user_roles ur WHERE ur.user_id = p.id LIMIT 1),
  'student'::public.app_role
)
WHERE p.role IS NULL;

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
  v_meta_role := LOWER(TRIM(COALESCE(
    NEW.raw_user_meta_data->>'role',
    ''
  )));

  IF v_meta_role IN ('student', 'volunteer', 'reviewer', 'admin') THEN
    v_role := v_meta_role::public.app_role;
  END IF;

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

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.accessibility_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
