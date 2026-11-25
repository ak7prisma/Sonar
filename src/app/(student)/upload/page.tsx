import { Suspense } from "react";
import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { UploadSkeleton } from "@/components/skeletons/PageSkeletons";
import { UploadHub } from "@/components/upload/UploadHub";
import { loadCoursesCatalog, FALLBACK_COURSES } from "@/lib/data/workspace";

export const metadata: Metadata = {
  title: "Pindai Dokumen Kuliah",
};

async function UploadBody({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string; mode?: string }>;
}) {
  const [courseCatalog, params] = await Promise.all([
    loadCoursesCatalog(),
    searchParams,
  ]);

  const courses = courseCatalog.length > 0 ? courseCatalog : FALLBACK_COURSES;

  return (
    <div className="w-full max-w-5xl space-y-6 py-2 font-sans sm:py-4">
      <header className="space-y-1.5 text-left">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Unggah &amp; Pindai Materi Kuliah
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Pindai berkas PDF materi kuliah menjadi dokumen terstruktur dengan MathML dan narasi suara. Setelah dipindai, Anda dapat langsung membacanya atau membagikannya ke mata kuliah.
        </p>
      </header>

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
  searchParams: Promise<{ courseId?: string; mode?: string }>;
}) {
  return (
    <WorkspaceShell>
      <Suspense fallback={<UploadSkeleton />}>
        <UploadBody searchParams={searchParams} />
      </Suspense>
    </WorkspaceShell>
  );
}
