import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Clock, FileUp } from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { CoursesSkeleton } from "@/components/skeletons/PageSkeletons";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { loadWorkspaceSnapshot, FALLBACK_COURSES } from "@/lib/data/workspace";
import { getCourseToneStyles } from "@/lib/course-theme";
import { APP_IMAGES } from "@/lib/images";
import { cn } from "cn";

export const metadata: Metadata = {
  title: "Mata Kuliah & Materi",
};

function getCourseImage(course: { id: string; code: string; discipline: string }) {
  if (course.id === "math-105") return APP_IMAGES.courseMath;
  if (course.id === "stat-210") return APP_IMAGES.courseStat;
  if (course.id === "cs-201") return APP_IMAGES.courseCS;

  const code = course.code.toLowerCase();
  const disc = course.discipline.toLowerCase();
  if (code.includes("math") || disc.includes("matematika")) return APP_IMAGES.courseMath;
  if (code.includes("stat") || disc.includes("statistika")) return APP_IMAGES.courseStat;
  return APP_IMAGES.courseCS;
}

async function CoursesBody() {
  const snapshot = await loadWorkspaceSnapshot();
  const courses = snapshot.courses.length > 0 ? snapshot.courses : FALLBACK_COURSES;

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, idx) => {
          const courseImage = getCourseImage(course);
          const tone = getCourseToneStyles(course);
          const courseSlug = course.code.toLowerCase().replace(/\s+/g, "-");
          const docs = snapshot.documents.filter(
            (d) => d.course_id === course.id || d.course_id === courseSlug
          );
          const verifiedCount = docs.filter(
            (d) => d.review_status === "verified"
          ).length;
          const pendingCount = docs.length - verifiedCount;

          return (
            <article
              key={course.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-colors hover:border-primary/50"
            >
              <div>
                <div className="relative aspect-16/9 w-full overflow-hidden bg-muted">
                  <Image
                    src={courseImage.src}
                    alt={courseImage.alt}
                    fill
                    priority={idx === 0}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                <div className="space-y-3 p-5">
                  <div className="flex flex-wrap items-center gap-2 font-ui">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        tone.surface,
                        "text-brand-ink"
                      )}
                    >
                      {course.code}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {course.discipline}
                    </span>
                  </div>

                  <h2 className="font-heading text-lg font-bold leading-snug text-foreground">
                    <Link
                      href={`/courses/${course.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {course.title}
                    </Link>
                  </h2>

                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {course.description}
                  </p>

                  <div className="space-y-2 border-t border-border/70 pt-3 text-sm font-ui">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <CheckCircle2
                          className="size-4 text-primary"
                          aria-hidden="true"
                        />
                        <span>Materi terverifikasi</span>
                      </span>
                      <span className="font-semibold tabular-nums text-foreground">
                        {verifiedCount} dokumen
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
                        <span>Dalam proses review</span>
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {pendingCount} dokumen
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/70 bg-surface-subtle/50 p-4 font-ui">
                <Button
                  asChild
                  className="min-h-10 w-full justify-between rounded-full px-4 font-semibold"
                >
                  <Link href={`/courses/${course.id}`}>
                    <span>Lihat Materi Kelas</span>
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </article>
          );
        })}
      </div>
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
