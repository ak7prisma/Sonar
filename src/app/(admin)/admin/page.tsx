import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react";
import { cn } from "cn";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { AdminSkeleton } from "@/components/skeletons/PageSkeletons";
import { PageHeader } from "@/components/app/PageHeader";
import { Panel } from "@/components/app/Panel";
import { ReviewStatusChip } from "@/components/app/ReviewStatusChip";
import { EmptyState } from "@/components/app/EmptyState";
import { CourseCreateForm } from "@/components/admin/CourseCreateForm";
import { loadWorkspaceSnapshot } from "@/lib/data/workspace";
import { getSharedMaterialById } from "@/lib/data/course-materials";
import { getCourseToneStyles } from "@/lib/course-theme";
import { formatDate, formatVersion } from "@/lib/format";

export const metadata: Metadata = {
  title: "Administrasi Platform",
};

async function AdminBody() {
  const snapshot = await loadWorkspaceSnapshot(true);
  const userRoles = snapshot.user?.roles ?? ["student"];
  if (!userRoles.includes("admin")) {
    redirect("/forbidden");
  }

  const courses = snapshot.courses;
  const documents = snapshot.documents;
  const jobs = snapshot.jobs;

  const verifiedCount = documents.filter(
    (d) => d.review_status === "verified"
  ).length;
  const pendingReviewCount = documents.length - verifiedCount;
  const completedJobsCount = jobs.filter((j) => j.status === "completed").length;

  const docById = new Map(documents.map((d) => [d.id, d]));

  const metrics = [
    {
      label: "Mata kuliah aktif",
      value: courses.length,
      icon: BookOpen,
      surface: "bg-brand-mint text-brand-ink",
    },
    {
      label: "Total dokumen",
      value: documents.length,
      icon: FileText,
      surface: "bg-tint-blue text-brand-ink",
    },
    {
      label: "Terverifikasi",
      value: verifiedCount,
      icon: CheckCircle2,
      surface: "bg-tint-gold text-brand-ink",
    },
    {
      label: "Menunggu / proses review",
      value: pendingReviewCount,
      icon: Clock,
      surface: "bg-tint-peach text-brand-ink",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 font-sans">
      <PageHeader
        title="Administrasi Mata Kuliah & Versi"
        description="Kelola katalog mata kuliah, pantau pelacakan versi dokumen sumber, dan tinjau status pemrosesan materi."
      />

      <section aria-label="Ringkasan data platform">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 font-ui">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card"
              >
                <span
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-2xl",
                    m.surface
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-heading text-2xl font-extrabold tabular-nums text-foreground">
                    {m.value}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    {m.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="min-w-0 space-y-6 lg:col-span-7">
          <Panel
            id="admin-courses"
            title="Mata Kuliah Terdaftar"
            description="Daftar mata kuliah yang mendukung konversi PDF dan berbagi materi terverifikasi."
          >
            {courses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Belum ada mata kuliah"
                description="Gunakan formulir di sebelah kanan untuk menambahkan mata kuliah baru."
              />
            ) : (
              <div className="space-y-3">
                {courses.map((course) => {
                  const tone = getCourseToneStyles(course);
                  const courseDocs = documents.filter(
                    (d) => d.course_id === course.id
                  ).length;

                  return (
                    <div
                      key={course.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-subtle/50 p-4"
                    >
                      <div className="min-w-0 space-y-1">
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
                        <h3 className="truncate font-heading text-base font-bold text-foreground">
                          <Link
                            href={`/courses/${course.id}`}
                            className="hover:text-primary hover:underline"
                          >
                            {course.title}
                          </Link>
                        </h3>
                      </div>
                      <span className="shrink-0 font-ui text-xs font-semibold tabular-nums text-muted-foreground">
                        {courseDocs} dokumen
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel
            id="admin-versions"
            title="Pelacakan Versi Dokumen Sumber"
            description="Memastikan versi dokumen terbaru tidak tertukar dengan hasil review versi lama."
          >
            <div className="space-y-3">
              {documents.map((doc) => {
                const sharedMeta = getSharedMaterialById(doc.id);
                return (
                  <div
                    key={doc.id}
                    className="space-y-2 rounded-xl border border-border p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/reader/${doc.id}`}
                        className="font-heading text-sm font-bold text-foreground hover:text-primary hover:underline"
                      >
                        {doc.title}
                      </Link>
                      <ReviewStatusChip status={doc.review_status} />
                    </div>
                    <p className="break-all font-mono text-xs text-muted-foreground">
                      {doc.original_filename} · Versi{" "}
                      {formatVersion(doc.current_version_id)} · Diperbarui{" "}
                      {formatDate(doc.updated_at)}
                    </p>
                    {sharedMeta?.hasNewerSourceVersion &&
                    sharedMeta.versionNotice ? (
                      <p className="flex items-start gap-2 rounded-xl bg-tint-gold p-3 text-xs text-brand-ink">
                        <AlertTriangle
                          className="mt-0.5 size-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{sharedMeta.versionNotice}</span>
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        <div className="min-w-0 space-y-6 lg:col-span-5">
          <Panel
            id="admin-create-course"
            title="Tambah Mata Kuliah Baru"
            description="Daftarkan kode dan nama mata kuliah untuk pengelompokan materi mahasiswa."
          >
            <CourseCreateForm isConfigured={snapshot.configured} />
          </Panel>

          <Panel
            id="admin-jobs"
            title="Antrean Pemrosesan Dokumen"
            description={`${completedJobsCount} dari ${jobs.length} proses selesai.`}
          >
            {jobs.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="Belum ada riwayat pemrosesan"
                description="Status konversi akan muncul di sini saat dokumen diunggah."
              />
            ) : (
              <ul className="divide-y divide-border/70 text-sm">
                {jobs.map((job) => {
                  const doc = docById.get(job.document_id);
                  return (
                    <li
                      key={job.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-heading text-sm font-bold text-foreground">
                          {doc?.title ?? job.document_id}
                        </p>
                        <p className="text-xs text-muted-foreground font-ui">
                          Tahap: {job.current_stage} · {job.progress_percent}%
                        </p>
                      </div>
                      <ReviewStatusChip status={job.status} />
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <WorkspaceShell>
      <Suspense fallback={<AdminSkeleton />}>
        <AdminBody />
      </Suspense>
    </WorkspaceShell>
  );
}
