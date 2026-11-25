-- ============================================================================
-- SONAR: Seed Courses & Enrollments directly in Supabase SQL Editor
-- Run this in your Supabase SQL Editor to seed the Course Catalog & Materials.
-- ============================================================================

-- 0. Grant schema and table privileges to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- 1. Ensure RLS on Courses allows catalog viewing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
    DROP POLICY IF EXISTS courses_select_member_or_admin ON public.courses;
    DROP POLICY IF EXISTS courses_select_all ON public.courses;
    
    CREATE POLICY courses_select_all ON public.courses
      FOR SELECT USING (true);

    DROP POLICY IF EXISTS courses_insert_admin ON public.courses;
    CREATE POLICY courses_insert_admin ON public.courses
      FOR INSERT WITH CHECK (public.has_role('admin'));

    DROP POLICY IF EXISTS courses_update_admin ON public.courses;
    CREATE POLICY courses_update_admin ON public.courses
      FOR UPDATE USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));
  END IF;

  -- 2. Ensure RLS on Course Members allows self-enrollment and viewing
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'course_members') THEN
    DROP POLICY IF EXISTS course_members_select_all ON public.course_members;
    CREATE POLICY course_members_select_all ON public.course_members
      FOR SELECT USING (true);

    DROP POLICY IF EXISTS course_members_insert_self ON public.course_members;
    CREATE POLICY course_members_insert_self ON public.course_members
      FOR INSERT WITH CHECK (user_id = auth.uid() OR public.has_role('admin'));

    DROP POLICY IF EXISTS course_members_delete_self ON public.course_members;
    CREATE POLICY course_members_delete_self ON public.course_members
      FOR DELETE USING (user_id = auth.uid() OR public.has_role('admin'));
  END IF;

  -- 3. Ensure RLS on Documents allows reading verified course materials
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'documents') THEN
    DROP POLICY IF EXISTS documents_select_accessible ON public.documents;
    CREATE POLICY documents_select_accessible ON public.documents
      FOR SELECT USING (
        uploaded_by = auth.uid()
        OR review_status = 'verified'
        OR public.is_course_member(course_id)
        OR public.has_role('admin')
        OR public.has_role('reviewer')
      );
  END IF;
END $$;

-- 4. Seed Course Catalog Data
DO $$
DECLARE
  v_admin_id UUID;
  v_student_id UUID;
  v_volunteer_id UUID;

  v_course_cs UUID := 'a0000000-0000-0000-0000-000000000201'::uuid;
  v_course_math UUID := 'a0000000-0000-0000-0000-000000000105'::uuid;
  v_course_stat UUID := 'a0000000-0000-0000-0000-000000000210'::uuid;
  v_course_phys UUID := 'a0000000-0000-0000-0000-000000000101'::uuid;
  v_course_se UUID := 'a0000000-0000-0000-0000-000000000211'::uuid;
  v_course_ai UUID := 'a0000000-0000-0000-0000-000000000301'::uuid;

  v_doc_cs UUID := 'b0000000-0000-0000-0000-000000000001'::uuid;
  v_doc_math UUID := 'b0000000-0000-0000-0000-000000000002'::uuid;
  v_doc_stat UUID := 'b0000000-0000-0000-0000-000000000003'::uuid;

  v_ver_cs UUID := 'c0000000-0000-0000-0000-000000000001'::uuid;
  v_ver_math UUID := 'c0000000-0000-0000-0000-000000000002'::uuid;
  v_ver_stat UUID := 'c0000000-0000-0000-0000-000000000003'::uuid;
BEGIN
  -- Determine creator profile ID
  SELECT id INTO v_admin_id FROM public.profiles WHERE email IN ('admin@sonar.ac.id', 'hendra.gunawan@faculty.ac.id') LIMIT 1;
  IF v_admin_id IS NULL THEN
    SELECT id INTO v_admin_id FROM public.profiles LIMIT 1;
  END IF;
  IF v_admin_id IS NULL THEN
    v_admin_id := '00000000-0000-0000-0000-000000000001'::uuid;
  END IF;

  SELECT id INTO v_student_id FROM public.profiles WHERE email IN ('mahasiswa@sonar.ac.id', 'ahmad.fauzi@student.ac.id') LIMIT 1;
  IF v_student_id IS NULL THEN
    v_student_id := v_admin_id;
  END IF;

  SELECT id INTO v_volunteer_id FROM public.profiles WHERE email IN ('volunteer@sonar.ac.id', 'dewi.sartika@volunteer.sonar.ac.id') LIMIT 1;
  IF v_volunteer_id IS NULL THEN
    v_volunteer_id := v_admin_id;
  END IF;

  -- 4.1 Insert Courses
  INSERT INTO public.courses (id, code, title, discipline, description, created_by)
  VALUES
    (
      v_course_cs,
      'CS 201',
      'Struktur Data dan Algoritma',
      'Ilmu Komputer',
      'Analisis kompleksitas algoritma, linked list, tree, binary search tree, graph traversal, dan hashing dengan struktur dokumen ramah teknologi asistif.',
      v_admin_id
    ),
    (
      v_course_math,
      'MATH 105',
      'Kalkulus Multivariabel & Aljabar Linier',
      'Matematika Terapan',
      'Fungsi multivariabel, turunan parsial, integral lipat, ruang vektor, nilai eigen, dan representasi formula MathML terbaca pembaca layar.',
      v_admin_id
    ),
    (
      v_course_stat,
      'STAT 210',
      'Teori Probabilitas & Inferensi Statistik',
      'Statistika & Sains Data',
      'Distribusi probabilitas diskrit dan kontinu, teorema limit pusat, estimasi parameter, uji hipotesis, dan tabel statistik terstruktur.',
      v_admin_id
    ),
    (
      v_course_phys,
      'PHYS 101',
      'Fisika Dasar & Mekanika Klasik',
      'Fisika & Rekayasa',
      'Kinematika, dinamika Newton, hukum kekekalan energi, momentum, getaran harmonik, dan deskripsi visual diagram gaya.',
      v_admin_id
    ),
    (
      v_course_se,
      'IF 211',
      'Rekayasa Perangkat Lunak & Sistem Terdistribusi',
      'Informatika',
      'Arsitektur perangkat lunak, pemodelan semantik, desain API aksesibel, mikroservis, dan pengujian keandalan sistem.',
      v_admin_id
    ),
    (
      v_course_ai,
      'AI 301',
      'Pengantar Kecerdasan Buatan & Pembelajaran Mesin',
      'Kecerdasan Buatan',
      'Representasi pengetahuan, pencarian heuristik, regresi, klasifikasi, transformer multimodal, dan model pemrosesan bahasa alami.',
      v_admin_id
    )
  ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    title = EXCLUDED.title,
    discipline = EXCLUDED.discipline,
    description = EXCLUDED.description,
    updated_at = NOW();

  -- 4.2 Enroll Users into Course Memberships
  INSERT INTO public.course_members (course_id, user_id, member_role)
  VALUES
    (v_course_cs, v_student_id, 'student'),
    (v_course_math, v_student_id, 'student'),
    (v_course_stat, v_student_id, 'student'),
    (v_course_cs, v_volunteer_id, 'reviewer'),
    (v_course_math, v_volunteer_id, 'reviewer'),
    (v_course_cs, v_admin_id, 'instructor'),
    (v_course_math, v_admin_id, 'instructor')
  ON CONFLICT (course_id, user_id) DO NOTHING;

  -- 4.3 Seed Initial Documents for Courses
  INSERT INTO public.documents (
    id,
    course_id,
    uploaded_by,
    title,
    original_filename,
    storage_path,
    file_hash,
    file_size_bytes,
    page_count,
    processing_status,
    review_status,
    overall_confidence,
    language
  )
  VALUES
    (
      v_doc_cs,
      v_course_cs,
      v_student_id,
      'Modul 04 — Binary Search Trees & AVL Balancing',
      'CS201_Modul_04_BST_v2.1.pdf',
      'course-documents/CS201_Modul_04_BST_v2.1.pdf',
      'hash_cs_201_bst_module_04',
      3450200,
      24,
      'completed',
      'verified',
      0.985,
      'id'
    ),
    (
      v_doc_math,
      v_course_math,
      v_student_id,
      'Bab 03 — Turunan Parsial & Matriks Hessian',
      'MATH105_Bab_03_Turunan_Parsial.pdf',
      'course-documents/MATH105_Bab_03_Turunan_Parsial.pdf',
      'hash_math_105_calc_bab_03',
      4120500,
      18,
      'completed',
      'verified',
      0.978,
      'id'
    ),
    (
      v_doc_stat,
      v_course_stat,
      v_student_id,
      'Handout 02 — Distribusi Probabilitas Kontinu & Tabel Z',
      'STAT210_Handout_02_Probabilitas.pdf',
      'course-documents/STAT210_Handout_02_Probabilitas.pdf',
      'hash_stat_210_probabilitas_02',
      2890100,
      14,
      'completed',
      'verified',
      0.992,
      'id'
    )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    processing_status = 'completed',
    review_status = 'verified',
    updated_at = NOW();

  -- 4.4 Seed Document Versions
  INSERT INTO public.document_versions (
    id,
    document_id,
    version_number,
    source_storage_path,
    change_summary,
    created_by
  )
  VALUES
    (v_ver_cs, v_doc_cs, 1, 'course-documents/CS201_Modul_04_BST_v2.1.pdf', 'Verifikasi awal struktur MathML BST', v_volunteer_id),
    (v_ver_math, v_doc_math, 1, 'course-documents/MATH105_Bab_03_Turunan_Parsial.pdf', 'Verifikasi formula kalkulus parsial', v_volunteer_id),
    (v_ver_stat, v_doc_stat, 1, 'course-documents/STAT210_Handout_02_Probabilitas.pdf', 'Verifikasi tabel distribusi dan integral Gaussian', v_volunteer_id)
  ON CONFLICT (id) DO NOTHING;

  -- Connect current_version_id to documents
  UPDATE public.documents SET current_version_id = v_ver_cs WHERE id = v_doc_cs;
  UPDATE public.documents SET current_version_id = v_ver_math WHERE id = v_doc_math;
  UPDATE public.documents SET current_version_id = v_ver_stat WHERE id = v_doc_stat;

  -- 4.5 Seed Accessible Document Blocks for CS 201
  INSERT INTO public.document_blocks (
    document_id,
    version_id,
    page_number,
    reading_order,
    block_type,
    heading_level,
    content_text,
    content_html,
    spoken_text,
    confidence_score,
    is_verified,
    metadata
  )
  VALUES
    (
      v_doc_cs,
      v_ver_cs,
      1,
      1,
      'heading',
      1,
      '1. Pendahuluan Struktur Pohon Biner Seimbang (AVL Trees)',
      '<h1>1. Pendahuluan Struktur Pohon Biner Seimbang (AVL Trees)</h1>',
      'Bab Satu. Pendahuluan Struktur Pohon Biner Seimbang atau AVL Trees.',
      0.995,
      true,
      '{}'::jsonb
    ),
    (
      v_doc_cs,
      v_ver_cs,
      1,
      2,
      'paragraph',
      NULL,
      'Pohon biner pencarian (Binary Search Tree / BST) adalah struktur data hierarkis di mana setiap simpul memiliki maksimal dua anak dengan properti: anak kiri selalu bernilai lebih kecil dan anak kanan selalu bernilai lebih besar dari simpul induk.',
      '<p>Pohon biner pencarian (Binary Search Tree / BST) adalah struktur data hierarkis di mana setiap simpul memiliki maksimal dua anak dengan properti: anak kiri selalu bernilai lebih kecil dan anak kanan selalu bernilai lebih besar dari simpul induk.</p>',
      'Pohon biner pencarian adalah struktur data hierarkis di mana setiap simpul memiliki maksimal dua anak dengan properti: anak kiri selalu bernilai lebih kecil dan anak kanan selalu bernilai lebih besar dari simpul induk.',
      0.985,
      true,
      '{}'::jsonb
    ),
    (
      v_doc_cs,
      v_ver_cs,
      1,
      3,
      'equation',
      NULL,
      'T(n) = 2T(n/2) + O(n)',
      '<math display="block"><mrow><mi>T</mi><mo>(</mo><mi>n</mi><mo>)</mo><mo>=</mo><mn>2</mn><mi>T</mi><mo>(</mo><mfrac><mi>n</mi><mn>2</mn></mfrac><mo>)</mo><mo>+</mo><mi>O</mi><mo>(</mo><mi>n</mi><mo>)</mo></mrow></math>',
      'T dari n sama dengan dua dikali T dari n per dua ditambah big O dari n.',
      0.990,
      true,
      '{"latex": "T(n) = 2T\\left(\\frac{n}{2}\\right) + O(n)"}'::jsonb
    ),
    (
      v_doc_cs,
      v_ver_cs,
      1,
      4,
      'table',
      NULL,
      'Tabel Perbandingan Kompleksitas Operasi BST vs AVL Tree',
      '<table><thead><tr><th>Operasi</th><th>BST Kasus Rata-rata</th><th>AVL Tree (Terjamin)</th></tr></thead><tbody><tr><td>Pencarian</td><td>O(log n)</td><td>O(log n)</td></tr><tr><td>Penyisipan</td><td>O(log n)</td><td>O(log n)</td></tr></tbody></table>',
      'Tabel Perbandingan Kompleksitas Operasi BST versus AVL Tree. Baris satu: Pencarian, BST O log n, AVL O log n. Baris dua: Penyisipan, BST O log n, AVL O log n.',
      0.975,
      true,
      '{"headers": ["Operasi", "BST Kasus Rata-rata", "AVL Tree (Terjamin)"], "rows": [["Pencarian", "O(log n)", "O(log n)"], ["Penyisipan", "O(log n)", "O(log n)"]]}'::jsonb
    )
  ON CONFLICT DO NOTHING;

END $$;
