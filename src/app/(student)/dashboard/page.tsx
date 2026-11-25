import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  ChevronRight,
  ClipboardCheck,
  FileUp,
  Headphones,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { DashboardSkeleton } from "@/components/skeletons/PageSkeletons";
import { ReviewStatusChip } from "@/components/app/ReviewStatusChip";
import {
  DashboardReadyList,
  type ReadyCourseFilter,
  type ReadyMaterialItem,
} from "@/components/dashboard/DashboardReadyList";
import { Button } from "@/components/ui/button";
import { VolunteerDashboardView } from "@/components/dashboard/VolunteerDashboardView";
import { loadWorkspaceSnapshot, type CourseRow } from "@/lib/data/workspace";
import { getCourseToneStyles } from "@/lib/course-theme";
import { formatPageCount, splitDocumentTitle } from "@/lib/format";
import { APP_IMAGES } from "@/lib/images";
import { cn } from "cn";

export const metadata: Metadata = {
  title: "Dashboard",
};

function normalizeCourseSlug(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, "-");
}

function getCourseArtwork(course: CourseRow | undefined) {
  if (!course) return APP_IMAGES.featureAudio;
  const code = course.code.toLowerCase();
  const disc = course.discipline.toLowerCase();
  if (course.id === "math-105" || code.includes("math") || disc.includes("matematika")) {
    return APP_IMAGES.courseMath;
  }
  if (course.id === "stat-210" || code.includes("stat") || disc.includes("statistika")) {
    return APP_IMAGES.courseStat;
  }
  return APP_IMAGES.courseCS;
}

async function DashboardBody() {
  const snapshot = await loadWorkspaceSnapshot();

  // Map courses by both database UUID and normalized code slug (e.g. "cs-201")
  // so document relations stay consistent across seeded DB and fallback records.
  const courseLookup = new Map<string, CourseRow>();
  for (const course of snapshot.courses) {
    courseLookup.set(course.id.toLowerCase(), course);
    courseLookup.set(normalizeCourseSlug(course.code), course);
  }

  const resolveCourse = (courseId: string) =>
    courseLookup.get(courseId.toLowerCase()) ??
    courseLookup.get(normalizeCourseSlug(courseId));

  const verifiedDocs = snapshot.documents.filter(
    (doc) => doc.review_status === "verified"
  );
  const pendingDocs = snapshot.documents.filter(
    (doc) => doc.review_status !== "verified"
  );

  const resumeDoc = verifiedDocs[0] ?? snapshot.documents[0] ?? null;
  const resumeCourse = resumeDoc ? resolveCourse(resumeDoc.course_id) : undefined;
  const resumeParsed = resumeDoc
    ? splitDocumentTitle(resumeDoc.title)
    : { prefix: null, title: "" };
  const spotlightImage = getCourseArtwork(resumeCourse);

  const displayName =
    snapshot.user?.fullName?.trim() ||
    snapshot.user?.email?.split("@")[0] ||
    "Pengguna SONAR";
  const greetingName = displayName.split(",")[0].trim() || displayName;

  const userRoles = snapshot.user?.roles ?? ["student"];
  const isAdmin = userRoles.includes("admin");
  const isVolunteer = !isAdmin && (userRoles.includes("volunteer") || userRoles.includes("reviewer"));

  // If user is a volunteer, show the dedicated volunteer curation dashboard
  if (isVolunteer) {
    return (
      <VolunteerDashboardView
        displayName={greetingName}
        documents={snapshot.documents}
        courses={snapshot.courses}
      />
    );
  }

  const canReview =
    userRoles.includes("admin") ||
    userRoles.includes("reviewer") ||
    userRoles.includes("volunteer");

  const readyItems: ReadyMaterialItem[] = verifiedDocs.map((doc) => {
    const course = resolveCourse(doc.course_id);
    const courseKey = course ? course.id : normalizeCourseSlug(doc.course_id);
    const courseCode = course?.code ?? doc.course_id.toUpperCase();
    const tone = getCourseToneStyles(course ?? { code: courseCode });
    const parsed = splitDocumentTitle(doc.title);

    return {
      id: doc.id,
      title: parsed.title,
      prefix: parsed.prefix,
      courseKey,
      courseCode,
      courseSurface: tone.surface,
      pageLabel: formatPageCount(doc.page_count),
      isSpotlight: resumeDoc?.id === doc.id,
    };
  });

  const filterMap = new Map<string, ReadyCourseFilter>();
  for (const item of readyItems) {
    const existing = filterMap.get(item.courseKey);
    if (existing) {
      existing.count += 1;
    } else {
      filterMap.set(item.courseKey, {
        key: item.courseKey,
        code: item.courseCode,
        count: 1,
      });
    }
  }
  const readyCourseFilters = Array.from(filterMap.values());

  return (
    <div className="w-full max-w-7xl space-y-8 font-sans">
      {/* GREETING HEADER — Rata kiri, clean & clear */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Halo, {greetingName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {verifiedDocs.length > 0
              ? `${verifiedDocs.length} materi perkuliahan sudah terverifikasi dan siap Anda pelajari.`
              : "Pilih mata kuliah atau unggah dokumen PDF untuk mulai belajar."}
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          className="hidden min-h-10 w-fit rounded-full border-border bg-card px-4 font-ui text-sm font-semibold text-foreground shadow-2xs hover:bg-brand-mint hover:text-brand-ink dark:hover:bg-muted dark:hover:text-foreground sm:inline-flex"
        >
          <Link href="/upload">
            <FileUp className="size-4 text-primary" aria-hidden="true" />
            <span>Unggah Materi</span>
          </Link>
        </Button>
      </div>

      {/* MATA KULIAH UTAMA — Kiri atas di urutan layout */}
      <section aria-labelledby="my-courses-heading" className="space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2
              id="my-courses-heading"
              className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl"
            >
              Mata Kuliah Utama
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Daftar kelas aktif dan materi terstruktur semester ini.
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex min-h-9 items-center rounded-md font-ui text-xs font-semibold text-secondary-foreground hover:underline"
          >
            Lihat semua mata kuliah &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {snapshot.courses.slice(0, 3).map((course) => {
            const courseSlug = normalizeCourseSlug(course.code);
            const courseDocs = snapshot.documents.filter(
              (doc) =>
                doc.course_id === course.id ||
                normalizeCourseSlug(doc.course_id) === courseSlug
            );
            const readyCount = courseDocs.filter(
              (doc) => doc.review_status === "verified"
            ).length;
            const tone = getCourseToneStyles(course);

            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 font-ui text-xs">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2.5 py-1 font-bold text-brand-ink",
                        tone.surface
                      )}
                    >
                      {course.code}
                    </span>
                    <span className="rounded-full bg-surface-subtle px-2.5 py-0.5 font-medium text-muted-foreground tabular-nums">
                      {readyCount} materi siap
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                      {course.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {course.discipline}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 font-ui text-xs font-semibold text-primary">
                  <span>Buka materi kelas</span>
                  <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SINGLE FOCAL POINT — Continue-Reading Editorial Spotlight */}
      {resumeDoc ? (
        <section
          aria-labelledby="spotlight-heading"
          className="overflow-hidden rounded-3xl bg-brand-teal text-white shadow-card"
        >
          <div className="grid items-stretch md:grid-cols-12">
            <div className="flex flex-col justify-between gap-6 p-6 sm:p-8 md:col-span-7">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 font-ui text-xs font-semibold">
                  <span className="inline-flex items-center rounded-full bg-brand-gold px-3 py-1 font-bold text-brand-ink">
                    {resumeCourse?.code ?? resumeDoc.course_id.toUpperCase()}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-brand-mint px-3 py-1 text-brand-ink">
                    {resumeDoc.review_status === "verified"
                      ? "Lanjutkan belajar"
                      : "Materi terbaru"}
                  </span>
                </div>

                <h2
                  id="spotlight-heading"
                  className="font-heading text-xl font-extrabold leading-snug tracking-tight text-white sm:text-2xl lg:text-[1.65rem]"
                >
                  {resumeParsed.title}
                </h2>

                <p className="max-w-xl text-sm leading-relaxed text-white sm:text-base">
                  {resumeParsed.prefix ? `${resumeParsed.prefix}, ` : ""}
                  {formatPageCount(resumeDoc.page_count)} dengan navigasi per bab, narasi suara, dan rumus MathML.
                </p>
              </div>

              <div className="font-ui">
                <Link
                  href={`/reader/${resumeDoc.id}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-ink shadow-xs transition-colors hover:bg-brand-mint"
                >
                  <Headphones className="size-4 text-brand-teal" aria-hidden="true" />
                  <span>Mulai Membaca</span>
                </Link>
              </div>
            </div>

            <div className="p-3 pt-0 sm:p-4 sm:pt-0 md:col-span-5 md:py-4 md:pr-4 md:pl-0">
              <div className="relative aspect-16/9 h-full min-h-48 w-full overflow-hidden rounded-2xl bg-brand-ink/25 md:aspect-auto">
                <Image
                  src={spotlightImage.src}
                  alt={spotlightImage.alt}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* TWO-ZONE WORKSPACE: Left = Ready to Read, Right = Review Pipeline */}
      <div className="grid items-start gap-8 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <DashboardReadyList items={readyItems} courses={readyCourseFilters} />
        </div>

        <aside
          aria-label="Status peninjauan dokumen"
          className="min-w-0 space-y-8 lg:col-span-4"
        >
          {/* IN-REVIEW PIPELINE — separated from main reading list to eliminate noise */}
          <section aria-labelledby="pending-review-heading" className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2
                id="pending-review-heading"
                className="font-heading text-base font-bold tracking-tight text-foreground"
              >
                Dalam Peninjauan
              </h2>
              {pendingDocs.length > 0 ? (
                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-tint-gold px-2 py-0.5 font-ui text-xs font-bold text-brand-ink tabular-nums">
                  {pendingDocs.length}
                </span>
              ) : null}
            </div>

            <div className="rounded-2xl border border-border/90 bg-surface-subtle/55 p-4 dark:bg-card sm:p-5">
              {pendingDocs.length === 0 ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Seluruh materi yang diunggah sudah selesai diverifikasi volunteer.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Materi berikut sedang diperiksa volunteer sebelum masuk daftar baca utama.
                  </p>
                  <ul className="space-y-2.5">
                    {pendingDocs.slice(0, 4).map((doc) => {
                      const course = resolveCourse(doc.course_id);
                      const parsed = splitDocumentTitle(doc.title);
                      const targetHref = canReview
                        ? `/review/${doc.id}`
                        : `/reader/${doc.id}`;

                      return (
                        <li key={doc.id}>
                          <Link
                            href={targetHref}
                            className="group block space-y-1.5 rounded-xl border border-border/80 bg-card p-3.5 transition-colors hover:border-primary/50"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-ui text-xs font-semibold text-muted-foreground">
                                {course?.code ?? doc.course_id.toUpperCase()}
                              </span>
                              <ReviewStatusChip status={doc.review_status} />
                            </div>
                            <p className="font-heading text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                              {parsed.title}
                            </p>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>

                  {canReview ? (
                    <div className="border-t border-border/70 pt-3 font-ui">
                      <Link
                        href="/review"
                        className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-secondary-foreground hover:underline"
                      >
                        <ClipboardCheck className="size-3.5" aria-hidden="true" />
                        <span>Buka ruang kerja review</span>
                      </Link>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <WorkspaceShell>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardBody />
      </Suspense>
    </WorkspaceShell>
  );
}
