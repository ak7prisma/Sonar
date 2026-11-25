import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { FileUp } from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { CoursesSkeleton } from "@/components/skeletons/PageSkeletons";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto max-w-7xl space-y-8 font-sans">
      <PageHeader
        title="Mata Kuliah & Materi Terverifikasi"
        description="Akses materi perkuliahan yang telah diperiksa volunteer dan dapat digunakan kembali oleh mahasiswa terdaftar pada kelas yang sama."
        actions={
          <Button asChild className="min-h-10 rounded-full px-5 font-ui font-semibold">
            <Link href="/upload">
              <FileUp className="size-4" aria-hidden="true" />
              <span>Unggah Materi Baru</span>
            </Link>
          </Button>
        }
      />

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
