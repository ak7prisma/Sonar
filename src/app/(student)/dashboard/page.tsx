import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  FileUp,
  Headphones,
  SlidersHorizontal,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { Panel } from "@/components/app/Panel";
import { ReviewStatusChip } from "@/components/app/ReviewStatusChip";
import { StudyActivityPanel } from "@/components/dashboard/StudyActivityPanel";
import { loadWorkspaceSnapshot } from "@/lib/data/workspace";
import { getCourseToneStyles } from "@/lib/course-theme";
import {
  formatDate,
  formatPageCount,
  formatVersion,
  initialsOf,
} from "@/lib/format";
import { cn } from "cn";

export const metadata: Metadata = {
  title: "Dashboard",
};

async function DashboardBody() {
  const snapshot = await loadWorkspaceSnapshot();

  const totalDocs = snapshot.documents.length;
  const verifiedDocs = snapshot.documents.filter(
    (d) => d.review_status === "verified"
  );
  const verifiedCount = verifiedDocs.length;
  const inReviewCount = totalDocs - verifiedCount;
  const verifiedPct =
    totalDocs > 0 ? Math.round((verifiedCount / totalDocs) * 100) : 0;

  const coursesById = new Map(snapshot.courses.map((c) => [c.id, c]));
  const resumeDoc = verifiedDocs[0] ?? snapshot.documents[0] ?? null;
  const resumeCourse = resumeDoc
    ? coursesById.get(resumeDoc.course_id)
    : undefined;

  const displayName =
    snapshot.user?.fullName?.trim() ||
    snapshot.user?.email?.split("@")[0] ||
    "Pengguna SONAR";
  const greetingName = displayName.split(",")[0].trim() || displayName;
  const userRoles = snapshot.user?.roles ?? ["student"];
  const canReview =
    userRoles.includes("admin") ||
    userRoles.includes("reviewer") ||
    userRoles.includes("volunteer");

  const chartData = snapshot.courses.slice(0, 3).map((course) => {
    const docs = snapshot.documents.filter((d) => d.course_id === course.id);
    return {
      label: course.code,
      documents: docs.length,
      verifiedBlocks: docs.filter((d) => d.review_status === "verified").length,
    };
  });

  const ringRadius = 44;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - verifiedPct / 100);

  return (
    <div className="mx-auto max-w-7xl font-sans">
      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* LEFT PRIMARY COLUMN (8 cols) */}
        <div className="min-w-0 space-y-6 lg:col-span-8">
          {/* HERO CONTINUE-READING BANNER */}
          <section
            aria-label="Lanjutkan belajar"
            className="relative overflow-hidden rounded-3xl bg-brand-teal p-6 text-white shadow-card sm:p-8"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-brand-aqua/25"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-10 right-16 size-32 rounded-full bg-brand-gold/20"
            />

            <div className="relative z-10 max-w-2xl space-y-4">
              <h1 className="font-heading text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {resumeDoc
                  ? `Lanjutkan Belajar, ${greetingName}`
                  : `Selamat Datang, ${greetingName}`}
              </h1>
              <p className="text-sm leading-relaxed text-white sm:text-base">
                {resumeDoc
                  ? `${resumeCourse?.code ?? resumeDoc.course_id.toUpperCase()} — ${resumeDoc.title} (${formatPageCount(resumeDoc.page_count)}, versi ${formatVersion(resumeDoc.current_version_id)}).`
                  : "Unggah materi PDF perkuliahan atau buka perpustakaan kelas yang sudah diverifikasi volunteer."}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 font-ui">
                {resumeDoc ? (
                  <Link
                    href={`/reader/${resumeDoc.id}`}
                    className="inline-flex min-h-11 items-center gap-3 rounded-full bg-brand-ink py-1.5 pr-2 pl-5 text-sm font-semibold text-white transition-colors hover:bg-brand-ink/90"
                  >
                    <span>Lanjutkan Membaca</span>
                    <span className="flex size-8 items-center justify-center rounded-full bg-white text-brand-ink">
                      <ChevronRight className="size-4" aria-hidden="true" />
                    </span>
                  </Link>
                ) : null}

                <Link
                  href="/upload"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-mint"
                >
                  <FileUp className="size-4" aria-hidden="true" />
                  <span>Unggah PDF</span>
                </Link>
              </div>
            </div>
          </section>

          {/* 3 COURSE PROGRESS CARDS (REAL VERIFICATION RATIO) */}
          <section aria-labelledby="courses-overview-heading" className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2
                id="courses-overview-heading"
                className="font-heading text-lg font-bold tracking-tight text-foreground"
              >
                Mata Kuliah Aktif
              </h2>
              <Link
                href="/courses"
                className="inline-flex min-h-9 items-center gap-1 rounded-md px-2 font-ui text-sm font-semibold text-secondary-foreground hover:underline"
              >
                <span>Semua kelas</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {snapshot.courses.slice(0, 3).map((course) => {
                const courseDocs = snapshot.documents.filter(
                  (d) => d.course_id === course.id
                );
                const courseVerified = courseDocs.filter(
                  (d) => d.review_status === "verified"
                ).length;
                const ratioPct =
                  courseDocs.length > 0
                    ? Math.round((courseVerified / courseDocs.length) * 100)
                    : 0;
                const tone = getCourseToneStyles(course);

                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="group flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition-colors hover:border-primary/50"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-xl",
                          tone.surface,
                          tone.icon
                        )}
                      >
                        <BookOpen className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-heading text-sm font-bold text-foreground group-hover:text-primary">
                          {course.code}
                        </p>
                        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                          {course.title}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 font-ui">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Terverifikasi</span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {courseVerified}/{courseDocs.length}
                        </span>
                      </div>
                      <div
                        aria-hidden="true"
                        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                      >
                        <div
                          className={cn("h-full rounded-full", tone.bar)}
                          style={{ width: `${ratioPct}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* UNIFIED MATERIALS LIST */}
          <Panel
            id="dashboard-lessons"
            title="Materi Kuliah & Status Verifikasi"
            description="Materi terverifikasi dapat langsung dibaca dengan screen reader dan audio narasi."
            action={
              <Link
                href="/courses"
                className="inline-flex min-h-9 items-center font-ui text-sm font-semibold text-secondary-foreground hover:underline"
              >
                Lihat semua
              </Link>
            }
          >
            {/* Mobile Stacked Cards */}
            <div className="space-y-3 md:hidden">
              {snapshot.documents.slice(0, 6).map((doc) => {
                const course = coursesById.get(doc.course_id);
                const tone = getCourseToneStyles(course ?? { code: doc.course_id });

                return (
                  <div
                    key={doc.id}
                    className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface-subtle/50 p-3.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 font-ui text-xs font-semibold whitespace-nowrap",
                          tone.surface,
                          "text-brand-ink"
                        )}
                      >
                        {course?.code ?? doc.course_id.toUpperCase()}
                      </span>
                      <ReviewStatusChip status={doc.review_status} />
                    </div>
                    <Link
                      href={`/reader/${doc.id}`}
                      className="font-heading text-sm font-bold text-foreground hover:text-primary hover:underline"
                    >
                      {doc.title}
                    </Link>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-ui text-xs text-muted-foreground">
                        {formatVersion(doc.current_version_id)} ·{" "}
                        {formatDate(doc.updated_at)}
                      </span>
                      <Link
                        href={`/reader/${doc.id}`}
                        className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 font-ui text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-brand-mint hover:text-brand-ink"
                      >
                        <Headphones className="size-3.5" aria-hidden="true" />
                        <span>Baca</span>
                        <span className="sr-only"> {doc.title}</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Semantic Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">
                  Daftar materi perkuliahan dan status verifikasinya
                </caption>
                <thead>
                  <tr className="border-b border-border font-ui text-xs font-semibold text-muted-foreground">
                    <th scope="col" className="py-2.5 pr-4">
                      Mata Kuliah
                    </th>
                    <th scope="col" className="py-2.5 pr-4">
                      Materi &amp; Versi
                    </th>
                    <th scope="col" className="py-2.5 pr-4">
                      Status
                    </th>
                    <th scope="col" className="py-2.5 text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {snapshot.documents.slice(0, 6).map((doc) => {
                    const course = coursesById.get(doc.course_id);
                    const tone = getCourseToneStyles(course ?? { code: doc.course_id });

                    return (
                      <tr key={doc.id} className="align-middle">
                        <td className="py-3.5 pr-4">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-0.5 font-ui text-xs font-semibold whitespace-nowrap",
                              tone.surface,
                              "text-brand-ink"
                            )}
                          >
                            {course?.code ?? doc.course_id.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4">
                          <Link
                            href={`/reader/${doc.id}`}
                            className="block font-heading text-sm font-bold text-foreground hover:text-primary hover:underline"
                          >
                            {doc.title}
                          </Link>
                          <p className="font-ui text-xs text-muted-foreground">
                            {formatVersion(doc.current_version_id)} ·{" "}
                            {formatPageCount(doc.page_count)} ·{" "}
                            {formatDate(doc.updated_at)}
                          </p>
                        </td>
                        <td className="py-3.5 pr-4">
                          <ReviewStatusChip status={doc.review_status} />
                        </td>
                        <td className="py-3.5 text-right">
                          <Link
                            href={`/reader/${doc.id}`}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-background px-3 font-ui text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-brand-mint hover:text-brand-ink"
                          >
                            <Headphones className="size-3.5" aria-hidden="true" />
                            <span>Baca</span>
                            <span className="sr-only"> {doc.title}</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        {/* RIGHT STATS & QUICK ACTIONS RAIL (4 cols) */}
        <aside
          aria-label="Statistik materi dan aksi cepat"
          className="min-w-0 space-y-6 lg:col-span-4"
        >
          <Panel id="dashboard-stats" title="Ringkasan Kesiapan">
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="relative flex size-26 items-center justify-center">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 108 108"
                    className="size-26 -rotate-90"
                  >
                    <circle
                      cx="54"
                      cy="54"
                      r={ringRadius}
                      fill="none"
                      stroke="var(--muted)"
                      strokeWidth="7"
                    />
                    <circle
                      cx="54"
                      cy="54"
                      r={ringRadius}
                      fill="none"
                      stroke="var(--brand-teal)"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringOffset}
                    />
                  </svg>
                  <span
                    aria-hidden="true"
                    className="absolute flex size-18 items-center justify-center rounded-full bg-tint-blue font-heading text-lg font-extrabold text-brand-ink"
                  >
                    {initialsOf(displayName)}
                  </span>
                  <span className="absolute -top-0.5 right-0 rounded-full bg-brand-teal px-2 py-0.5 font-ui text-xs font-bold text-white shadow-xs">
                    {verifiedPct}%
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="font-heading text-base font-bold text-foreground">
                    {verifiedCount} dari {totalDocs} materi siap dipakai
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {inReviewCount} dokumen menunggu atau sedang ditinjau volunteer.
                  </p>
                </div>
              </div>

              <StudyActivityPanel data={chartData} />
            </div>
          </Panel>

          <Panel id="dashboard-actions" title="Aksi Cepat">
            <div className="space-y-2.5 font-ui">
              <Link
                href="/upload"
                className="flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-brand-mint px-4 py-3 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-mint/80"
              >
                <span className="inline-flex items-center gap-2.5">
                  <FileUp className="size-4 text-brand-teal" aria-hidden="true" />
                  <span>Unggah Materi PDF Baru</span>
                </span>
                <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
              </Link>

              {canReview ? (
                <Link
                  href="/review"
                  className="flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-tint-peach px-4 py-3 text-sm font-semibold text-brand-ink transition-colors hover:bg-tint-peach/80"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <ClipboardCheck className="size-4" aria-hidden="true" />
                    <span>Buka Antrean Review Volunteer</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
                </Link>
              ) : null}

              <Link
                href="/settings"
                className="flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-tint-gold px-4 py-3 text-sm font-semibold text-brand-ink transition-colors hover:bg-tint-gold/80"
              >
                <span className="inline-flex items-center gap-2.5">
                  <SlidersHorizontal className="size-4" aria-hidden="true" />
                  <span>Atur Font &amp; Kecepatan Suara</span>
                </span>
                <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <WorkspaceShell>
      <Suspense
        fallback={
          <p className="font-ui text-sm text-muted-foreground">
            Memuat dashboard…
          </p>
        }
      >
        <DashboardBody />
      </Suspense>
    </WorkspaceShell>
  );
}
