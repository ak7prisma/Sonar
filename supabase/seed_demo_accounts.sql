-- ============================================================================
-- SQL Script: Pembuatan Akun Supabase Auth Berdasarkan Peran (Role)
-- SONAR Platform
-- ============================================================================
-- Jalankan skrip ini langsung di Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================================

-- 1. Pastikan ekstensi pgcrypto tersedia untuk hashing bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- 2. Pastikan enum app_role mencakup peran yang dibutuhkan
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

-- 3. Fungsi Helper: Buat / Update Pengguna Lengkap di auth.users & public.profiles
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
  -- Hash kata sandi menggunakan bcrypt standard Supabase (cost factor 10)
  v_encrypted_password := crypt(p_password, gen_salt('bf', 10));

  -- Cari apakah email sudah ada di auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = LOWER(TRIM(p_email));

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    -- Tambahkan ke tabel auth.users Supabase dengan status email terverifikasi langsung
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

    -- Tambahkan ke auth.identities untuk provider email
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
    -- Jika user sudah ada, perbarui kata sandi dan status konfirmasi
    UPDATE auth.users
    SET
      encrypted_password = v_encrypted_password,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      raw_user_meta_data = jsonb_build_object('full_name', p_full_name, 'study_program', p_study_program),
      updated_at = NOW()
    WHERE id = v_user_id;

    -- Perbarui atau buat identitas jika belum ada
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

  -- Buat / Perbarui Profil Publik
  INSERT INTO public.profiles (id, email, full_name, study_program)
  VALUES (v_user_id, LOWER(TRIM(p_email)), p_full_name, p_study_program)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    study_program = EXCLUDED.study_program,
    updated_at = NOW();

  -- Buat / Perbarui Peran Pengguna (hapus peran lama bila ada lalu pasang peran target)
  DELETE FROM public.user_roles WHERE user_id = v_user_id;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, p_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Inisialisasi preferensi aksesibilitas
  INSERT INTO public.accessibility_preferences (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN v_user_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- 4. Eksekusi Pembuatan Akun Demo Tiap Peran
-- ----------------------------------------------------------------------------

-- A. Akun Mahasiswa Tunanetra (Role: student)
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

-- B. Akun Volunteer Reviewer (Role: reviewer)
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

-- C. Akun Administrator (Role: admin)
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

-- ----------------------------------------------------------------------------
-- 5. Menampilkan Ringkasan Akun yang Berhasil Dibuat
-- ----------------------------------------------------------------------------
SELECT 
  p.id AS user_id,
  p.email,
  p.full_name,
  ur.role AS app_role,
  p.study_program,
  'Password123!' AS default_password,
  u.email_confirmed_at IS NOT NULL AS email_confirmed
FROM public.profiles p
JOIN public.user_roles ur ON ur.user_id = p.id
JOIN auth.users u ON u.id = p.id
WHERE p.email IN (
  'mahasiswa@sonar.ac.id',
  'ahmad.fauzi@student.ac.id',
  'volunteer@sonar.ac.id',
  'dewi.sartika@volunteer.sonar.ac.id',
  'admin@sonar.ac.id',
  'hendra.gunawan@faculty.ac.id'
)
ORDER BY ur.role ASC, p.email ASC;
