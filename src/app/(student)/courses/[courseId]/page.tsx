import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowLeft,
  BookmarkPlus,
  BookOpen,
  CheckCircle2,
  FileUp,
  Info,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { loadWorkspaceSnapshot, FALLBACK_COURSES } from "@/lib/data/workspace";
import { getSharedMaterialsByCourse } from "@/lib/data/course-materials";

export const metadata: Metadata = {
  title: "Materi Kuliah Terverifikasi & Reusable",
};

async function CourseDetailBody({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const snapshot = await loadWorkspaceSnapshot();

  const course =
    snapshot.courses.find((c) => c.id === courseId) ??
    FALLBACK_COURSES.find((c) => c.id === courseId) ??
    FALLBACK_COURSES[0];

  const sharedMaterials = getSharedMaterialsByCourse(course.id);

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-sans">
      {/* Header & Breadcrumb */}
      <div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline font-ui mb-3"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>Kembali ke Semua Mata Kuliah</span>
        </Link>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-b border-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary font-ui uppercase">
                {course.code}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success font-ui">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Mahasiswa Terdaftar &bull; Akses Materi Bersama Aktif
              </span>
            </div>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {course.title}
            </h1>
            <p className="text-sm text-muted-foreground font-sans max-w-3xl">
              {course.description}
            </p>
          </div>

          <Button asChild className="font-ui font-semibold shrink-0 shadow-xs">
            <Link href={`/upload?courseId=${course.id}`}>
              <FileUp className="size-4 mr-2" aria-hidden="true" />
              <span>Unggah Materi PDF Baru</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Explanation Banner: Reusable Reviewed Course Materials */}
      <div className="rounded-2xl border border-primary/20 bg-secondary/60 p-5 sm:p-6 space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Info className="size-5 shrink-0" aria-hidden="true" />
          <h2 className="font-heading text-base font-bold text-foreground">
            Perpustakaan Materi Terverifikasi yang Dapat Digunakan Bersama (Reusable Materials)
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground font-sans">
          Materi di bawah ini telah melalui proses peninjauan dan verifikasi oleh volunteer akademik. Seluruh
          mahasiswa tunanetra yang terdaftar pada mata kuliah <strong>{course.code}</strong> dapat langsung
          membaca, mendengarkan audio narasi, atau menyimpan materi ini ke perpustakaan pribadi tanpa perlu
          memproses ulang dokumen yang sama secara terpisah.
        </p>
      </div>

      {/* List of Shared Reviewed Materials */}
      <section aria-labelledby="materials-list-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2
            id="materials-list-heading"
            className="font-heading text-xl font-bold text-foreground"
          >
            Materi Kuliah yang Tersedia ({sharedMaterials.length})
          </h2>
          <span className="text-xs text-muted-foreground font-ui">
            Urutan berdasarkan tanggal verifikasi terbaru
          </span>
        </div>

        {sharedMaterials.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
            Belum ada materi terverifikasi untuk mata kuliah ini. Unggah PDF materi pertama Anda sekarang.
          </div>
        ) : (
          <div className="space-y-4">
            {sharedMaterials.map((mat) => (
              <article
                key={mat.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/40 space-y-4"
              >
                {/* Newer Source Version Warning (if applicable) */}
                {mat.hasNewerSourceVersion && (
                  <div className="rounded-xl border border-amber-300/80 bg-amber-50 p-4 text-amber-900 dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-200 space-y-1">
                    <div className="flex items-center gap-2 font-bold font-ui text-xs text-amber-950 dark:text-amber-100">
                      <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
                      <span>Peringatan Versi Sumber Dokumen: Versi Baru Terdeteksi!</span>
                    </div>
                    <p className="text-xs leading-relaxed font-sans">
                      {mat.versionNotice}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 font-ui">
                      <span className="rounded bg-muted px-2 py-0.5 text-xs font-bold text-foreground">
                        {mat.category}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                        <CheckCircle2 className="size-3.5" aria-hidden="true" />
                        Disetujui Volunteer
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Ditinjau oleh <strong>{mat.reviewerName}</strong> &bull; {mat.reviewedDate}
                      </span>
                    </div>

                    <h3 className="font-heading text-xl font-bold text-foreground">
                      <Link href={`/reader/${mat.id}`} className="hover:text-primary transition-colors">
                        {mat.title}
                      </Link>
                    </h3>

                    {/* Source Version Tracking Metadata */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-ui">
                      <span>
                        File Asli: <code className="font-mono text-foreground font-semibold">{mat.sourceFilename}</code>
                      </span>
                      <span>&bull;</span>
                      <span>
                        Versi Sumber: <span className="font-bold text-primary">{mat.sourceVersion}</span>
                      </span>
                      <span>&bull;</span>
                      <span>{mat.pageCount} Halaman</span>
                      <span>&bull;</span>
                      <span>{mat.equationsCount} Rumus MathML</span>
                      <span>&bull;</span>
                      <span>{mat.audioDurationMinutes} menit audio</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0 font-ui">
                    <Button asChild size="default" className="font-semibold shadow-xs">
                      <Link href={`/reader/${mat.id}`}>
                        <BookOpen className="size-4 mr-1.5" aria-hidden="true" />
                        <span>Buka di Reader</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="default" className="font-semibold border-border">
                      <BookmarkPlus className="size-4 mr-1.5" aria-hidden="true" />
                      <span>Simpan ke Library</span>
                    </Button>
                  </div>
                </div>

                {/* Reviewer Note */}
                <div className="rounded-xl border border-border/80 bg-surface-subtle p-3.5 text-xs text-foreground/85 font-sans flex items-start gap-2.5">
                  <UserCheck className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="font-bold font-ui text-primary">Catatan Volunteer: </span>
                    <span>{mat.reviewerNotes}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  return (
    <WorkspaceShell pageSectionLabel="Materi Perkuliahan Terverifikasi">
      <Suspense fallback={<p className="text-sm text-muted-foreground font-ui">Memuat detail mata kuliah...</p>}>
        <CourseDetailBody params={params} />
      </Suspense>
    </WorkspaceShell>
  );
}
