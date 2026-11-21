"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SonarLogo } from "@/components/shared/SonarLogo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { AccessibilityToolbar } from "@/components/accessibility/AccessibilityToolbar";
import { InteractiveSandbox } from "@/components/marketing/InteractiveSandbox";
import { APP_IMAGES } from "@/lib/images";

const PARTNERS = [
  { name: "Universitas Indonesia", label: "UI Aksesibel" },
  { name: "Institut Teknologi Bandung", label: "ITB Disability Center" },
  { name: "Universitas Gadjah Mada", label: "UGM Inklusi" },
  { name: "Kemendikbudristek Dikti", label: "Kampus Merdeka Inklusif" },
  { name: "W3C Web Accessibility Initiative", label: "WAI WCAG 2.2" },
  { name: "Perkins Access", label: "Assistive Technology" },
];

const FEATURE_CARDS = [
  {
    title: "Audio Reader & Narasi Sinkron",
    category: "Screen Reader First",
    description:
      "Membacakan teks kuliah per heading dan per paragraf dengan sinkronisasi sorotan kata secara natural dalam Bahasa Indonesia dan Inggris.",
    image: APP_IMAGES.featureSpeech,
    href: "/reader",
    cta: "Coba Audio Reader",
  },
  {
    title: "Ekstraksi Rumus ke MathML & Narasi Audio",
    category: "STEM Accessibility",
    description:
      "Mengonversi persamaan kalkulus, matriks, dan notasi matematika rumit menjadi kode MathML semantik yang terbaca jernih di NVDA dan VoiceOver.",
    image: APP_IMAGES.courseMath,
    href: "/courses/math-105",
    cta: "Lihat Contoh Rumus",
  },
  {
    title: "Deskripsi Visual & Diagram Berlapis",
    category: "AI Vision & Multimodal",
    description:
      "Menghasilkan ringkasan grafik, sumbu koordinat, tren data, hingga catatan ketidakpastian secara berjenjang untuk mencegah cognitive overload.",
    image: APP_IMAGES.featureScan,
    href: "/courses/cs-201",
    cta: "Pelajari Diagram",
  },
  {
    title: "Materi Terverifikasi & Reusable Se-Kelas",
    category: "Peer Volunteer QA",
    description:
      "Volunteer memvalidasi dokumen sekali, dan seluruh mahasiswa tunanetra dalam mata kuliah yang sama dapat langsung menggunakannya kembali.",
    image: APP_IMAGES.featureStudy,
    href: "/courses",
    cta: "Akses Course Library",
  },
];

const TESTIMONIALS = [
  APP_IMAGES.testimonialStudent1,
  APP_IMAGES.testimonialStudent2,
  APP_IMAGES.testimonialVolunteer,
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!heroRef.current) return;
      const items = heroRef.current.querySelectorAll("[data-hero-reveal]");
      gsap.fromTo(
        items,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          clearProps: "transform,opacity",
        }
      );
    });
    return () => mm.revert();
  }, []);

  const nextTestimonial = () => {
    setActiveTestimonialIdx((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonialIdx((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      {/* Primary Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="SONAR beranda"
            className="inline-flex items-center rounded-md py-1 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <SonarLogo size="sm" />
          </Link>

          <nav
            aria-label="Navigasi Utama"
            className="hidden items-center gap-7 text-sm font-semibold font-ui text-foreground/85 md:flex"
          >
            <a
              href="#features"
              className="transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
            >
              Fitur Utama
            </a>
            <Link
              href="/courses"
              className="transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
            >
              Mata Kuliah & Sharing
            </Link>
            <a
              href="#sandbox-heading"
              className="transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
            >
              Live Engine
            </a>
            <a
              href="#testimonials"
              className="transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
            >
              Ulasan Mahasiswa
            </a>
            <Link
              href="/how-it-works"
              className="transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
            >
              Cara Kerja
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <AccessibilityToolbar />
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden font-ui sm:inline-flex border-border/80"
            >
              <Link href="/login">Masuk</Link>
            </Button>
            <Button size="sm" asChild className="font-ui shadow-xs">
              <Link href="/dashboard">Buka Workspace</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {/* HERO SECTION — Inspired by Image 1 "Perceive Possibility" */}
        <section
          ref={heroRef}
          aria-labelledby="hero-heading"
          className="relative overflow-hidden border-b border-border bg-gradient-to-b from-surface-subtle via-background to-background py-16 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-12">
              {/* Left Column: Typography & CTAs */}
              <div className="space-y-6 lg:col-span-7">
                <div
                  data-hero-reveal
                  className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-secondary/80 px-4 py-1.5 text-xs font-semibold text-secondary-foreground font-ui"
                >
                  <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                  <span>WCAG 2.2 AA Academic Accessibility Platform</span>
                </div>

                <h1
                  id="hero-heading"
                  data-hero-reveal
                  className="font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.12]"
                >
                  Perceive Possibility.{" "}
                  <span className="text-primary">Materi Kuliah Tanpa Batas</span> bagi Mahasiswa Tunanetra.
                </h1>

                <p
                  data-hero-reveal
                  className="max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground font-sans"
                >
                  SONAR mengonversi PDF modul perkuliahan, slide scan dosen, tabel kompleks, dan
                  persamaan matematika rumit menjadi materi digital terstruktur yang siap dibaca
                  screen reader, dinarasikan audio, dan diverifikasi oleh volunteer akademik.
                </p>

                <div
                  data-hero-reveal
                  className="flex flex-wrap items-center gap-3 pt-2 font-ui"
                >
                  <Button size="lg" asChild className="shadow-md h-12 px-6 font-semibold">
                    <Link href="/login">
                      <span>Mulai Akses Materi</span>
                      <ArrowRight className="size-4 ml-1.5" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="h-12 px-6 font-semibold border-border/80"
                  >
                    <Link href="/courses">Jelajahi Materi Reusable</Link>
                  </Button>
                  <Button size="lg" variant="ghost" asChild className="h-12 px-5 font-semibold">
                    <a href="#sandbox-heading">Coba Live MathML</a>
                  </Button>
                </div>

                <div
                  data-hero-reveal
                  className="pt-4 flex items-center gap-6 text-xs text-muted-foreground font-ui"
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                    <span>NVDA &amp; VoiceOver Ready</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                    <span>MathML &amp; Audio Bilingual</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                    <span>Peer Volunteer Review</span>
                  </div>
                </div>
              </div>

              {/* Right Column: High Quality Image with Descriptive Alt Text */}
              <div
                data-hero-reveal
                className="relative lg:col-span-5 flex justify-center"
              >
                <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-primary/20 bg-card shadow-2xl">
                  <div className="relative aspect-4/5 w-full">
                    <Image
                      src={APP_IMAGES.heroStudent.src}
                      alt={APP_IMAGES.heroStudent.alt}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 text-white">
                    <span className="inline-block rounded-md bg-primary px-2.5 py-1 text-xs font-bold font-ui uppercase tracking-wider">
                      Inclusive Campus
                    </span>
                    <p className="mt-1.5 text-sm font-semibold font-heading leading-snug">
                      Ahmad Fauzi &bull; Mahasiswa Tunanetra Universitas Indonesia
                    </p>
                    <p className="text-xs text-white/80 font-sans mt-0.5">
                      Mengakses modul CS 201 dengan audio reader dan MathML terverifikasi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Ticker */}
        <section
          aria-label="Mitra Perguruan Tinggi & Standar Aksesibilitas"
          className="border-b border-border bg-surface-subtle/50 py-6"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground font-ui mb-4">
              Terstandarisasi untuk Kurikulum Perguruan Tinggi &bull; Kompatibel WCAG 2.2 AA
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-85">
              {PARTNERS.map((partner) => (
                <div
                  key={partner.name}
                  className="flex items-center gap-2 text-xs font-bold font-ui text-foreground/80 hover:text-primary transition-colors"
                >
                  <GraduationCap className="size-4 text-primary" aria-hidden="true" />
                  <span>{partner.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURE CARDS — "Articulating visual information into speech" (Image 1 reference) */}
        <section
          id="features"
          aria-labelledby="features-heading"
          className="py-16 sm:py-24 bg-background"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-3">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary font-ui">
                Core Capabilities
              </span>
              <h2
                id="features-heading"
                className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              >
                Articulating visual information into natural academic speech
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground font-sans">
                Setiap elemen materi perkuliahan dalam format PDF—mulai dari teks, heading, tabel baris-kolom,
                rumus diferensial, hingga grafik kurva—dianalisis dan diubah menjadi struktur semantik utuh.
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURE_CARDS.map((card) => (
                <article
                  key={card.title}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div>
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
                      <Image
                        src={card.image.src}
                        alt={card.image.alt}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      <span className="absolute left-3 top-3 rounded-md bg-background/90 px-2 py-1 text-[11px] font-bold font-ui backdrop-blur-xs text-foreground">
                        {card.category}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="font-heading text-lg font-bold text-foreground leading-snug">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground font-sans">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border/60 p-5 pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="w-full justify-between font-ui font-semibold text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                      <Link href={card.href}>
                        <span>{card.cta}</span>
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* WARM PEACH QUOTE CALLOUT — (Image 1 reference) */}
        <section
          aria-label="Kutipan Pengalaman Mahasiswa"
          className="border-y border-amber-200/60 bg-amber-50/70 dark:bg-amber-950/30 py-14"
        >
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <span
              className="text-5xl font-serif text-amber-600/70 select-none block leading-none"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <blockquote className="mt-2 font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl leading-relaxed">
              Materi perkuliahan yang tadinya hanya tumpukan gambar tak terbaca di PDF slide dosen,
              kini bisa saya dengarkan dan navigasikan rumus demi rumus dengan presisi. SONAR
              mengembalikan kemandirian belajar saya di bangku universitas.
            </blockquote>
            <p className="mt-4 text-sm font-semibold text-amber-800 dark:text-amber-300 font-ui">
              Maya Lin &bull; Mahasiswi Ilmu Komputer Universitas Indonesia (Tunanetra Total)
            </p>
          </div>
        </section>

        {/* TESTIMONIALS SECTION — (Image 5 reference) */}
        <section
          id="testimonials"
          aria-labelledby="testimonials-heading"
          className="py-16 sm:py-24 bg-surface-subtle/40 border-b border-border"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end mb-12">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-current" aria-hidden="true" />
                  ))}
                  <span className="ml-1 text-sm font-bold text-foreground font-ui">
                    4.9 / 5.0 Berdasarkan Ulasan Terverifikasi
                  </span>
                </div>
                <h2
                  id="testimonials-heading"
                  className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                >
                  Reviews from real students and volunteers
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevTestimonial}
                  aria-label="Ulasan sebelumnya"
                  className="rounded-full"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextTestimonial}
                  aria-label="Ulasan berikutnya"
                  className="rounded-full"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t, idx) => {
                const isActive = idx === activeTestimonialIdx;
                return (
                  <article
                    key={t.name}
                    className={`flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                      isActive
                        ? "border-primary bg-card shadow-lg ring-1 ring-primary/30"
                        : "border-border bg-card/60 shadow-xs hover:border-border/80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1 text-amber-500 mb-4">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="size-4 fill-current" aria-hidden="true" />
                        ))}
                      </div>

                      <p className="text-sm leading-relaxed text-foreground/90 font-sans italic">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                    </div>

                    <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-full border border-primary/20">
                        <Image
                          src={t.src}
                          alt={t.alt}
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading text-sm font-bold text-foreground truncate">
                          {t.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-ui truncate">{t.role}</p>
                        <p className="text-[11px] font-semibold text-primary font-ui truncate">
                          {t.university}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* LIVE ACCESSIBILITY ENGINE SANDBOX */}
        <section className="py-16 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <InteractiveSandbox />
          </div>
        </section>

        {/* REUSABLE REVIEWED MATERIALS LIBRARY OVERVIEW */}
        <section
          aria-labelledby="shared-heading"
          className="border-t border-border bg-surface-subtle/50 py-16 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="space-y-5">
                <span className="inline-block rounded-md bg-secondary px-3 py-1 text-xs font-bold text-primary font-ui uppercase tracking-wider">
                  Shared Reusable Document Library
                </span>
                <h2
                  id="shared-heading"
                  className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                >
                  Satu Kali Review Volunteer, Dapat Digunakan Seluruh Mahasiswa Se-Kelas.
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground font-sans">
                  Di universitas biasa, setiap mahasiswa tunanetra harus bersusah payah meminta bantuan
                  atau memproses ulang slide yang sama. Di SONAR, materi kuliah yang telah disetujui volunteer
                  langsung tersedia di Course Library dengan pelacakan versi sumber yang transparan.
                </p>

                <div className="space-y-3 font-ui text-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                      <strong>Course-Based Library:</strong> Mahasiswa terdaftar dalam CS 201, MATH 105,
                      dan STAT 210 dapat langsung membuka materi tanpa proses ulang.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                      <strong>Source-Version Tracking:</strong> Setiap dokumen mencatat tanggal review,
                      nama volunteer, dan versi sumber (misalnya <code>v2.1</code>).
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                      <strong>Peringatan Versi Baru:</strong> Jika dosen memperbarui slide di kemudian hari,
                      sistem otomatis memberi notifikasi bahwa versi sumber telah bertambah.
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button size="lg" asChild className="font-ui font-semibold">
                    <Link href="/courses">
                      <span>Buka Katalog Mata Kuliah</span>
                      <ArrowRight className="size-4 ml-1.5" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Course Cards Preview */}
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  {
                    code: "CS 201",
                    title: "Struktur Data dan Algoritma",
                    image: APP_IMAGES.courseCS,
                    materials: "2 Modul Terverifikasi",
                    href: "/courses/cs-201",
                  },
                  {
                    code: "MATH 105",
                    title: "Kalkulus Multivariabel & Aljabar Linier",
                    image: APP_IMAGES.courseMath,
                    materials: "2 Bab & Formula Terverifikasi",
                    href: "/courses/math-105",
                  },
                  {
                    code: "STAT 210",
                    title: "Teori Probabilitas & Inferensi Statistik",
                    image: APP_IMAGES.courseStat,
                    materials: "1 Handout Terverifikasi",
                    href: "/courses/stat-210",
                  },
                ].map((c) => (
                  <Link
                    key={c.code}
                    href={c.href}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={c.image.src}
                          alt={c.image.alt}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-heading font-bold text-sm text-primary">{c.code}</span>
                        <p className="text-sm font-semibold text-foreground truncate font-ui">{c.title}</p>
                        <p className="text-xs text-muted-foreground font-ui">{c.materials}</p>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* GOLDEN CAMPUS IMPACT BANNER — (Image 1 reference) */}
        <section
          aria-label="Daftarkan Kampus Anda"
          className="bg-amber-400 text-neutral-900 py-16"
        >
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <span className="text-xs font-bold uppercase tracking-wider font-ui opacity-90">
              Campus Partnership &bull; Inklusif Untuk Semua
            </span>
            <h2 className="mt-2 font-heading text-3xl font-extrabold sm:text-4xl text-neutral-950">
              Wujudkan Perkuliahan yang Benar-Benar Aksesibel di Kampus Anda
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-900/90 font-sans max-w-2xl mx-auto">
              Gabung bersama ribuan mahasiswa dan volunteer dalam membangun ekosistem akademik yang inklusif.
              Mulai gunakan SONAR sekarang secara gratis.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 font-ui">
              <Button
                size="lg"
                asChild
                className="bg-neutral-950 text-white hover:bg-neutral-800 font-semibold h-12 px-7"
              >
                <Link href="/login">Daftar Akun Mahasiswa</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-neutral-900/30 text-neutral-950 hover:bg-neutral-900/10 font-semibold h-12 px-7"
              >
                <Link href="/how-it-works">Pelajari Alur Konversi</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Accessible Comprehensive Footer */}
      <footer className="border-t border-border bg-background py-12 font-ui">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 pb-8 border-b border-border">
            <div className="space-y-3">
              <SonarLogo size="sm" />
              <p className="text-xs leading-relaxed text-muted-foreground font-sans">
                SONAR adalah platform web accessibility AI yang membantu mahasiswa tunanetra
                mengakses materi perkuliahan dalam format PDF, MathML, dan audio narasi terstruktur.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                Aplikasi &amp; Workspace
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link href="/dashboard" className="hover:text-primary transition-colors">
                    Dashboard Mahasiswa
                  </Link>
                </li>
                <li>
                  <Link href="/courses" className="hover:text-primary transition-colors">
                    Mata Kuliah &amp; Shared Materials
                  </Link>
                </li>
                <li>
                  <Link href="/upload" className="hover:text-primary transition-colors">
                    Unggah Dokumen PDF
                  </Link>
                </li>
                <li>
                  <Link href="/reader" className="hover:text-primary transition-colors">
                    Accessible Document Reader
                  </Link>
                </li>
                <li>
                  <Link href="/review" className="hover:text-primary transition-colors">
                    Volunteer Review Queue
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                Informasi &amp; Standar
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors">
                    Tentang SONAR
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-primary transition-colors">
                    Alur Konversi &amp; AI
                  </Link>
                </li>
                <li>
                  <Link href="/accessibility" className="hover:text-primary transition-colors">
                    Pernyataan Aksesibilitas WCAG
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-primary transition-colors">
                    Help Center &amp; Panduan Pengguna
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                Kepatuhan &amp; Kontak
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dirancang sesuai standar WCAG 2.2 Level AA, Section 508, dan panduan Kemendikbudristek
                untuk teknologi asistif perguruan tinggi.
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                Dukungan pengguna: <span className="font-semibold text-foreground">support@sonar.ac.id</span>
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-between gap-4 text-xs text-muted-foreground sm:flex-row sm:items-center">
            <p>&copy; 2026 SONAR — Accessible Course Materials for Blind Students. Hak cipta dilindungi.</p>
            <p>Font: Plus Jakarta Sans &bull; Poppins &bull; Atkinson Hyperlegible</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
