import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  BookmarkPlus,
  BookOpen,
  CheckCircle2,
  FileText,
  FileUp,
  Info,
  UserCheck,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { loadCourseDetailWithMaterials } from "@/lib/data/workspace";
import { CourseEnrollButton } from "@/components/courses/CourseEnrollButton";
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
  const {
    course,
    documents: courseDocs,
    isEnrolled,
    memberCount,
  } = await loadCourseDetailWithMaterials(courseId);

  const sharedFallback = getSharedMaterialsByCourse(course.id);

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
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary font-ui uppercase">
                {course.code}
              </span>
              <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground font-ui">
                {course.discipline}
              </span>
            </div>

            <div>
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {course.title}
              </h1>
              <p className="text-sm text-muted-foreground font-sans max-w-3xl mt-1">
                {course.description}
              </p>
            </div>

            {/* Live Enrollment Controller */}
            <div className="pt-1">
              <CourseEnrollButton
                courseId={course.id}
                initialEnrolled={isEnrolled}
                memberCount={memberCount}
              />
            </div>
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
            Perpustakaan Materi Terkoneksi Supabase (Verified Materials)
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground font-sans">
          Materi pada mata kuliah <strong>{course.code}</strong> tersimpan langsung di database Supabase dan dapat dibaca oleh seluruh mahasiswa yang terdaftar dengan rendering MathML aksesibel dan pemutar audio TTS.
        </p>
      </div>

      {/* List of Shared Reviewed Materials from Supabase */}
      <section aria-labelledby="materials-list-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2
            id="materials-list-heading"
            className="font-heading text-xl font-bold text-foreground"
          >
            Materi Kuliah yang Tersedia ({courseDocs.length})
          </h2>
          <span className="text-xs text-muted-foreground font-ui">
            Sumber data: Supabase Live Database
          </span>
        </div>

        {courseDocs.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground space-y-3">
            <p>Belum ada berkas PDF untuk mata kuliah ini di Supabase.</p>
            <Button asChild variant="outline" size="sm">
              <Link href={`/upload?courseId=${course.id}`}>
                <FileUp className="size-4 mr-1.5" />
                Unggah Materi PDF Pertama
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {courseDocs.map((doc) => {
              const matchedSample = sharedFallback.find(
                (s) => s.id === doc.id || s.title === doc.title
              );

              return (
                <article
                  key={doc.id}
                  className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/40 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 font-ui">
                        <span className="rounded bg-muted px-2 py-0.5 text-xs font-bold text-foreground">
                          {matchedSample?.category ?? "Dokumen PDF"}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                          <CheckCircle2 className="size-3.5" aria-hidden="true" />
                          {doc.review_status === "verified" ? "Terverifikasi" : "Tersimpan"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Bahasa: <strong>{doc.language.toUpperCase()}</strong> &bull; Skor Akurasi: {Math.round((doc.overall_confidence ?? 0.98) * 100)}%
                        </span>
                      </div>

                      <h3 className="font-heading text-xl font-bold text-foreground">
                        <Link href={`/reader/${doc.id}`} className="hover:text-primary transition-colors">
                          {doc.title}
                        </Link>
                      </h3>

                      {/* Source Metadata */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-ui">
                        <span className="flex items-center gap-1">
                          <FileText className="size-3.5" />
                          <code className="font-mono text-foreground font-semibold">{doc.original_filename}</code>
                        </span>
                        <span>&bull;</span>
                        <span>{doc.page_count > 0 ? `${doc.page_count} Halaman` : "Multi Halaman"}</span>
                        <span>&bull;</span>
                        <span>{(doc.file_size_bytes / (1024 * 1024)).toFixed(2)} MB</span>
                        <span>&bull;</span>
                        <span>MathML &amp; Audio TTS Siap</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0 font-ui">
                      <Button asChild size="default" className="font-semibold shadow-xs">
                        <Link href={`/reader/${doc.id}`}>
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

                  {/* Reviewer / Volunteer Note */}
                  <div className="rounded-xl border border-border/80 bg-surface-subtle p-3.5 text-xs text-foreground/85 font-sans flex items-start gap-2.5">
                    <UserCheck className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <span className="font-bold font-ui text-primary">Status Verifikasi Volunteer: </span>
                      <span>
                        {matchedSample?.reviewerNotes ??
                          "Dokumen materi telah terindeks ke basis data Supabase dan siap diakses dengan teknologi asistif."}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
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
