import { Suspense } from "react";
import type { Metadata } from "next";
import {
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { CourseCreateForm } from "@/components/admin/CourseCreateForm";
import { loadWorkspaceSnapshot, FALLBACK_COURSES } from "@/lib/data/workspace";

export const metadata: Metadata = {
  title: "Admin & Tata Kelola Platform",
};

async function AdminBody() {
  const snapshot = await loadWorkspaceSnapshot();
  const courses = snapshot.courses.length > 0 ? snapshot.courses : FALLBACK_COURSES;

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-sans">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-b border-border pb-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-blue-strong dark:text-brand-blue font-ui">
            Tata Kelola &bull; Platform Governance
          </span>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Konsol Administrator SONAR
          </h1>
          <p className="text-sm text-muted-foreground font-sans max-w-3xl">
            Kelola 3 mata kuliah yang didukung, pantau antrean verifikasi volunteer, kendalikan izin berbagi (sharing permissions), dan tangani laporan kendala aksesibilitas dari mahasiswa.
          </p>
        </div>
      </div>

      {/* Admin Metrics Overview */}
      <section aria-label="Statistik Platform" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 font-ui">
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mata Kuliah Aktif</p>
          <p className="mt-2 font-heading text-3xl font-extrabold text-foreground tabular-nums">
            {courses.length}
          </p>
          <p className="mt-1 text-[11px] text-primary">CS 201, MATH 105, STAT 210</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mahasiswa Terdaftar</p>
          <p className="mt-2 font-heading text-3xl font-extrabold text-foreground tabular-nums">
            128
          </p>
          <p className="mt-1 text-[11px] text-success">Akses pembaca layar terverifikasi</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Volunteer Reviewer</p>
          <p className="mt-2 font-heading text-3xl font-extrabold text-brand-blue-strong dark:text-brand-blue tabular-nums">
            18
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Aktif meninjau dokumen</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Laporan Isu Masuk</p>
          <p className="mt-2 font-heading text-3xl font-extrabold text-warning tabular-nums">
            2
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">1 ditangani &bull; 1 dalam proses</p>
        </div>
      </section>

      {/* Management Grid */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Course Management & Source Version Tracking (7 cols) */}
        <div className="space-y-8 lg:col-span-7">
          {/* Supported Courses List */}
          <section aria-labelledby="courses-manage-heading" className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 id="courses-manage-heading" className="font-heading text-lg font-bold text-foreground">
                  Mata Kuliah Terdaftar (3 Kelas Utama)
                </h2>
                <p className="text-xs text-muted-foreground font-ui">
                  Pengaturan otorisasi mahasiswa dan pembagian materi per kelas
                </p>
              </div>
            </div>

            <div className="space-y-3 font-ui">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-xl border border-border p-4 bg-surface-subtle/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary uppercase">
                      {course.code}
                    </span>
                    <span className="text-xs font-semibold text-success flex items-center gap-1">
                      <CheckCircle2 className="size-3" />
                      Otorisasi Aktif
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-foreground">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-sans">
                    Departemen: {course.discipline} &bull; Dosen PJ: Dr. Budi Rahardjo / Prof. Hendra
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Source Version Tracking & Superseded Notice Management */}
          <section aria-labelledby="versions-manage-heading" className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="border-b border-border pb-3">
              <h2 id="versions-manage-heading" className="font-heading text-lg font-bold text-foreground">
                Pelacakan Versi Sumber Dokumen (Source-Version Tracking)
              </h2>
              <p className="text-xs text-muted-foreground font-ui">
                Menjaga agar versi review yang usang (superseded) tidak disamakan dengan versi terbaru
              </p>
            </div>

            <div className="space-y-3 text-xs font-ui">
              <div className="rounded-xl border border-brand-gold bg-tint-gold p-4 text-brand-ink space-y-1">
                <div className="flex items-center gap-2 font-bold text-brand-ink">
                  <AlertTriangle className="size-4 text-brand-ink shrink-0" />
                  <span>MATH105_Formula_UTS_v1.0.pdf (Versi Sumber Baru Diunggah Dosen)</span>
                </div>
                <p className="text-brand-ink/85 leading-relaxed font-sans">
                  Versi baru <code>v1.1</code> diunggah pada 20 Nov 2026. Mahasiswa yang mengakses materi ini saat ini melihat banner peringatan versi lama.
                </p>
              </div>

              <div className="rounded-xl border border-success/30 bg-success/10 p-4 space-y-1">
                <div className="flex items-center gap-2 font-bold text-success">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>CS201_Modul_04_BST_v2.1.pdf (Versi Terverifikasi Aktif)</span>
                </div>
                <p className="text-muted-foreground leading-relaxed font-sans">
                  Sesuai dengan slide dosen semester aktif. Seluruh MathML terverifikasi.
                </p>
              </div>
            </div>
          </section>

          {/* User-Reported Issues Queue */}
          <section aria-labelledby="issues-heading" className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="border-b border-border pb-3">
              <h2 id="issues-heading" className="font-heading text-lg font-bold text-foreground">
                Laporan Isu Aksesibilitas dari Mahasiswa
              </h2>
              <p className="text-xs text-muted-foreground font-ui">
                Umpan balik pembacaan rumus, tabel, dan urutan heading yang dilaporkan pengguna
              </p>
            </div>

            <div className="space-y-3 text-xs font-ui">
              <div className="rounded-xl border border-border p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">MATH 105: Deskripsi Gambar 5.3</span>
                  <span className="rounded bg-tint-gold text-brand-ink px-2 py-0.5 font-bold text-[10px]">
                    Dalam Penanganan
                  </span>
                </div>
                <p className="text-muted-foreground font-sans">
                  Pelapor: Ahmad Fauzi &bull; &ldquo;Arah putaran integral garis belum jelas searah atau berlawanan jarum jam.&rdquo;
                </p>
              </div>

              <div className="rounded-xl border border-border p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">CS 201: Tabel 1 Rotasi AVL</span>
                  <span className="rounded bg-success/15 text-success px-2 py-0.5 font-bold text-[10px]">
                    Terselesaikan
                  </span>
                </div>
                <p className="text-muted-foreground font-sans">
                  Pelapor: Maya Lin &bull; &ldquo;Header tabel baris pertama telah diperbaiki oleh volunteer Dewi Sartika.&rdquo;
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Course Creation Form & Inngest Job Queue (5 cols) */}
        <div className="space-y-8 lg:col-span-5 font-ui">
          {/* Create New Course */}
          <section aria-labelledby="admin-create-course" className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="border-b border-border pb-3">
              <h2 id="admin-create-course" className="font-heading text-base font-bold text-foreground">
                Tambah Mata Kuliah Baru
              </h2>
              <p className="text-xs text-muted-foreground">
                Daftarkan kurikulum semester untuk akses mahasiswa tunanetra
              </p>
            </div>
            <CourseCreateForm isConfigured={true} />
          </section>

          {/* Inngest Background Pipeline Monitor */}
          <section aria-labelledby="admin-jobs-heading" className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="border-b border-border pb-3">
              <h2 id="admin-jobs-heading" className="font-heading text-base font-bold text-foreground">
                Monitor Pemrosesan Dokumen
              </h2>
              <p className="text-xs text-muted-foreground">
                Status ekstraksi OCR, MathML, dan embedding vektor
              </p>
            </div>

            <ul className="divide-y divide-border/60 text-xs">
              <li className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">CS201_Modul_04_BST_v2.1.pdf</p>
                  <p className="text-muted-foreground">Tahap: Finalisasi MathML &bull; 100% Selesai</p>
                </div>
                <span className="rounded bg-success/15 text-success px-2 py-0.5 font-bold text-[10px]">
                  Selesai
                </span>
              </li>
              <li className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">MATH105_Bab03_Turunan_Parsial.pdf</p>
                  <p className="text-muted-foreground">Tahap: Vektor RAG Chunks &bull; 100% Selesai</p>
                </div>
                <span className="rounded bg-success/15 text-success px-2 py-0.5 font-bold text-[10px]">
                  Selesai
                </span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <WorkspaceShell pageSectionLabel="Konsol Administrator">
      <Suspense fallback={<p className="text-sm text-muted-foreground font-ui">Memuat konsol admin...</p>}>
        <AdminBody />
      </Suspense>
    </WorkspaceShell>
  );
}
