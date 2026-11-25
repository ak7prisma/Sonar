import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  AlertTriangle,
  BookOpen,
  ClipboardCheck,
  FileText,
  FileUp,
  ShieldCheck,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { CourseDetailSkeleton } from "@/components/skeletons/PageSkeletons";
import { PageHeader } from "@/components/app/PageHeader";
import { ReviewStatusChip } from "@/components/app/ReviewStatusChip";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import { CourseEnrollButton } from "@/components/courses/CourseEnrollButton";
import { loadCourseDetailWithMaterials } from "@/lib/data/workspace";
import { getSharedMaterialsByCourse } from "@/lib/data/course-materials";
import { getCourseToneStyles } from "@/lib/course-theme";
import {
  formatFileSize,
  formatPageCount,
  formatVersion,
} from "@/lib/format";
import { cn } from "cn";

export const metadata: Metadata = {
  title: "Materi Mata Kuliah",
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
    currentUser,
  } = await loadCourseDetailWithMaterials(courseId);

  const tone = getCourseToneStyles(course);
  const sharedFallback = getSharedMaterialsByCourse(course.id);
  const verifiedDocsCount = courseDocs.filter(
    (d) => d.review_status === "verified"
  ).length;
  const userRoles = currentUser?.roles ?? [];
  const canReview =
    userRoles.includes("admin") ||
    userRoles.includes("reviewer") ||
    userRoles.includes("volunteer");

  return (
    <div className="mx-auto max-w-7xl space-y-6 font-sans">
      <PageHeader
        backHref="/courses"
        backLabel="Semua Mata Kuliah"
        title={course.title}
        description={course.description ?? undefined}
        actions={
          <Button
            asChild
            className="min-h-10 rounded-full px-5 font-ui font-semibold"
          >
            <Link href={`/upload?courseId=${course.id}`}>
              <FileUp className="size-4" aria-hidden="true" />
              <span>Unggah Materi PDF</span>
            </Link>
          </Button>
        }
      />

      {/* Compact Course Metadata & Enrollment Strip */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-card lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-2.5 text-sm font-ui">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              tone.surface,
              "text-brand-ink"
            )}
          >
            {course.code}
          </span>
          <span className="text-muted-foreground">{course.discipline}</span>
          <span className="text-muted-foreground">·</span>
          <span className="inline-flex items-center gap-1.5 text-foreground">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            <span>
              {verifiedDocsCount} materi terverifikasi siap dipakai se-kelas
            </span>
          </span>
        </div>

        <CourseEnrollButton
          courseId={course.id}
          initialEnrolled={isEnrolled}
          memberCount={memberCount}
        />
      </div>

      {/* Materials List */}
      <section aria-labelledby="materials-list-heading" className="space-y-4">
        <h2
          id="materials-list-heading"
          className="font-heading text-xl font-bold text-foreground"
        >
          Daftar Materi ({courseDocs.length})
        </h2>

        {courseDocs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Belum ada materi untuk mata kuliah ini"
            description="Unggah berkas PDF perkuliahan pertama untuk dikonversi ke format ramah pembaca layar."
            action={
              <Button asChild className="rounded-full">
                <Link href={`/upload?courseId=${course.id}`}>
                  Unggah Materi Pertama
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {courseDocs.map((doc) => {
              const matchedSample = sharedFallback.find(
                (s) => s.id === doc.id || s.title === doc.title
              );

              return (
                <article
                  key={doc.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-card transition-colors hover:border-primary/40 sm:p-6 space-y-4"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2 font-ui">
                        <ReviewStatusChip status={doc.review_status} />
                        <span className="rounded-full bg-surface-subtle px-2.5 py-0.5 text-xs font-semibold text-foreground">
                          Versi {formatVersion(doc.current_version_id)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Bahasa: {doc.language.toUpperCase()}
                        </span>
                      </div>

                      <h3 className="font-heading text-lg font-bold text-foreground sm:text-xl">
                        <Link
                          href={`/reader/${doc.id}`}
                          className="hover:text-primary hover:underline"
                        >
                          {doc.title}
                        </Link>
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground font-ui">
                        <span className="inline-flex items-center gap-1.5">
                          <FileText className="size-4 shrink-0" aria-hidden="true" />
                          <code className="font-mono text-xs text-foreground">
                            {doc.original_filename}
                          </code>
                        </span>
                        <span>·</span>
                        <span>{formatPageCount(doc.page_count)}</span>
                        <span>·</span>
                        <span>{formatFileSize(doc.file_size_bytes)}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2 font-ui">
                      <Button
                        asChild
                        className="min-h-10 rounded-full px-5 font-semibold"
                      >
                        <Link href={`/reader/${doc.id}`}>
                          <BookOpen className="size-4" aria-hidden="true" />
                          <span>Buka di Pembaca</span>
                        </Link>
                      </Button>

                      {canReview ? (
                        <Button
                          variant="outline"
                          asChild
                          className="min-h-10 rounded-full px-4 font-semibold"
                        >
                          <Link href={`/review/${doc.id}`}>
                            <ClipboardCheck className="size-4" aria-hidden="true" />
                            <span>Tinjau</span>
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {matchedSample?.hasNewerSourceVersion &&
                  matchedSample.versionNotice ? (
                    <div
                      role="status"
                      className="flex items-start gap-2.5 rounded-xl border border-brand-gold bg-tint-gold p-3.5 text-sm text-brand-ink"
                    >
                      <AlertTriangle
                        className="mt-0.5 size-4 shrink-0"
                        aria-hidden="true"
                      />
                      <p>{matchedSample.versionNotice}</p>
                    </div>
                  ) : null}

                  {matchedSample?.reviewerNotes ? (
                    <div className="rounded-xl bg-surface-subtle/70 p-3.5 text-sm text-foreground">
                      <p className="font-ui text-xs font-semibold text-secondary-foreground">
                        Catatan Volunteer ({matchedSample.reviewerName})
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {matchedSample.reviewerNotes}
                      </p>
                    </div>
                  ) : null}
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
    <WorkspaceShell>
      <Suspense fallback={<CourseDetailSkeleton />}>
        <CourseDetailBody params={params} />
      </Suspense>
    </WorkspaceShell>
  );
}
