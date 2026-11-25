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
  const initialMode = params.mode === "ocr" ? "ocr" : "pdf";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 py-2 font-sans sm:py-6">
      <header className="space-y-2 text-center">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Pindai Dokumen Kuliah
        </h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Pindai berkas PDF materi kuliah menjadi dokumen terstruktur dengan MathML dan narasi suara. Setelah dipindai, Anda dapat langsung membacanya atau membagikannya ke mata kuliah.
        </p>
      </header>

      <UploadHub
        courses={courses}
        defaultCourseId={params.courseId}
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
