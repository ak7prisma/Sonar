import { Suspense } from "react";
import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { UploadHub } from "@/components/upload/UploadHub";
import { loadWorkspaceSnapshot, FALLBACK_COURSES } from "@/lib/data/workspace";

export const metadata: Metadata = {
  title: "Unggah Materi Kuliah",
};

async function UploadBody({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string; mode?: string }>;
}) {
  const [snapshot, params] = await Promise.all([
    loadWorkspaceSnapshot(),
    searchParams,
  ]);

  const courses = snapshot.courses.length > 0 ? snapshot.courses : FALLBACK_COURSES;
  const initialMode = params.mode === "ocr" ? "ocr" : "pdf";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 py-2 font-sans sm:py-6">
      <header className="space-y-2 text-center">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Unggah Materi Kuliah
        </h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Ubah berkas PDF perkuliahan atau hasil pindai menjadi dokumen terstruktur dengan MathML dan narasi suara.
        </p>
      </header>

      <UploadHub
        courses={courses}
        defaultCourseId={params.courseId}
        initialMode={initialMode}
      />
    </div>
  );
}

export default function UploadPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string; mode?: string }>;
}) {
  return (
    <WorkspaceShell>
      <Suspense
        fallback={
          <p className="mx-auto max-w-3xl py-6 text-center text-sm text-muted-foreground font-ui">
            Memuat ruang unggah dokumen…
          </p>
        }
      >
        <UploadBody searchParams={searchParams} />
      </Suspense>
    </WorkspaceShell>
  );
}
