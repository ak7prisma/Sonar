"use client";

import Link from "next/link";
import Image from "next/image";
import { HeartHandshake, Layers, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { APP_IMAGES } from "@/lib/images";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function AboutPage() {
  const { isEn } = useTranslation();

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
              ? "Removing Digital Barriers in University Lecture Halls"
              : "Menghapus Hambatan Digital di Ruang Kuliah Perguruan Tinggi"}
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {isEn
              ? "SONAR empowers blind and low-vision students to independently access scanned lecture PDFs, slide decks, complex tables, and mathematical formulas."
              : "SONAR membantu mahasiswa tunanetra dan low-vision mengakses materi perkuliahan berbentuk PDF hasil pindai, slide presentasi, tabel kompleks, dan rumus matematika secara mandiri."}
          </p>
        </header>

        <div className="relative aspect-21/9 w-full overflow-hidden rounded-3xl border border-border shadow-card">
          <Image
            src={APP_IMAGES.featureStudy.src}
            alt={APP_IMAGES.featureStudy.alt}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2.5 rounded-2xl border border-border bg-card p-6 shadow-card">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-mint text-brand-teal">
              <Shield className="size-5" aria-hidden="true" />
            </span>
            <h2 className="font-heading text-xl font-bold text-foreground">
              {isEn ? "Academic Equality Vision" : "Visi Kesetaraan Akademik"}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isEn
                ? "Realizing equal access to STEM literature without relying solely on visual PDF formats."
                : "Mewujudkan akses setara terhadap literatur sains, teknologi, teknik, dan matematika tanpa bergantung pada format PDF visual semata."}
            </p>
          </div>

          <div className="space-y-2.5 rounded-2xl border border-border bg-card p-6 shadow-card">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-tint-blue text-brand-blue-strong">
              <Layers className="size-5" aria-hidden="true" />
            </span>
            <h2 className="font-heading text-xl font-bold text-foreground">
              {isEn ? "Structured & Verified" : "Terstruktur & Terverifikasi"}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isEn
                ? "Combining automated layout extraction with trained volunteer review to preserve MathML precision and visual descriptions."
                : "Menggabungkan ekstraksi tata letak otomatis dengan peninjauan volunteer terlatih untuk menjaga ketepatan rumus MathML dan deskripsi visual."}
            </p>
          </div>

          <div className="space-y-2.5 rounded-2xl border border-border bg-card p-6 shadow-card">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-tint-peach text-brand-ink">
              <HeartHandshake className="size-5" aria-hidden="true" />
            </span>
            <h2 className="font-heading text-xl font-bold text-foreground">
              {isEn ? "Class-wide Reusability" : "Penggunaan Ulang Se-Kelas"}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isEn
                ? "Approved materials are immediately accessible to classmates enrolled in the same course with source version tracking."
                : "Materi yang telah disetujui volunteer langsung tersedia bagi mahasiswa lain yang terdaftar pada mata kuliah yang sama dengan pelacakan versi sumber."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 font-ui">
          <Button asChild size="lg" className="min-h-11 rounded-full px-6 font-semibold">
            <Link href="/how-it-works">
              {isEn ? "Learn How SONAR Works" : "Pelajari Cara Kerja SONAR"}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-h-11 rounded-full px-6 font-semibold"
          >
            <Link href="/courses">
              {isEn ? "View Available Courses" : "Lihat Mata Kuliah Tersedia"}
            </Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
