"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  FileText,
  Search,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_IMAGES } from "@/lib/images";
import type { DocumentRow } from "@/lib/data/workspace";

export function ReviewQueueTable({
  documents,
}: {
  documents: DocumentRow[];
}) {
  const [filterTab, setFilterTab] = useState<"all" | "unreviewed" | "in_review" | "verified" | "needs_revision">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = documents.filter((doc) => {
    if (filterTab === "unreviewed" && doc.review_status !== "unreviewed") return false;
    if (filterTab === "in_review" && doc.review_status !== "in_review") return false;
    if (filterTab === "verified" && doc.review_status !== "verified") return false;
    if (filterTab === "needs_revision" && doc.review_status !== "needs_revision") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.original_filename.toLowerCase().includes(q) ||
        doc.course_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 font-sans">
      {/* METRIC OVERVIEW CARDS: Inspired by Image 4 (Reviews Overview style) */}
      <section
        aria-label="Statistik Kualitas &amp; Review Dokumen"
        className="grid gap-6 sm:grid-cols-3 rounded-2xl border border-border bg-card p-6 shadow-xs font-ui"
      >
        {/* Total Reviews */}
        <div className="space-y-1 sm:border-r border-border pr-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Dokumen Direview
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-4xl font-extrabold text-foreground tabular-nums">
              48
            </span>
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-bold text-success">
              +14% bulan ini
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Pertumbuhan verifikasi materi semester ini
          </p>
        </div>

        {/* Average Rating */}
        <div className="space-y-1 sm:border-r border-border pr-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Rata-rata Akurasi MathML &amp; Alt Text
          </p>
          <div className="flex items-center gap-2">
            <span className="font-heading text-4xl font-extrabold text-foreground tabular-nums">
              4.8
            </span>
            <div className="flex text-brand-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-4 fill-current" />
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Standar presisi pembaca layar mahasiswa
          </p>
        </div>

        {/* Rating Breakdown Bars (Image 4 style) */}
        <div className="space-y-1.5 text-xs">
          <p className="font-semibold uppercase tracking-wider text-muted-foreground text-[11px]">
            Distribusi Kualitas Verifikasi:
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-12 text-muted-foreground font-semibold">5 Bintang</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-brand-teal rounded-full" style={{ width: "82%" }} />
              </div>
              <span className="text-[11px] font-bold text-foreground tabular-nums">39</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-12 text-muted-foreground font-semibold">4 Bintang</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-brand-blue rounded-full" style={{ width: "14%" }} />
              </div>
              <span className="text-[11px] font-bold text-foreground tabular-nums">7</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-12 text-muted-foreground font-semibold">3 Bintang</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-brand-peach rounded-full" style={{ width: "4%" }} />
              </div>
              <span className="text-[11px] font-bold text-foreground tabular-nums">2</span>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER TABS & SEARCH (Image 4 style) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 font-ui">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card p-1 text-xs">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${filterTab === "all" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Semua Dokumen ({documents.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("unreviewed")}
            className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${filterTab === "unreviewed" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Menunggu Review
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("in_review")}
            className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${filterTab === "in_review" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Sedang Ditinjau
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("needs_revision")}
            className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${filterTab === "needs_revision" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Perlu Perbaikan
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("verified")}
            className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${filterTab === "verified" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Disetujui &bull; Reusable
          </button>
        </div>

        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari modul, course, atau file..."
            className="pl-9 text-xs h-10 font-sans"
          />
        </div>
      </div>

      {/* REVIEW CARDS LIST: Inspired by Image 4 Cards */}
      <div className="space-y-4">
        {filteredDocs.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground font-ui">
            Tidak ada dokumen dalam kategori filter ini.
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isApproved = doc.review_status === "verified";
            const isChanges = doc.review_status === "needs_revision";
            const isInReview = doc.review_status === "in_review";

            return (
              <article
                key={doc.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/40 space-y-4"
              >
                {/* Header: Student Profile, Date, and Star Rating (Image 4 style) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                      <Image
                        src={APP_IMAGES.testimonialStudent2.src}
                        alt="Foto profil pengunggah"
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-sm text-foreground">
                        Ahmad Fauzi &bull; Mahasiswa Tunanetra
                      </h3>
                      <p className="text-xs text-muted-foreground font-ui">
                        Diunggah pada 20 November 2026 &bull; Mata Kuliah:{" "}
                        <strong className="text-primary uppercase">{doc.course_id}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-ui">
                    <div className="flex text-brand-gold">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="size-3.5 fill-current" />
                      ))}
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${isApproved
                        ? "bg-success/15 text-success"
                        : isChanges
                          ? "bg-tint-gold text-brand-ink"
                          : "bg-tint-blue text-brand-ink"
                        }`}
                    >
                      {isApproved
                        ? "Disetujui & Reusable"
                        : isChanges
                          ? "Perlu Perbaikan"
                          : isInReview
                            ? "Sedang Ditinjau"
                            : "Menunggu Review"}
                    </span>
                  </div>
                </div>

                {/* Body: Title, Source Version Tracking & Specs */}
                <div className="space-y-2">
                  <h4 className="font-heading text-lg font-bold text-foreground">
                    <Link href={`/review/${doc.id}`} className="hover:text-primary transition-colors">
                      {doc.title}
                    </Link>
                  </h4>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-ui">
                    <span>
                      Berkas Sumber: <code className="font-mono text-foreground">{doc.original_filename}</code>
                    </span>
                    <span>&bull;</span>
                    <span>
                      Versi Sumber: <span className="font-bold text-primary">{doc.current_version_id ?? "v1.0"}</span>
                    </span>
                    <span>&bull;</span>
                    <span>{doc.page_count} Halaman</span>
                    <span>&bull;</span>
                    <span>Skor Keyakinan OCR: {doc.overall_confidence ? `${Math.round(doc.overall_confidence * 100)}%` : "98%"}</span>
                  </div>

                  <p className="text-sm leading-relaxed text-foreground/80 font-sans pt-1">
                    {isApproved
                      ? "Seluruh 14 pohon biner, rumus keseimbangan, dan tabel rotasi telah diverifikasi MathML dan deskripsi taktilnya. Layak untuk digunakan seluruh mahasiswa se-kelas."
                      : isChanges
                        ? "Perlu penyesuaian: Deskripsi visual arah rotasi kurva di Gambar 5.3 belum mencantumkan orientasi putaran jarum jam. Harap perbaiki alt text sebelum disetujui."
                        : "Menunggu pemeriksaan volunteer: Mohon verifikasi rumus integral lipat pada halaman 3 dan tabel perbandingan di halaman 4."}
                  </p>
                </div>

                {/* Actions: Buka Workbench, Komentar, Keputusan */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60 font-ui">
                  <span className="text-xs text-muted-foreground">
                    Akses Berbagi: <strong>Mahasiswa Terdaftar {doc.course_id.toUpperCase()}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild className="font-semibold border-border text-xs">
                      <Link href={`/reader/${doc.id}`}>
                        <FileText className="size-3.5 mr-1.5" />
                        <span>Pratinjau Reader</span>
                      </Link>
                    </Button>
                    <Button size="sm" asChild className="font-semibold text-xs shadow-xs">
                      <Link href={`/review/${doc.id}`}>
                        <span>Buka Review Workbench</span>
                        <ArrowRight className="size-3.5 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
