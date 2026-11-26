import { Suspense } from "react";
import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { CoursesSkeleton } from "@/components/skeletons/PageSkeletons";
import { CoursesPageHeader } from "@/components/courses/CoursesPageHeader";
import { loadWorkspaceSnapshot, FALLBACK_COURSES } from "@/lib/data/workspace";
import { CoursesCatalogSearch } from "@/components/courses/CoursesCatalogSearch";

export const metadata: Metadata = {
  title: "Mata Kuliah & Materi",
};

async function CoursesBody() {
  const snapshot = await loadWorkspaceSnapshot();
  const courses = snapshot.courses.length > 0 ? snapshot.courses : FALLBACK_COURSES;
  const documents = snapshot.documents || [];

  return (
    <div className="w-full max-w-7xl space-y-8 font-sans">
      <CoursesPageHeader />

      <CoursesCatalogSearch
        courses={courses}
        documents={documents}
      />
    </div>
  );
}

export default function CoursesPage() {
  return (
    <WorkspaceShell>
      <Suspense fallback={<CoursesSkeleton />}>
        <CoursesBody />
      </Suspense>
    </WorkspaceShell>
  );
}
