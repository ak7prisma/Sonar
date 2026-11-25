import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Eye,
  FileCheck,
  FileText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewStatusChip } from "@/components/app/ReviewStatusChip";
import { formatDate, formatPageCount, splitDocumentTitle } from "@/lib/format";
import type { CourseRow, DocumentRow } from "@/lib/data/workspace";

interface VolunteerDashboardViewProps {
  displayName: string;
  documents: DocumentRow[];
  courses: CourseRow[];
}

export function VolunteerDashboardView({
  displayName,
  documents,
  courses,
}: VolunteerDashboardViewProps) {
  const courseLookup = new Map<string, CourseRow>();
  for (const c of courses) {
    courseLookup.set(c.id.toLowerCase(), c);
    courseLookup.set(c.code.toLowerCase().trim().replace(/\s+/g, "-"), c);
  }

  const resolveCourse = (courseId: string) =>
    courseLookup.get(courseId.toLowerCase()) ??
    courseLookup.get(courseId.toLowerCase().trim().replace(/\s+/g, "-"));

  const pendingDocs = documents.filter((d) => d.review_status !== "verified");
  const verifiedDocs = documents.filter((d) => d.review_status === "verified");
  const inReviewDocs = documents.filter((d) => d.review_status === "in_review");
  const needsRevisionDocs = documents.filter((d) => d.review_status === "needs_revision");

  const unreviewedCount = documents.filter((d) => d.review_status === "unreviewed").length;

  return (
    <div className="mx-auto max-w-6xl space-y-8 font-sans">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-mint/60 px-3 py-1 text-xs font-semibold text-brand-ink mb-2">
            <ClipboardCheck className="size-3.5" aria-hidden="true" />
            <span>Workspace Volunteer & Kurator Konten</span>
          </div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Halo, {displayName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Fokus Anda adalah memverifikasi keakuratan teks OCR, deskripsi visual gambar, dan formula MathML agar mahasiswa tunanetra mendapatkan materi aksesibel berkualitas tinggi.
          </p>
        </div>

        <Button asChild className="rounded-full px-5 font-ui font-semibold shadow-xs">
          <Link href="/review" className="flex items-center gap-2">
            <ClipboardCheck className="size-4" aria-hidden="true" />
            <span>Buka Antrean Review</span>
          </Link>
        </Button>
      </div>

      {/* METRIC CHIPS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 font-ui">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Menunggu Review</span>
            <Clock className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground font-mono tabular-nums">
            {pendingDocs.length}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {unreviewedCount} berkas belum dibuka
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Sedang Ditinjau</span>
            <Eye className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground font-mono tabular-nums">
            {inReviewDocs.length}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Sedang dalam proses koreksi</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Perlu Perbaikan</span>
            <AlertTriangle className="size-4 text-destructive" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground font-mono tabular-nums">
            {needsRevisionDocs.length}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Formula/teks butuh revisi</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Terverifikasi</span>
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground font-mono tabular-nums">
            {verifiedDocs.length}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Siap dipelajari mahasiswa</p>
        </div>
      </div>

      {/* VOLUNTEER RULES & GUIDELINES CARD */}
      <section
        aria-labelledby="volunteer-rules-heading"
        className="rounded-3xl border border-primary/20 bg-surface-subtle p-6 sm:p-7 shadow-xs"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <h2 id="volunteer-rules-heading" className="font-heading text-lg font-bold text-foreground">
            Pedoman & Tanggung Jawab Volunteer
          </h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Sebagai volunteer kurator materi, fokus utama Anda adalah kualitas konten semantik dokumen. Harap perhatikan 4 aspek berikut saat melakukan peninjauan:
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 font-ui">
          <div className="rounded-2xl border border-border bg-card p-4 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <FileCheck className="size-3.5 text-primary" aria-hidden="true" />
              <span>1. Teks & Tabel Semantik</span>
            </div>
            <p className="text-muted-foreground">
              Pastikan ejaan teks OCR akurat, heading tersusun runtut (H1–H3), dan sel baris/kolom tabel terbaca berurutan.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Eye className="size-3.5 text-primary" aria-hidden="true" />
              <span>2. Deskripsi Visual Figur</span>
            </div>
            <p className="text-muted-foreground">
              Periksa deskripsi gambar hasil vision AI agar mahasiswa tunanetra memahami informasi visual grafik atau diagram.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
              <span>3. Rumus MathML & LaTeX</span>
            </div>
            <p className="text-muted-foreground">
              Verifikasi formula matematika (integral, matriks, pecahan) dan pastikan narasi lisan rumus terbaca alami.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <CheckCircle2 className="size-3.5 text-emerald-600" aria-hidden="true" />
              <span>4. Update Status Verifikasi</span>
            </div>
            <p className="text-muted-foreground">
              Ubah status dokumen ke &quot;Verified&quot; jika sudah sempurna, agar langsung dapat diakses mahasiswa se-kelas.
            </p>
          </div>
        </div>
      </section>

      {/* PRIORITY REVIEW QUEUE */}
      <section aria-labelledby="priority-queue-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="priority-queue-heading" className="font-heading text-lg font-bold text-foreground sm:text-xl">
              Dokumen Prioritas Menunggu Review
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Dokumen yang baru diunggah mahasiswa dan membutuhkan koreksi sebelum dapat dibaca bebas.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-full text-xs font-semibold">
            <Link href="/review" className="flex items-center gap-1.5">
              <span>Lihat Semua Antrean ({pendingDocs.length})</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {pendingDocs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto size-8 text-emerald-600" />
            <h3 className="mt-2 font-heading text-base font-semibold text-foreground">
              Semua antrean review telah selesai!
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Tidak ada dokumen baru yang membutuhkan verifikasi saat ini. Terima kasih atas kontribusi Anda!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pendingDocs.slice(0, 6).map((doc) => {
              const course = resolveCourse(doc.course_id);
              const courseCode = course?.code ?? doc.course_id.toUpperCase();
              const parsed = splitDocumentTitle(doc.title);

              return (
                <div
                  key={doc.id}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-card hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-brand-mint px-2 py-0.5 text-xs font-semibold text-brand-ink font-ui">
                        {courseCode}
                      </span>
                      <ReviewStatusChip status={doc.review_status} />
                    </div>

                    <div>
                      {parsed.prefix && (
                        <p className="text-xs font-medium text-muted-foreground font-ui">
                          {parsed.prefix}
                        </p>
                      )}
                      <h3 className="font-heading text-sm font-bold text-foreground line-clamp-2">
                        {parsed.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-ui">
                      <span>{formatPageCount(doc.page_count)}</span>
                      <span>·</span>
                      <span>{formatDate(doc.created_at)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60">
                    <Button asChild size="sm" className="w-full rounded-full text-xs font-ui font-semibold">
                      <Link href={`/review/${doc.id}`} className="flex items-center justify-center gap-1.5">
                        <FileText className="size-3.5" aria-hidden="true" />
                        <span>Mulai Tinjau Dokumen</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
