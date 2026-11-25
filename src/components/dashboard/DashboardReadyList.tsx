"use client";

import { useState } from "react";
import Link from "next/link";
import { FileUp, Headphones } from "lucide-react";
import { cn } from "cn";

export interface ReadyMaterialItem {
  id: string;
  title: string;
  prefix: string | null;
  courseKey: string;
  courseCode: string;
  courseSurface: string;
  pageLabel: string;
  isSpotlight: boolean;
}

export interface ReadyCourseFilter {
  key: string;
  code: string;
  count: number;
}

export function DashboardReadyList({
  items,
  courses,
}: {
  items: ReadyMaterialItem[];
  courses: ReadyCourseFilter[];
}) {
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  const filteredItems =
    selectedCourse === "all"
      ? [
          ...items.filter((item) => !item.isSpotlight),
          ...items.filter((item) => item.isSpotlight),
        ]
      : items.filter((item) => item.courseKey === selectedCourse);

  return (
    <section aria-labelledby="ready-materials-heading" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2
          id="ready-materials-heading"
          className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl"
        >
          Materi Siap Dibaca
        </h2>

        {courses.length > 1 ? (
          <div
            role="group"
            aria-label="Filter materi berdasarkan mata kuliah"
            className="flex flex-wrap items-center gap-1.5 font-ui"
          >
            <button
              type="button"
              aria-pressed={selectedCourse === "all"}
              onClick={() => setSelectedCourse("all")}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-colors",
                selectedCourse === "all"
                  ? "bg-brand-ink text-white dark:bg-primary dark:text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:bg-brand-mint hover:text-brand-ink dark:hover:bg-muted dark:hover:text-foreground"
              )}
            >
              <span>Semua</span>
              <span className="tabular-nums opacity-80">{items.length}</span>
            </button>

            {courses.map((course) => {
              const active = selectedCourse === course.key;
              return (
                <button
                  key={course.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedCourse(course.key)}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-colors",
                    active
                      ? "bg-brand-ink text-white dark:bg-primary dark:text-primary-foreground"
                      : "border border-border bg-card text-foreground hover:bg-brand-mint hover:text-brand-ink dark:hover:bg-muted dark:hover:text-foreground"
                  )}
                >
                  <span>{course.code}</span>
                  <span className="tabular-nums opacity-80">{course.count}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center shadow-card">
          <p className="font-heading text-base font-bold text-foreground">
            Belum ada materi siap baca pada kategori ini
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Unggah dokumen PDF kuliah baru atau pilih mata kuliah lain untuk membuka materi yang sudah diverifikasi.
          </p>
          <div className="mt-4 flex justify-center gap-2 font-ui">
            {selectedCourse !== "all" ? (
              <button
                type="button"
                onClick={() => setSelectedCourse("all")}
                className="inline-flex min-h-10 items-center rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground hover:bg-brand-mint hover:text-brand-ink"
              >
                Tampilkan semua materi
              </button>
            ) : null}
            <Link
              href="/upload"
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <FileUp className="size-3.5" aria-hidden="true" />
              <span>Unggah PDF</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <ul className="divide-y divide-border/70">
            {filteredItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/reader/${item.id}`}
                  className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface-subtle/70 focus-visible:bg-surface-subtle/70 sm:px-6"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 font-ui text-xs">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 font-semibold text-brand-ink",
                          item.courseSurface
                        )}
                      >
                        {item.courseCode}
                      </span>
                      <span className="text-muted-foreground">
                        {item.prefix
                          ? `${item.prefix}, ${item.pageLabel}`
                          : item.pageLabel}
                        {item.isSpotlight ? " (terakhir diakses)" : ""}
                      </span>
                    </div>
                    <p className="font-heading text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                      {item.title}
                    </p>
                  </div>

                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-subtle font-ui text-xs font-semibold text-foreground transition-colors group-hover:bg-brand-teal group-hover:text-white dark:group-hover:bg-primary dark:group-hover:text-primary-foreground sm:h-9 sm:w-auto sm:gap-1.5 sm:px-3.5">
                    <Headphones className="size-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">Baca</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
