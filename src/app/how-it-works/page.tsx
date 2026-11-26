"use client";

import Link from "next/link";
import { BookOpen, Cpu, FileUp, Share2, Users } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function HowItWorksPage() {
  const { isEn } = useTranslation();

  const steps = [
    {
      step: "01",
      title: isEn ? "Upload Lecture PDF Document" : "Unggah Dokumen PDF Kuliah",
      icon: FileUp,
      tone: "bg-brand-mint text-brand-ink",
      description: isEn
        ? "Students upload course materials in PDF format, whether text documents or scanned lecture slides."
        : "Mahasiswa mengunggah materi perkuliahan berformat PDF, baik dokumen teks maupun hasil pemindaian.",
    },
    {
      step: "02",
      title: isEn ? "Extract Semantic Structure" : "Ekstraksi Struktur Semantik",
      icon: Cpu,
      tone: "bg-tint-blue text-brand-ink",
      description: isEn
        ? "SONAR reconstructs heading hierarchies, natural reading flow, tables with row-column headers, and math formulas."
        : "SONAR menyusun hierarki heading, urutan membaca alami, tabel dengan header baris-kolom, serta formula matematika.",
    },
    {
      step: "03",
      title: isEn ? "MathML & Bilingual Voice Narration" : "MathML & Narasi Suara Bilingual",
      icon: BookOpen,
      tone: "bg-tint-gold text-brand-ink",
      description: isEn
        ? "Mathematical equations are rendered as standard MathML supported by screen readers and equipped with Indonesian and English narration."
        : "Persamaan matematika dirender sebagai MathML yang didukung screen reader dan dilengkapi narasi suara Bahasa Indonesia maupun Inggris.",
    },
    {
      step: "04",
      title: isEn ? "Volunteer Reviewer Verification" : "Verifikasi Volunteer Reviewer",
      icon: Users,
      tone: "bg-tint-peach text-brand-ink",
      description: isEn
        ? "Volunteers review text accuracy, formula narration, and diagram descriptions before approving material publication."
        : "Volunteer meninjau ketepatan teks, narasi rumus, dan deskripsi diagram sebelum menyetujui publikasi materi.",
    },
    {
      step: "05",
      title: isEn ? "Class-wide Sharing & Reusability" : "Berbagi & Penggunaan Ulang Se-Kelas",
      icon: Share2,
      tone: "bg-brand-teal text-white",
      description: isEn
        ? "Verified materials are immediately available to all students enrolled in the same course, complete with source version tracking."
        : "Materi terverifikasi tersedia bagi mahasiswa yang terdaftar di mata kuliah yang sama beserta pelacakan versi sumbernya.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <SiteHeader />

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-4 py-12 outline-none sm:px-8"
      >
        <header className="space-y-3">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {isEn
              ? "How SONAR Converts Course Materials"
              : "Cara Kerja SONAR Mengonversi Materi Kuliah"}
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {isEn
              ? "A structured workflow from PDF upload to independent screen reader navigation and classroom sharing."
              : "Alur terstruktur dari pengunggahan PDF hingga pembacaan mandiri dengan pembaca layar dan berbagi antar mahasiswa dalam satu mata kuliah."}
          </p>
        </header>

        <ol className="space-y-4">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <li
                key={s.step}
                className="flex flex-col items-start gap-5 rounded-2xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-center"
              >
                <span
                  className={cn(
                    "flex size-13 shrink-0 items-center justify-center rounded-2xl font-heading text-lg font-extrabold",
                    s.tone
                  )}
                >
                  {s.step}
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="size-5 text-primary" aria-hidden="true" />
                    <h2 className="font-heading text-xl font-bold text-foreground">
                      {s.title}
                    </h2>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="space-y-4 rounded-3xl border border-border bg-card p-8 text-center shadow-card">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            {isEn ? "Ready to Access Course Materials?" : "Siap Mengakses Materi Perkuliahan?"}
          </h2>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground">
            {isEn
              ? "Sign in to open the structured reader or help verify materials as a volunteer."
              : "Masuk ke akun Anda untuk membuka pembaca dokumen terstruktur atau membantu meninjau materi sebagai volunteer."}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-1 font-ui">
            <Button size="lg" asChild className="min-h-11 rounded-full px-6 font-semibold">
              <Link href="/login">{isEn ? "Sign in to SONAR" : "Masuk ke SONAR"}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="min-h-11 rounded-full px-6 font-semibold"
            >
              <Link href="/courses">{isEn ? "View Courses" : "Lihat Mata Kuliah"}</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
