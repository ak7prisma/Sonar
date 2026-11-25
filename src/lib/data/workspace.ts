import "server-only";

import { getAuthenticatedContext } from "@/lib/supabase/auth-helpers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentAppUser } from "@/lib/auth/session";
import type { AppRole, Database } from "@/types/database";

export type CourseRow = Database["public"]["Tables"]["courses"]["Row"];
export type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];
export type DocumentBlockRow = Database["public"]["Tables"]["document_blocks"]["Row"];
export type DocumentTableRow = Database["public"]["Tables"]["document_tables"]["Row"];
export type DocumentEquationRow = Database["public"]["Tables"]["document_equations"]["Row"];
export type DocumentFigureRow = Database["public"]["Tables"]["document_figures"]["Row"];
export type ProcessingJobRow = Database["public"]["Tables"]["processing_jobs"]["Row"];
export type DocumentReviewRow = Database["public"]["Tables"]["document_reviews"]["Row"];

export interface WorkspaceSnapshot {
  configured: boolean;
  missingServices: string[];
  user: {
    id: string;
    email: string;
    fullName: string | null;
    roles: AppRole[];
  } | null;
  courses: CourseRow[];
  documents: DocumentRow[];
  jobs: ProcessingJobRow[];
}

export interface ScannedDocumentEntry {
  document: DocumentRow;
  course: CourseRow;
  blocks: DocumentBlockRow[];
  tables: DocumentTableRow[];
  equations: DocumentEquationRow[];
  figures: DocumentFigureRow[];
  signedPdfUrl?: string | null;
}

const SCANNED_DOCUMENTS_STORE = new Map<string, ScannedDocumentEntry>();

export function registerScannedDocument(entry: ScannedDocumentEntry): void {
  SCANNED_DOCUMENTS_STORE.set(entry.document.id, entry);
}

export function getScannedDocument(documentId: string): ScannedDocumentEntry | undefined {
  return SCANNED_DOCUMENTS_STORE.get(documentId);
}

export function listScannedDocuments(): DocumentRow[] {
  return Array.from(SCANNED_DOCUMENTS_STORE.values()).map((e) => e.document);
}

export const FALLBACK_COURSES: CourseRow[] = [
  {
    id: "cs-201",
    code: "CS 201",
    title: "Struktur Data dan Algoritma",
    discipline: "Ilmu Komputer",
    description: "Analisis kompleksitas algoritma, linked list, tree, binary search tree, graph traversal, dan hashing dengan struktur dokumen ramah teknologi asistif.",
    created_by: "usr-admin-001",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "math-105",
    code: "MATH 105",
    title: "Kalkulus Multivariabel & Aljabar Linier",
    discipline: "Matematika Terapan",
    description: "Fungsi multivariabel, turunan parsial, integral lipat, ruang vektor, nilai eigen, dan representasi formula MathML terbaca pembaca layar.",
    created_by: "usr-admin-001",
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "stat-210",
    code: "STAT 210",
    title: "Teori Probabilitas & Inferensi Statistik",
    discipline: "Statistika & Sains Data",
    description: "Distribusi probabilitas diskrit dan kontinu, teorema limit pusat, estimasi parameter, uji hipotesis, dan tabel statistik terstruktur.",
    created_by: "usr-admin-001",
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const FALLBACK_DOCUMENTS: DocumentRow[] = [
  {
    id: "doc-cs-01",
    course_id: "cs-201",
    uploaded_by: "usr-student-001",
    title: "Modul 04 — Binary Search Trees & AVL Balancing",
    original_filename: "CS201_Modul_04_BST_v2.1.pdf",
    storage_path: "course-documents/cs-201/CS201_Modul_04_BST_v2.1.pdf",
    file_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    file_size_bytes: 3450200,
    page_count: 24,
    current_version_id: "ver-cs-01-v2.1",
    processing_status: "completed",
    review_status: "verified",
    overall_confidence: 0.98,
    language: "id",
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "doc-cs-02",
    course_id: "cs-201",
    uploaded_by: "usr-student-001",
    title: "Slide 07 — Graph Traversal: BFS dan DFS",
    original_filename: "CS201_Graph_BFS_DFS_v1.0.pdf",
    storage_path: "course-documents/cs-201/CS201_Graph_BFS_DFS_v1.0.pdf",
    file_hash: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
    file_size_bytes: 2180000,
    page_count: 18,
    current_version_id: "ver-cs-02-v1.0",
    processing_status: "completed",
    review_status: "verified",
    overall_confidence: 0.96,
    language: "id",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "doc-math-01",
    course_id: "math-105",
    uploaded_by: "usr-student-001",
    title: "Bab 03 — Turunan Parsial dan Matriks Hessian",
    original_filename: "MATH105_Bab03_Turunan_Parsial_v1.2.pdf",
    storage_path: "course-documents/math-105/MATH105_Bab03_Turunan_Parsial_v1.2.pdf",
    file_hash: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    file_size_bytes: 4210000,
    page_count: 32,
    current_version_id: "ver-math-01-v1.2",
    processing_status: "completed",
    review_status: "verified",
    overall_confidence: 0.97,
    language: "id",
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "doc-math-02",
    course_id: "math-105",
    uploaded_by: "usr-student-001",
    title: "Ringkasan Formula UTS Kalkulus Multivariabel",
    original_filename: "MATH105_Formula_UTS_v1.0.pdf",
    storage_path: "course-documents/math-105/MATH105_Formula_UTS_v1.0.pdf",
    file_hash: "88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589",
    file_size_bytes: 1450000,
    page_count: 8,
    current_version_id: "ver-math-02-v1.0",
    processing_status: "completed",
    review_status: "verified",
    overall_confidence: 0.94,
    language: "id",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "doc-stat-01",
    course_id: "stat-210",
    uploaded_by: "usr-student-001",
    title: "Handout 02 — Distribusi Probabilitas Diskrit & Kontinu",
    original_filename: "STAT210_Distribusi_Probabilitas_v2.0.pdf",
    storage_path: "course-documents/stat-210/STAT210_Distribusi_Probabilitas_v2.0.pdf",
    file_hash: "e5a017130c61fb826912323414e4b0116004696140b01957c4c5a003f433f515",
    file_size_bytes: 3820000,
    page_count: 28,
    current_version_id: "ver-stat-01-v2.0",
    processing_status: "completed",
    review_status: "verified",
    overall_confidence: 0.99,
    language: "id",
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "doc-cs-03",
    course_id: "cs-201",
    uploaded_by: "usr-student-001",
    title: "Tugas 02 — Analisis Kompleksitas Red-Black Tree",
    original_filename: "CS201_Tugas_02_RBT_v1.0.pdf",
    storage_path: "course-documents/cs-201/CS201_Tugas_02_RBT_v1.0.pdf",
    file_hash: "7d793037a0760186574b0282f2f435e7b1e50774690f473b724452048f1242f9",
    file_size_bytes: 1890000,
    page_count: 6,
    current_version_id: "ver-cs-03-v1.0",
    processing_status: "completed",
    review_status: "in_review",
    overall_confidence: 0.92,
    language: "id",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: "doc-math-03",
    course_id: "math-105",
    uploaded_by: "usr-student-001",
    title: "Latihan Soal — Teorema Green dan Integral Garis",
    original_filename: "MATH105_Latihan_Teorema_Green_v1.0.pdf",
    storage_path: "course-documents/math-105/MATH105_Latihan_Teorema_Green_v1.0.pdf",
    file_hash: "2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef9f8b244ee13",
    file_size_bytes: 2750000,
    page_count: 14,
    current_version_id: "ver-math-03-v1.0",
    processing_status: "completed",
    review_status: "needs_revision",
    overall_confidence: 0.89,
    language: "id",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
];

export const FALLBACK_JOBS: ProcessingJobRow[] = [
  {
    id: "job-01",
    document_id: "doc-cs-01",
    version_id: "ver-cs-01-v2.1",
    inngest_run_id: "run-cs-01",
    status: "completed",
    current_stage: "finalize",
    progress_percent: 100,
    attempts: 1,
    error_message: null,
    logs: [],
    started_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 6 * 86400000 + 120000).toISOString(),
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 86400000 + 120000).toISOString(),
  },
  {
    id: "job-02",
    document_id: "doc-cs-03",
    version_id: "ver-cs-03-v1.0",
    inngest_run_id: "run-cs-03",
    status: "completed",
    current_stage: "finalize",
    progress_percent: 100,
    attempts: 1,
    error_message: null,
    logs: [],
    started_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 1 * 86400000 + 95000).toISOString(),
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000 + 95000).toISOString(),
  },
];

export async function loadWorkspaceSnapshot(): Promise<WorkspaceSnapshot> {
  const demoUser = await getCurrentAppUser();

  let courses: CourseRow[] = [];
  let documents: DocumentRow[] = [];
  let jobs: ProcessingJobRow[] = [];

  let authUser: {
    id: string;
    email: string;
    fullName: string | null;
    roles: AppRole[];
  } | null = demoUser
    ? {
        id: demoUser.id,
        email: demoUser.email,
        fullName: demoUser.name,
        roles: [demoUser.role],
      }
    : null;

  if (isSupabaseConfigured()) {
    const { supabase, auth } = await getAuthenticatedContext();
    const client = supabase ?? (await createServerSupabaseClient());

    if (auth) {
      authUser = {
        id: auth.userId,
        email: auth.email,
        fullName: auth.fullName,
        roles: auth.roles,
      };
    }

    if (client) {
      const [{ data: dbCourses }, { data: dbDocs }, { data: dbJobs }] =
        await Promise.all([
          client.from("courses").select("*").order("code", { ascending: true }),
          client.from("documents").select("*").order("created_at", { ascending: false }).limit(30),
          client.from("processing_jobs").select("*").order("created_at", { ascending: false }).limit(20),
        ]);

      if (dbCourses && dbCourses.length > 0) {
        courses = dbCourses;
      }
      if (dbDocs && dbDocs.length > 0) {
        documents = dbDocs;
      }
      if (dbJobs && dbJobs.length > 0) {
        jobs = dbJobs;
      }
    }
  }

  const scannedDocs = listScannedDocuments();
  const baseDocs = documents.length > 0 ? documents : FALLBACK_DOCUMENTS;
  const mergedDocs = [
    ...scannedDocs,
    ...baseDocs.filter((d) => !scannedDocs.some((s) => s.id === d.id)),
  ];

  return {
    configured: isSupabaseConfigured(),
    missingServices: [],
    user: authUser,
    courses: courses.length > 0 ? courses : FALLBACK_COURSES,
    documents: mergedDocs,
    jobs: jobs.length > 0 ? jobs : FALLBACK_JOBS,
  };
}

export async function loadCourseDetailWithMaterials(courseId: string) {
  const snapshot = await loadWorkspaceSnapshot();
  const lowerId = courseId.toLowerCase().trim();

  // Find course matching UUID, code, or slug (e.g. "cs-201" matching "CS 201")
  const course =
    snapshot.courses.find(
      (c) =>
        c.id.toLowerCase() === lowerId ||
        c.code.toLowerCase() === lowerId ||
        c.code.toLowerCase().replace(/\s+/g, "-") === lowerId
    ) ??
    FALLBACK_COURSES.find(
      (c) =>
        c.id.toLowerCase() === lowerId ||
        c.code.toLowerCase() === lowerId ||
        c.code.toLowerCase().replace(/\s+/g, "-") === lowerId
    ) ??
    snapshot.courses[0] ??
    FALLBACK_COURSES[0];

  let courseDocuments: DocumentRow[] = [];
  let isEnrolled = false;
  let memberCount = 0;
  let userRoleInCourse: string | null = null;

  if (isSupabaseConfigured()) {
    const { supabase, auth } = await getAuthenticatedContext();
    const client = supabase ?? (await createServerSupabaseClient());

    if (client) {
      const [
        { data: dbDocs },
        { count: totalMembers },
        userMembershipRes,
      ] = await Promise.all([
        client
          .from("documents")
          .select("*")
          .eq("course_id", course.id)
          .order("created_at", { ascending: false }),
        client
          .from("course_members")
          .select("id", { count: "exact", head: true })
          .eq("course_id", course.id),
        auth
          ? client
              .from("course_members")
              .select("member_role")
              .eq("course_id", course.id)
              .eq("user_id", auth.userId)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      if (dbDocs && dbDocs.length > 0) {
        courseDocuments = dbDocs;
      }
      memberCount = totalMembers ?? 0;
      if (userMembershipRes.data) {
        isEnrolled = true;
        userRoleInCourse = userMembershipRes.data.member_role;
      }
    }
  }

  // Fallback to static documents if no documents in database yet for this course
  if (courseDocuments.length === 0) {
    courseDocuments = FALLBACK_DOCUMENTS.filter(
      (d) =>
        d.course_id === course.id ||
        (course.code === "CS 201" && d.course_id === "cs-201") ||
        (course.code === "MATH 105" && d.course_id === "math-105") ||
        (course.code === "STAT 210" && d.course_id === "stat-210")
    );
  }

  return {
    course,
    documents: courseDocuments,
    isEnrolled,
    memberCount: Math.max(memberCount, 1),
    userRoleInCourse,
    currentUser: snapshot.user,
  };
}

export async function loadDocumentDetail(documentId: string) {
  // Check dynamically scanned documents first (ensures real scanned results load immediately)
  const scanned = getScannedDocument(documentId);
  if (scanned) {
    return {
      document: scanned.document,
      course: scanned.course,
      blocks: scanned.blocks,
      tables: scanned.tables,
      equations: scanned.equations,
      figures: scanned.figures,
      reviews: [],
      signedPdfUrl: scanned.signedPdfUrl ?? null,
      viewerRoles: ["student", "reviewer"] as AppRole[],
    };
  }

  const demoUser = await getCurrentAppUser();
  const fallbackDoc = FALLBACK_DOCUMENTS.find((d) => d.id === documentId) ?? FALLBACK_DOCUMENTS[0];
  const fallbackCourse = FALLBACK_COURSES.find((c) => c.id === fallbackDoc.course_id) ?? FALLBACK_COURSES[0];

  if (isSupabaseConfigured()) {
    const { supabase, auth } = await getAuthenticatedContext();
    if (supabase && auth) {
      const { data: document } = await supabase
        .from("documents")
        .select("*")
        .eq("id", documentId)
        .maybeSingle();

      if (document) {
        const [
          { data: course },
          { data: blocks },
          { data: tables },
          { data: equations },
          { data: figures },
          { data: reviews },
          { data: signed },
        ] = await Promise.all([
          supabase.from("courses").select("*").eq("id", document.course_id).maybeSingle(),
          supabase.from("document_blocks").select("*").eq("document_id", documentId).order("reading_order", { ascending: true }),
          supabase.from("document_tables").select("*").eq("document_id", documentId),
          supabase.from("document_equations").select("*").eq("document_id", documentId),
          supabase.from("document_figures").select("*").eq("document_id", documentId),
          supabase.from("document_reviews").select("*").eq("document_id", documentId).order("started_at", { ascending: false }),
          supabase.storage.from("course-documents").createSignedUrl(document.storage_path, 600),
        ]);

        return {
          document,
          course: course ?? fallbackCourse,
          blocks: blocks ?? [],
          tables: tables ?? [],
          equations: equations ?? [],
          figures: figures ?? [],
          reviews: reviews ?? [],
          signedPdfUrl: signed?.signedUrl ?? null,
          viewerRoles: auth.roles,
        };
      }
    }
  }

  const fallbackBlocks: DocumentBlockRow[] = [
    {
      id: "blk-01",
      document_id: fallbackDoc.id,
      version_id: fallbackDoc.current_version_id ?? "v1",
      section_id: null,
      page_number: 1,
      reading_order: 1,
      block_type: "heading",
      heading_level: 1,
      content_text: "1. Pendahuluan Struktur Pohon Biner Seimbang (AVL Trees)",
      content_html: "<h1>1. Pendahuluan Struktur Pohon Biner Seimbang (AVL Trees)</h1>",
      spoken_text: "Bab Satu. Pendahuluan Struktur Pohon Biner Seimbang atau AVL Trees.",
      ai_generated: false,
      confidence_score: 0.99,
      needs_review: false,
      is_verified: true,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "blk-02",
      document_id: fallbackDoc.id,
      version_id: fallbackDoc.current_version_id ?? "v1",
      section_id: null,
      page_number: 1,
      reading_order: 2,
      block_type: "paragraph",
      heading_level: null,
      content_text:
        "Dalam pohon biner pencarian biasa (Binary Search Tree), operasi pencarian, penyisipan, dan penghapusan memiliki kompleksitas waktu kasus terburuk O(n) apabila elemen disisipkan secara berurutan sehingga pohon membentuk rantai linier.",
      content_html:
        "<p>Dalam pohon biner pencarian biasa (Binary Search Tree), operasi pencarian, penyisipan, dan penghapusan memiliki kompleksitas waktu kasus terburuk O(n) apabila elemen disisipkan secara berurutan sehingga pohon membentuk rantai linier.</p>",
      spoken_text: null,
      ai_generated: false,
      confidence_score: 0.98,
      needs_review: false,
      is_verified: true,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "blk-03",
      document_id: fallbackDoc.id,
      version_id: fallbackDoc.current_version_id ?? "v1",
      section_id: null,
      page_number: 1,
      reading_order: 3,
      block_type: "heading",
      heading_level: 2,
      content_text: "1.1 Definisi Faktor Keseimbangan (Balance Factor)",
      content_html: "<h2>1.1 Definisi Faktor Keseimbangan (Balance Factor)</h2>",
      spoken_text: "Subbab satu titik satu. Definisi Faktor Keseimbangan atau Balance Factor.",
      ai_generated: false,
      confidence_score: 0.99,
      needs_review: false,
      is_verified: true,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "blk-04",
      document_id: fallbackDoc.id,
      version_id: fallbackDoc.current_version_id ?? "v1",
      section_id: null,
      page_number: 1,
      reading_order: 4,
      block_type: "equation",
      heading_level: null,
      content_text: "BF(v) = height(left(v)) - height(right(v)) \\in \\{-1, 0, 1\\}",
      content_html: `<math display="block"><mrow><mi>BF</mi><mo>(</mo><mi>v</mi><mo>)</mo><mo>=</mo><mi>height</mi><mo>(</mo><mi>left</mi><mo>(</mo><mi>v</mi><mo>)</mo><mo>)</mo><mo>-</mo><mi>height</mi><mo>(</mo><mi>right</mi><mo>(</mo><mi>v</mi><mo>)</mo><mo>)</mo><mo>&isin;</mo><mo>{</mo><mo>-</mo><mn>1</mn><mo>,</mo><mn>0</mn><mo>,</mo><mn>1</mn><mo>}</mo></mrow></math>`,
      spoken_text: "B F dari v sama dengan tinggi anak kiri dikurang tinggi anak kanan v, merupakan elemen minus satu, nol, atau satu.",
      ai_generated: false,
      confidence_score: 0.97,
      needs_review: false,
      is_verified: true,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "blk-05",
      document_id: fallbackDoc.id,
      version_id: fallbackDoc.current_version_id ?? "v1",
      section_id: null,
      page_number: 2,
      reading_order: 5,
      block_type: "paragraph",
      heading_level: null,
      content_text:
        "Suatu simpul v dalam pohon AVL dikatakan seimbang jika dan hanya jika faktor keseimbangannya berada pada himpunan {-1, 0, 1}. Apabila setelah penyisipan nilai faktor keseimbangan menjadi +2 atau -2, pohon harus diseimbangkan kembali menggunakan operasi rotasi.",
      content_html:
        "<p>Suatu simpul v dalam pohon AVL dikatakan seimbang jika dan hanya jika faktor keseimbangannya berada pada himpunan {-1, 0, 1}. Apabila setelah penyisipan nilai faktor keseimbangan menjadi +2 atau -2, pohon harus diseimbangkan kembali menggunakan operasi rotasi.</p>",
      spoken_text: null,
      ai_generated: false,
      confidence_score: 0.98,
      needs_review: false,
      is_verified: true,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "blk-06",
      document_id: fallbackDoc.id,
      version_id: fallbackDoc.current_version_id ?? "v1",
      section_id: null,
      page_number: 2,
      reading_order: 6,
      block_type: "table",
      heading_level: null,
      content_text: "Tabel 1: Perbandingan Kasus Rotasi Pohon AVL",
      content_html: `<table class="w-full border-collapse border border-border"><thead><tr class="bg-surface-subtle"><th scope="col" class="border border-border p-2 text-left font-bold">Jenis Rotasi</th><th scope="col" class="border border-border p-2 text-left font-bold">Kondisi Pelanggaran</th><th scope="col" class="border border-border p-2 text-left font-bold">Tindakan Penyeimbangan</th></tr></thead><tbody><tr><th scope="row" class="border border-border p-2 font-medium">Single Right Rotation (LL)</th><td class="border border-border p-2">Penyisipan pada subpohon kiri dari anak kiri</td><td class="border border-border p-2">Rotasi kanan tunggal pada simpul kakek</td></tr><tr><th scope="row" class="border border-border p-2 font-medium">Single Left Rotation (RR)</th><td class="border border-border p-2">Penyisipan pada subpohon kanan dari anak kanan</td><td class="border border-border p-2">Rotasi kiri tunggal pada simpul kakek</td></tr><tr><th scope="row" class="border border-border p-2 font-medium">Left-Right Rotation (LR)</th><td class="border border-border p-2">Penyisipan pada subpohon kanan dari anak kiri</td><td class="border border-border p-2">Rotasi kiri pada anak, lalu rotasi kanan pada kakek</td></tr></tbody></table>`,
      spoken_text: null,
      ai_generated: false,
      confidence_score: 0.96,
      needs_review: false,
      is_verified: true,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "blk-07",
      document_id: fallbackDoc.id,
      version_id: fallbackDoc.current_version_id ?? "v1",
      section_id: null,
      page_number: 3,
      reading_order: 7,
      block_type: "figure",
      heading_level: null,
      content_text: "Gambar 1.2: Diagram Rotasi Tunggal Kanan pada AVL Tree",
      content_html: `<figure class="my-4 rounded-lg border border-border p-4 bg-card"><img src="/images/course_cs.jpg" alt="Diagram visual pohon biner AVL menunjukkan simpul akar bernilai 30 dengan anak kiri bernilai 20 sebelum rotasi kanan, dan simpul 20 menjadi akar baru setelah rotasi dengan subpohon yang seimbang sempurna." class="rounded-md w-full max-h-72 object-cover" /><figcaption class="mt-2 text-sm text-muted-foreground font-ui">Gambar 1.2: Diagram proses rotasi kanan (Right Rotation) untuk memulihkan invariant ketinggian pohon.</figcaption></figure>`,
      spoken_text: null,
      ai_generated: false,
      confidence_score: 0.95,
      needs_review: false,
      is_verified: true,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const fallbackTables: DocumentTableRow[] = [
    {
      id: "tbl-01",
      block_id: "blk-06",
      document_id: fallbackDoc.id,
      caption: "Perbandingan Kasus Rotasi Pohon AVL",
      headers: ["Jenis Rotasi", "Kondisi Pelanggaran", "Tindakan Penyeimbangan"],
      rows: [
        ["Single Right Rotation (LL)", "Penyisipan pada subpohon kiri dari anak kiri", "Rotasi kanan tunggal pada simpul kakek"],
        ["Single Left Rotation (RR)", "Penyisipan pada subpohon kanan dari anak kanan", "Rotasi kiri tunggal pada simpul kakek"],
        ["Left-Right Rotation (LR)", "Penyisipan pada subpohon kanan dari anak kiri", "Rotasi kiri pada anak, lalu rotasi kanan pada kakek"],
      ],
      row_count: 3,
      column_count: 3,
      created_at: new Date().toISOString(),
    },
  ];

  const fallbackEquations: DocumentEquationRow[] = [
    {
      id: "eq-01",
      block_id: "blk-04",
      document_id: fallbackDoc.id,
      latex: "BF(v) = height(left(v)) - height(right(v)) \\in \\{-1, 0, 1\\}",
      mathml: `<math display="block"><mrow><mi>BF</mi><mo>(</mo><mi>v</mi><mo>)</mo><mo>=</mo><mi>height</mi><mo>(</mo><mi>left</mi><mo>(</mo><mi>v</mi><mo>)</mo><mo>)</mo><mo>-</mo><mi>height</mi><mo>(</mo><mi>right</mi><mo>(</mo><mi>v</mi><mo>)</mo><mo>)</mo><mo>&isin;</mo><mo>{</mo><mo>-</mo><mn>1</mn><mo>,</mo><mn>0</mn><mo>,</mo><mn>1</mn><mo>}</mo></mrow></math>`,
      narration_en: "B F of v equals height of left child of v minus height of right child of v, in the set of negative one, zero, or one.",
      narration_id: "B F dari v sama dengan ketinggian anak kiri v dikurangi ketinggian anak kanan v, bernilai antara minus satu, nol, atau satu.",
      is_supported: true,
      unsupported_reason: null,
      created_at: new Date().toISOString(),
    },
  ];

  const fallbackFigures: DocumentFigureRow[] = [
    {
      id: "fig-01",
      block_id: "blk-07",
      document_id: fallbackDoc.id,
      figure_label: "Gambar 1.2",
      figure_type: "tree_diagram",
      summary: "Diagram visual pohon biner AVL menunjukkan simpul akar bernilai 30 dengan anak kiri bernilai 20 sebelum rotasi kanan, dan simpul 20 menjadi akar baru setelah rotasi dengan subpohon yang seimbang sempurna.",
      axes_and_units: null,
      trends: null,
      key_points: ["Akar lama 30", "Akar baru 20", "Subpohon seimbang"],
      uncertainty_notes: null,
      created_at: new Date().toISOString(),
    },
  ];

  const fallbackReviews: DocumentReviewRow[] = [
    {
      id: "rev-01",
      document_id: fallbackDoc.id,
      version_id: fallbackDoc.current_version_id ?? "v1",
      reviewer_id: "usr-volunteer-001",
      status: "verified",
      notes: "Seluruh formula LaTeX, rotasi AVL, dan deskripsi taktil pohon biner telah diverifikasi. MathML terbaca lancar di NVDA dan VoiceOver. Disetujui untuk materi kelas bersama.",
      started_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      completed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      duration_seconds: 720,
    },
  ];

  return {
    document: fallbackDoc,
    course: fallbackCourse,
    blocks: fallbackBlocks,
    tables: fallbackTables,
    equations: fallbackEquations,
    figures: fallbackFigures,
    reviews: fallbackReviews,
    signedPdfUrl: null,
    viewerRoles: demoUser ? [demoUser.role] : (["student"] as AppRole[]),
  };
}
