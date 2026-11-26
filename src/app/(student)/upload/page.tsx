import { Suspense } from "react";
import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { UploadSkeleton } from "@/components/skeletons/PageSkeletons";
import { UploadPageHeader } from "@/components/upload/UploadPageHeader";
import { UploadHub } from "@/components/upload/UploadHub";
import { loadCoursesCatalog, FALLBACK_COURSES } from "@/lib/data/workspace";

export const metadata: Metadata = {
  title: "Scan PDF Mata Kuliah",
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
      <UploadPageHeader />

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
