import { Suspense } from "react";
import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { UploadForm } from "@/components/documents/UploadForm";
import { loadWorkspaceSnapshot, FALLBACK_COURSES } from "@/lib/data/workspace";

export const metadata: Metadata = {
  title: "Unggah Dokumen PDF",
};

async function UploadBody({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const [snapshot, params] = await Promise.all([
    loadWorkspaceSnapshot(),
    searchParams,
  ]);

  const courses = snapshot.courses.length > 0 ? snapshot.courses : FALLBACK_COURSES;

  return (
    <div className="mx-auto max-w-4xl space-y-6 font-sans">
      <div className="space-y-1 border-b border-border pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-primary font-ui">
          Alur Pemrosesan Dokumen
        </span>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Unggah Materi Perkuliahan
        </h1>
        <p className="text-sm text-muted-foreground font-sans">
          SONAR memvalidasi file PDF, menjalankan OCR untuk halaman scan, menyusun tabel semantik,
          mengonversi formula ke MathML, dan mengindeks materi untuk pembacaan audio.
        </p>
      </div>

      <UploadForm
        courses={courses}
        defaultCourseId={params.courseId}
      />
    </div>
  );
}

export default function UploadPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  return (
    <WorkspaceShell pageSectionLabel="Unggah Dokumen">
      <Suspense fallback={<p className="text-sm text-muted-foreground font-ui">Memuat formulir unggah...</p>}>
        <UploadBody searchParams={searchParams} />
      </Suspense>
    </WorkspaceShell>
  );
}
