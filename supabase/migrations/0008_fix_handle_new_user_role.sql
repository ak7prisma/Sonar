-- Migration 0008: Menyesuaikan trigger handle_new_user agar menghormati role pendaftaran (volunteer vs student)
-- serta mencegah injeksi role admin dari client metadata publik.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_assigned_role public.app_role := 'student';
BEGIN
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
    NEW.raw_user_meta_data->>'study_program'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    study_program = COALESCE(EXCLUDED.study_program, public.profiles.study_program),
    updated_at = NOW();

  -- Tentukan role: hanya boleh 'student' atau 'volunteer' dari pendaftaran publik.
  -- Role 'admin' TIDAK BISA didapatkan via metadata pendaftaran.
  IF NEW.raw_user_meta_data->>'role' = 'volunteer' OR NEW.raw_user_meta_data->>'role' = 'reviewer' THEN
    v_assigned_role := 'volunteer';
  ELSE
    v_assigned_role := 'student';
  END IF;

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
