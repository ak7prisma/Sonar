import { Suspense } from "react";
import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { UploadHub } from "@/components/upload/UploadHub";
import { loadWorkspaceSnapshot, FALLBACK_COURSES } from "@/lib/data/workspace";

export const metadata: Metadata = {
  title: "Unggah & Scan Dokumen",
};

async function UploadBody({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string; mode?: "ocr" | "pdf" }>;
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
          Alur Pemrosesan Dokumen Aksesibel
        </span>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Digitalisasi &amp; Scan Materi
        </h1>
        <p className="text-sm text-muted-foreground font-sans">
          Scan halaman buku/rumus matematika dengan kamera atau unggah berkas PDF perkuliahan.
          SONAR otomatis mengekstrak blok semantik, mengonversi formula ke MathML, dan menyediakan narasi suara.
        </p>
      </div>

      <UploadHub
        courses={courses}
        defaultCourseId={params.courseId}
        initialMode={params.mode === "pdf" ? "pdf" : "ocr"}
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
