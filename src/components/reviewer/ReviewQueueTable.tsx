"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  FileText,
  Search,
} from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/app/Panel";
import { ReviewStatusChip } from "@/components/app/ReviewStatusChip";
import { EmptyState } from "@/components/app/EmptyState";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";
import { getCourseToneStyles } from "@/lib/course-theme";
import {
  formatDate,
  formatPageCount,
  formatVersion,
} from "@/lib/format";
import type { CourseRow, DocumentRow } from "@/lib/data/workspace";
import type { ReviewStatus } from "@/types/database";

type FilterValue = "all" | ReviewStatus;

const STATUS_PRIORITY: Record<ReviewStatus, number> = {
  unreviewed: 0,
  in_review: 1,
  needs_revision: 2,
  verified: 3,
};

export function ReviewQueueTable({
  documents,
  courses = [],
}: {
  documents: DocumentRow[];
  courses?: CourseRow[];
}) {
  const { announce } = useLiveAnnouncer();
  const [filterTab, setFilterTab] = useState<FilterValue>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const courseById = useMemo(
    () => new Map(courses.map((c) => [c.id, c])),
    [courses]
  );

  const counts = useMemo(
    () => ({
      all: documents.length,
      unreviewed: documents.filter((d) => d.review_status === "unreviewed").length,
      in_review: documents.filter((d) => d.review_status === "in_review").length,
      needs_revision: documents.filter((d) => d.review_status === "needs_revision")
        .length,
      verified: documents.filter((d) => d.review_status === "verified").length,
    }),
    [documents]
  );

  const filteredDocs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return documents
      .filter((doc) => {
        if (filterTab !== "all" && doc.review_status !== filterTab) return false;
        if (!q) return true;
        const course = courseById.get(doc.course_id);
        return (
          doc.title.toLowerCase().includes(q) ||
          doc.original_filename.toLowerCase().includes(q) ||
          doc.course_id.toLowerCase().includes(q) ||
          (course?.code.toLowerCase().includes(q) ?? false)
        );
      })
      .sort((a, b) => {
        const diff =
          STATUS_PRIORITY[a.review_status] - STATUS_PRIORITY[b.review_status];
        if (diff !== 0) return diff;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }, [courseById, documents, filterTab, searchQuery]);

  const summaryCards = [
    {
      label: "Menunggu review",
      count: counts.unreviewed,
      icon: Clock,
      surface: "bg-tint-gold text-brand-ink",
    },
    {
      label: "Sedang ditinjau",
      count: counts.in_review,
      icon: Eye,
      surface: "bg-tint-blue text-brand-ink",
    },
    {
      label: "Perlu perbaikan",
      count: counts.needs_revision,
      icon: AlertTriangle,
      surface: "bg-tint-peach text-brand-ink",
    },
    {
      label: "Terverifikasi",
      count: counts.verified,
      icon: CheckCircle2,
      surface: "bg-brand-mint text-brand-ink",
    },
  ];

  const filterButtons: Array<{ value: FilterValue; label: string; count: number }> =
    [
      { value: "all", label: "Semua", count: counts.all },
      { value: "unreviewed", label: "Menunggu", count: counts.unreviewed },
      { value: "in_review", label: "Ditinjau", count: counts.in_review },
      { value: "needs_revision", label: "Perlu perbaikan", count: counts.needs_revision },
      { value: "verified", label: "Terverifikasi", count: counts.verified },
    ];

  const handleFilterChange = (next: FilterValue, nextCount: number) => {
    setFilterTab(next);
    announce(`${nextCount} dokumen ditampilkan.`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 4 Summary Tiles Computed From Real Documents */}
      <section aria-label="Ringkasan antrean review">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 font-ui">
          {summaryCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card"
              >
                <span
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-2xl",
                    item.surface
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-heading text-2xl font-extrabold tabular-nums text-foreground">
                    {item.count}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Panel id="review-queue-panel">
        <div className="space-y-5">
          {/* Toolbar */}
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center font-ui">
            <div
              role="group"
              aria-label="Filter status dokumen"
              className="flex flex-wrap gap-1.5"
            >
              {filterButtons.map((btn) => {
                const pressed = filterTab === btn.value;
                return (
                  <button
                    key={btn.value}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => handleFilterChange(btn.value, btn.count)}
                    className={cn(
                      "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors",
                      pressed
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-brand-mint hover:text-brand-ink"
                    )}
                  >
                    <span>{btn.label}</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[11px] tabular-nums",
                        pressed ? "bg-white/20" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {btn.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="w-full lg:w-72">
              <Label htmlFor="review-queue-search" className="sr-only">
                Cari judul dokumen, nama berkas, atau kode mata kuliah
              </Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="review-queue-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul, berkas, atau kuliah…"
                  className="h-10 rounded-full pl-9 text-sm font-sans"
                />
              </div>
            </div>
          </div>

          {filteredDocs.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Tidak ada dokumen di kategori ini"
              description="Ubah filter status atau bersihkan kata kunci pencarian untuk melihat antrean dokumen."
            />
          ) : (
            <>
              {/* Desktop Semantic Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left text-sm">
                  <caption className="sr-only">
                    Daftar antrean dokumen untuk ditinjau oleh volunteer
                  </caption>
                  <thead>
                    <tr className="border-b border-border text-xs font-semibold text-muted-foreground font-ui">
                      <th scope="col" className="py-3 pr-4">
                        Dokumen
                      </th>
                      <th scope="col" className="py-3 pr-4">
                        Mata Kuliah
                      </th>
                      <th scope="col" className="py-3 pr-4">
                        Halaman
                      </th>
                      <th scope="col" className="py-3 pr-4">
                        Versi
                      </th>
                      <th scope="col" className="py-3 pr-4">
                        Diperbarui
                      </th>
                      <th scope="col" className="py-3 pr-4">
                        Status
                      </th>
                      <th scope="col" className="py-3 text-right">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {filteredDocs.map((doc) => {
                      const course = courseById.get(doc.course_id);
                      const tone = getCourseToneStyles(
                        course ?? { code: doc.course_id }
                      );

                      return (
                        <tr key={doc.id} className="align-middle">
                          <td className="max-w-xs py-3.5 pr-4">
                            <Link
                              href={`/review/${doc.id}`}
                              className="block font-heading text-sm font-bold text-foreground hover:text-primary hover:underline"
                            >
                              {doc.title}
                            </Link>
                            <p className="truncate font-mono text-xs text-muted-foreground">
                              {doc.original_filename}
                            </p>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold font-ui whitespace-nowrap",
                                tone.surface,
                                "text-brand-ink"
                              )}
                            >
                              {course?.code ?? doc.course_id.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4 text-sm text-muted-foreground tabular-nums whitespace-nowrap">
                            {formatPageCount(doc.page_count)}
                          </td>
                          <td className="py-3.5 pr-4 font-ui text-xs font-semibold text-foreground whitespace-nowrap">
                            {formatVersion(doc.current_version_id)}
                          </td>
                          <td className="py-3.5 pr-4 text-sm text-muted-foreground whitespace-nowrap">
                            {formatDate(doc.updated_at)}
                          </td>
                          <td className="py-3.5 pr-4">
                            <ReviewStatusChip status={doc.review_status} />
                          </td>
                          <td className="py-3.5 text-right">
                            <div className="inline-flex items-center gap-2 font-ui">
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                                className="min-h-9 rounded-full px-3 text-xs"
                              >
                                <Link href={`/reader/${doc.id}`}>
                                  <FileText className="size-3.5" aria-hidden="true" />
                                  <span>Pratinjau</span>
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                asChild
                                className="min-h-9 rounded-full px-3.5 text-xs font-semibold"
                              >
                                <Link href={`/review/${doc.id}`}>
                                  <span>Tinjau</span>
                                  <ArrowRight className="size-3.5" aria-hidden="true" />
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Cards */}
              <div className="space-y-3 md:hidden">
                {filteredDocs.map((doc) => {
                  const course = courseById.get(doc.course_id);
                  const tone = getCourseToneStyles(
                    course ?? { code: doc.course_id }
                  );

                  return (
                    <article
                      key={doc.id}
                      className="space-y-3 rounded-2xl border border-border bg-surface-subtle/50 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-semibold font-ui",
                            tone.surface,
                            "text-brand-ink"
                          )}
                        >
                          {course?.code ?? doc.course_id.toUpperCase()}
                        </span>
                        <ReviewStatusChip status={doc.review_status} />
                      </div>

                      <div>
                        <h2 className="font-heading text-base font-bold text-foreground">
                          {doc.title}
                        </h2>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {doc.original_filename} ·{" "}
                          {formatVersion(doc.current_version_id)}
                        </p>
                      </div>

                      <p className="text-xs text-muted-foreground font-ui">
                        {formatPageCount(doc.page_count)} · Diperbarui{" "}
                        {formatDate(doc.updated_at)}
                      </p>

                      <div className="flex gap-2 pt-1 font-ui">
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="min-h-10 flex-1 rounded-full text-xs"
                        >
                          <Link href={`/reader/${doc.id}`}>Pratinjau</Link>
                        </Button>
                        <Button
                          size="sm"
                          asChild
                          className="min-h-10 flex-1 rounded-full text-xs font-semibold"
                        >
                          <Link href={`/review/${doc.id}`}>Tinjau</Link>
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </Panel>
    </div>
  );
}
