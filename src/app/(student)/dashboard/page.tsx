import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  BookOpen,
  FileUp,
  ArrowRight,
  CheckCircle2,
  Play,
  Sparkles,
  Users,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { StudyActivityPanel } from "@/components/dashboard/StudyActivityPanel";
import { loadWorkspaceSnapshot } from "@/lib/data/workspace";
import { SHARED_REVIEWED_MATERIALS } from "@/lib/data/course-materials";

export const metadata: Metadata = {
  title: "Dashboard Mahasiswa",
};

async function DashboardBody() {
  const snapshot = await loadWorkspaceSnapshot();

  const verifiedCount = snapshot.documents.filter(
    (d) => d.review_status === "verified"
  ).length;
  const inReviewCount = snapshot.documents.filter(
    (d) => d.review_status === "in_review" || d.review_status === "needs_revision"
  ).length;

  const chartData = snapshot.courses.slice(0, 3).map((course) => {
    const docs = snapshot.documents.filter((d) => d.course_id === course.id);
    return {
      label: course.code,
      documents: docs.length,
      verifiedBlocks: docs.filter((d) => d.review_status === "verified").length,
    };
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-b border-border pb-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-primary font-ui">
            Portal Mahasiswa Tunanetra &amp; Asistif
          </span>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Selamat Datang, {snapshot.user?.fullName ?? "Ahmad Fauzi"}
          </h1>
          <p className="text-sm text-muted-foreground font-sans">
            Akses materi perkuliahan terstruktur, lanjutkan membaca dengan audio reader, dan gunakan materi yang telah direview volunteer.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 font-ui">
          <Button asChild size="default" className="font-semibold shadow-xs">
            <Link href="/upload">
              <FileUp className="size-4 mr-1.5" aria-hidden="true" />
              <span>Unggah PDF Kuliah</span>
            </Link>
          </Button>
          <Button variant="outline" asChild size="default" className="font-semibold border-border">
            <Link href="/reader">
              <BookOpen className="size-4 mr-1.5" aria-hidden="true" />
              <span>Buka Reader</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Resume Reading Card (Hero Action) */}
      <section
        aria-label="Lanjutkan Membaca Terakhir"
        className="rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-secondary/80 via-background to-secondary/30 p-6 sm:p-8 shadow-xs"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground font-ui">
                Sedang Dibaca
              </span>
              <span className="text-xs text-muted-foreground font-ui">CS 201 &bull; Gasal 2026/2027</span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
              Modul 04 — Binary Search Trees &amp; AVL Balancing
            </h2>
            <p className="text-sm text-muted-foreground font-sans">
              Terakhir dibaca: Bab 1.1 Definisi Faktor Keseimbangan &bull; Halaman 1 dari 24 &bull; Formula MathML &amp; Audio Aktif
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 font-ui">
            <Button size="lg" asChild className="h-12 px-6 font-semibold shadow-md">
              <Link href="/reader/doc-cs-01">
                <Play className="size-4 mr-2 fill-current" aria-hidden="true" />
                <span>Lanjutkan Membaca</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section aria-label="Ringkasan Materi Anda" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 font-ui">
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mata Kuliah Diambil</p>
          <p className="mt-2 font-heading text-3xl font-extrabold tabular-nums text-foreground">
            {snapshot.courses.length} <span className="text-xs font-normal text-muted-foreground">Kuliah</span>
          </p>
          <p className="mt-1 text-[11px] text-primary">CS 201, MATH 105, STAT 210</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Materi Terverifikasi (Reusable)</p>
          <p className="mt-2 font-heading text-3xl font-extrabold tabular-nums text-success">
            {verifiedCount} <span className="text-xs font-normal text-muted-foreground">Dokumen</span>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Disetujui oleh volunteer</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menunggu Review</p>
          <p className="mt-2 font-heading text-3xl font-extrabold tabular-nums text-amber-600 dark:text-amber-400">
            {inReviewCount} <span className="text-xs font-normal text-muted-foreground">Dokumen</span>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Dalam antrean verifikasi</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Halaman Terstruktur</p>
          <p className="mt-2 font-heading text-3xl font-extrabold tabular-nums text-primary">
            130 <span className="text-xs font-normal text-muted-foreground">Halaman</span>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">100% Screen reader ready</p>
        </div>
      </section>

      {/* Main Grid: Shared Reviewed Materials & Activity Chart */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Shared Reviewed Materials Ready to Reuse */}
        <section
          aria-labelledby="shared-materials-heading"
          className="space-y-4 lg:col-span-7"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2
                id="shared-materials-heading"
                className="font-heading text-xl font-bold tracking-tight text-foreground"
              >
                Materi Terverifikasi yang Siap Digunakan Kembali
              </h2>
              <p className="text-xs text-muted-foreground font-ui">
                Dokumen telah direview volunteer dan dibagikan untuk mahasiswa di mata kuliah Anda.
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="font-ui text-xs text-primary">
              <Link href="/courses">Lihat Semua &rarr;</Link>
            </Button>
          </div>

          <div className="space-y-3">
            {SHARED_REVIEWED_MATERIALS.slice(0, 4).map((mat) => (
              <article
                key={mat.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-xs"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary font-ui">
                      {mat.courseId.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success font-ui">
                      <CheckCircle2 className="size-3" aria-hidden="true" />
                      Reviewed by {mat.reviewerName.split(",")[0]}
                    </span>
                  </div>

                  <Link
                    href={`/reader/${mat.id}`}
                    className="block font-heading font-bold text-base text-foreground hover:text-primary hover:underline truncate"
                  >
                    {mat.title}
                  </Link>

                  <p className="text-xs text-muted-foreground font-ui">
                    Sumber: <code className="font-mono text-[11px] text-foreground">{mat.sourceFilename}</code> ({mat.sourceVersion}) &bull; {mat.pageCount} hlm &bull; {mat.equationsCount} rumus
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-ui">
                  <Button size="sm" asChild className="h-9 px-4 font-semibold">
                    <Link href={`/reader/${mat.id}`}>
                      <span>Buka</span>
                      <ArrowRight className="size-3.5 ml-1" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Right Column: Activity Panel */}
        <div className="lg:col-span-5 space-y-6">
          <StudyActivityPanel data={chartData} />

          {/* Quick Shortcuts */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 font-ui">
            <h3 className="font-heading font-bold text-sm text-foreground">Pintasan Cepat Mahasiswa</h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <Button variant="outline" asChild className="justify-start h-10 border-border">
                <Link href="/upload">
                  <FileUp className="size-4 mr-2 text-primary" />
                  Unggah PDF Baru
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start h-10 border-border">
                <Link href="/settings">
                  <Sparkles className="size-4 mr-2 text-primary" />
                  Atur Font &amp; Suara
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start h-10 border-border">
                <Link href="/courses">
                  <Users className="size-4 mr-2 text-primary" />
                  Katalog Kelas
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start h-10 border-border">
                <Link href="/help">
                  <BookOpen className="size-4 mr-2 text-primary" />
                  Help Center &amp; FAQ
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <WorkspaceShell pageSectionLabel="Dashboard Mahasiswa">
      <Suspense fallback={<p className="text-sm text-muted-foreground font-ui">Memuat dashboard mahasiswa...</p>}>
        <DashboardBody />
      </Suspense>
    </WorkspaceShell>
  );
}
