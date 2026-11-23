-- ============================================================================
-- Migration 0006: Seed Demo Accounts with Distinct App Roles
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('student', 'reviewer', 'admin', 'volunteer');
  ELSE
    BEGIN
      ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'volunteer';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

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

-- Seed Accounts
SELECT public.create_sonar_user(
  'mahasiswa@sonar.ac.id',
  'Password123!',
  'Ahmad Fauzi',
  'student',
  'S1 Ilmu Komputer'
);

SELECT public.create_sonar_user(
  'ahmad.fauzi@student.ac.id',
  'Password123!',
  'Ahmad Fauzi',
  'student',
  'S1 Ilmu Komputer'
);

SELECT public.create_sonar_user(
  'volunteer@sonar.ac.id',
  'Password123!',
  'Dewi Sartika, S.Kom.',
  'reviewer',
  'Volunteer Peninjau OCR & Math'
);

SELECT public.create_sonar_user(
  'dewi.sartika@volunteer.sonar.ac.id',
  'Password123!',
  'Dewi Sartika, S.Kom.',
  'reviewer',
  'Volunteer Peninjau OCR & Math'
);

SELECT public.create_sonar_user(
  'admin@sonar.ac.id',
  'Password123!',
  'Dr. Hendra Gunawan',
  'admin',
  'Administrator Sistem & Dosen'
);

SELECT public.create_sonar_user(
  'hendra.gunawan@faculty.ac.id',
  'Password123!',
  'Dr. Hendra Gunawan',
  'admin',
  'Administrator Sistem & Dosen'
);
