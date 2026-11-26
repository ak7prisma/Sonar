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
  Headphones,
  Plus,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { InteractiveSandbox } from "@/components/marketing/InteractiveSandbox";
import { APP_IMAGES } from "@/lib/images";

const PARTNERS = [
  "Universitas Indonesia",
  "Institut Teknologi Bandung",
  "Universitas Gadjah Mada",
  "Kampus Merdeka Inklusif",
  "W3C WCAG 2.2 AA",
  "NVDA & VoiceOver Ready",
];

const FEATURE_CARDS = [
  {
    title: "Audio Reader & Narasi Sinkron",
    category: "Screen Reader First",
    badgeClass: "bg-brand-mint text-brand-ink",
    accentBar: "bg-brand-teal",
    description:
      "Membacakan materi kuliah per heading dan paragraf dengan sorotan teks aktif secara natural dalam Bahasa Indonesia dan Inggris.",
    image: APP_IMAGES.featureAudio,
    href: "/reader",
    cta: "Coba Audio Reader",
  },
  {
    title: "Ekstraksi Rumus ke MathML",
    category: "STEM Accessibility",
    badgeClass: "bg-tint-blue text-brand-ink",
    accentBar: "bg-brand-blue",
    description:
      "Mengonversi persamaan kalkulus, integral, dan matriks rumit menjadi MathML semantik yang terbaca jernih di NVDA dan VoiceOver.",
    image: APP_IMAGES.courseMath,
    href: "/courses/math-105",
    cta: "Lihat Contoh Rumus",
  },
  {
    title: "Dukungan Braille & Struktur Semantik",
    category: "Tactile & Keyboard",
    badgeClass: "bg-tint-peach text-brand-ink",
    accentBar: "bg-brand-peach",
    description:
      "Memulihkan hierarki heading, tabel baris-kolom, serta deskripsi diagram berlapis agar mulus di refreshable braille display.",
    image: APP_IMAGES.featureBraille,
    href: "/courses/cs-201",
    cta: "Pelajari Struktur",
  },
  {
    title: "Materi Terverifikasi Se-Kelas",
    category: "Peer Volunteer QA",
    badgeClass: "bg-tint-gold text-brand-ink",
    accentBar: "bg-brand-gold",
    description:
      "Volunteer memvalidasi keakuratan OCR dan rumus sekali, lalu seluruh mahasiswa sekelas langsung memakainya dengan pelacakan versi.",
    image: APP_IMAGES.featureStudy,
    href: "/courses",
    cta: "Buka Course Library",
  },
];

const COURSE_PREVIEWS = [
  {
    code: "CS 201",
    title: "Struktur Data dan Algoritma",
    image: APP_IMAGES.courseCS,
    materials: "2 Modul Terverifikasi · v2.1",
    badgeClass: "bg-brand-mint text-brand-ink",
    href: "/courses/cs-201",
  },
  {
    code: "MATH 105",
    title: "Kalkulus Multivariabel & Aljabar Linier",
    image: APP_IMAGES.courseMath,
    materials: "2 Bab & Formula Terverifikasi · v1.2",
    badgeClass: "bg-tint-blue text-brand-ink",
    href: "/courses/math-105",
  },
  {
    code: "STAT 210",
    title: "Teori Probabilitas & Inferensi Statistik",
    image: APP_IMAGES.courseStat,
    materials: "1 Handout Terverifikasi · v2.0",
    badgeClass: "bg-tint-peach text-brand-ink",
    href: "/courses/stat-210",
  },
];

const TESTIMONIALS = [
  APP_IMAGES.testimonialStudent1,
  APP_IMAGES.testimonialStudent2,
  APP_IMAGES.testimonialVolunteer,
];

const HERO_AVATARS = [
  APP_IMAGES.testimonialStudent1.src,
  APP_IMAGES.testimonialStudent2.src,
  APP_IMAGES.testimonialVolunteer.src,
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  // Catch any OAuth code landing on the root landing page and forward to auth callback
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      if (code) {
        window.location.replace(`/auth/callback${window.location.search}`);
      }
    }
  }, []);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!heroRef.current) return;
      const items = heroRef.current.querySelectorAll("[data-hero-reveal]");
      gsap.fromTo(
        items,
        { y: 12, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          stagger: 0.04,
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
    <div className="flex min-h-screen flex-col overflow-x-clip bg-background font-sans text-foreground">
      <SiteHeader />

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {/* HERO SECTION — Enlango-inspired editorial split with SONAR 8-color palette */}
        <section
          ref={heroRef}
          aria-labelledby="hero-heading"
          className="relative overflow-x-clip pb-16 pt-8 sm:pb-24 sm:pt-12 lg:pb-28 lg:pt-14"
        >
          {/* Subtle grid & multi-tone brand aura */}
          <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 right-0 size-96 rounded-full bg-brand-aqua/15 blur-3xl dark:bg-brand-aqua/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-1/4 size-80 rounded-full bg-brand-blue/10 blur-3xl dark:bg-brand-blue/10"
          />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
              {/* Left Column: Trust Pill, Expressive Display Headline, CTAs & Stats */}
              <div className="min-w-0 space-y-7 lg:col-span-6">
                <h1
                  id="hero-heading"
                  data-hero-reveal
                  className="font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.45rem] leading-[1.08]"
                >
                  <span className="block">Akses Kuliah</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>Tanpa</span>
                    <span
                      aria-hidden="true"
                      className="inline-flex items-center -space-x-2.5 align-middle"
                    >
                      {HERO_AVATARS.map((src, idx) => (
                        <span
                          key={src}
                          className="relative inline-block size-10 overflow-hidden rounded-full border-2 border-background bg-muted shadow-xs sm:size-12"
                        >
                          <Image
                            src={src}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                            priority={idx === 0}
                          />
                        </span>
                      ))}
                    </span>
                    <span className="italic font-bold text-brand-teal dark:text-brand-aqua">
                      Batas
                    </span>
                  </span>
                  <span className="mt-1 block">dengan Suara</span>
                </h1>

                <p
                  data-hero-reveal
                  className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg font-sans"
                >
                  SONAR mengubah PDF perkuliahan, slide scan dosen, rumus matematika, dan diagram
                  menjadi bacaan terstruktur yang siap diakses screen reader, braille display, dan
                  audio narasi terverifikasi volunteer.
                </p>

                <div
                  data-hero-reveal
                  className="flex flex-wrap items-center gap-3 pt-1 font-ui"
                >
                  <Button
                    size="lg"
                    asChild
                    className="h-12 rounded-full bg-brand-teal px-6 font-semibold text-white shadow-md hover:bg-brand-ink dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                  >
                    <Link href="/register">
                      <span>Mulai Akses Gratis</span>
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="h-12 rounded-full border-border bg-card px-6 font-semibold text-foreground hover:bg-brand-mint hover:text-brand-ink dark:hover:bg-muted dark:hover:text-foreground"
                  >
                    <a href="#sandbox-heading">
                      <Headphones className="size-4 text-primary" aria-hidden="true" />
                      <span>Coba Live MathML</span>
                    </a>
                  </Button>
                </div>

                {/* 3 Bold Metric Pillars (Enlango bottom row) */}
                <dl
                  data-hero-reveal
                  className="grid grid-cols-3 gap-4 border-t border-border/80 pt-7 sm:gap-6"
                >
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground font-ui">
                      Standar Aksesibilitas
                    </dt>
                    <dd className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-foreground tabular-nums sm:text-3xl">
                      100%
                    </dd>
                    <dd className="text-[11px] font-medium text-primary font-ui">WCAG 2.2 AA</dd>
                  </div>
                  <div className="border-l border-border/80 pl-4 sm:pl-6">
                    <dt className="text-xs font-medium text-muted-foreground font-ui">
                      Kelas Terverifikasi
                    </dt>
                    <dd className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-foreground tabular-nums sm:text-3xl">
                      3+
                    </dd>
                    <dd className="text-[11px] font-medium text-muted-foreground font-ui">
                      Materi Reusable
                    </dd>
                  </div>
                  <div className="border-l border-border/80 pl-4 sm:pl-6">
                    <dt className="text-xs font-medium text-muted-foreground font-ui">
                      Verifikasi Volunteer
                    </dt>
                    <dd className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-foreground tabular-nums sm:text-3xl">
                      4.9/5
                    </dd>
                    <dd className="text-[11px] font-medium text-muted-foreground font-ui">
                      Akurasi MathML
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Right Column: Authentic Braille Workstation Photo + Floating Palette Cards */}
              <div
                data-hero-reveal
                className="relative min-w-0 lg:col-span-6 lg:pl-6"
              >
                {/* Decorative soft frame behind photo */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-tr from-brand-mint via-tint-blue/70 to-tint-gold/70 dark:from-brand-teal/20 dark:via-brand-blue/15 dark:to-brand-peach/15"
                />

                <div className="relative mx-auto max-w-lg lg:max-w-none">
                  {/* Main Hero Photo Frame */}
                  <div className="relative aspect-[4/4.2] w-full overflow-hidden rounded-3xl border border-border/80 bg-card shadow-float sm:aspect-[4/4]">
                    <Image
                      src={APP_IMAGES.heroBraille.src}
                      alt={APP_IMAGES.heroBraille.alt}
                      fill
                      priority
                      className="object-cover object-center"
                      sizes="(max-width: 1024px) 100vw, 48vw"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-ink/35 via-transparent to-transparent"
                    />
                  </div>

                  {/* Floating Badge 1 (Top-Right): Verification Pills */}
                  <div className="hidden flex-col items-end gap-2 sm:flex sm:absolute sm:-right-3 sm:top-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/95 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-float backdrop-blur-md font-ui">
                      <CheckCircle2 className="size-4 text-brand-teal dark:text-brand-aqua" aria-hidden="true" />
                      <span>Screen Reader Ready</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/95 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-float backdrop-blur-md font-ui">
                      <CheckCircle2 className="size-4 text-brand-blue-strong dark:text-brand-blue" aria-hidden="true" />
                      <span>Volunteer Verified</span>
                    </div>
                  </div>

                  {/* Floating Badge 2 (Mid-Left): Periwinkle Blue Card */}
                  <div className="hidden sm:block sm:absolute sm:-left-6 sm:top-1/3 sm:w-44 rounded-2xl bg-brand-blue-strong p-4 text-white shadow-float ring-4 ring-brand-blue/30 animate-float-slow">
                    <p className="font-heading text-2xl font-extrabold leading-none">MathML</p>
                    <p className="mt-1.5 text-xs font-medium text-white/90 font-ui leading-snug">
                      Narasi rumus kalkulus &amp; matriks bilingual
                    </p>
                  </div>

                  {/* Floating Badge 3 (Bottom-Left): White Mode Selector Card */}
                  <div className="hidden sm:block sm:absolute sm:-left-5 sm:bottom-10 rounded-2xl border border-border/80 bg-card/95 p-4 shadow-float backdrop-blur-md">
                    <p className="font-heading text-xs font-bold text-foreground">
                      Mode Belajar Inklusif
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5 font-ui text-[11px] font-semibold">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-mint px-2.5 py-1 text-brand-ink">
                        <Plus className="size-3" aria-hidden="true" />
                        Audio
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-tint-blue px-2.5 py-1 text-brand-ink">
                        <Plus className="size-3" aria-hidden="true" />
                        Braille
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-tint-gold px-2.5 py-1 text-brand-ink">
                        <Plus className="size-3" aria-hidden="true" />
                        Tanya AI
                      </span>
                    </div>
                  </div>

                  {/* Floating Badge 4 (Bottom-Right): Warm Peach Highlight Card */}
                  <div className="hidden sm:block sm:absolute sm:-bottom-5 sm:right-4 sm:w-44 rounded-2xl bg-brand-peach p-4 text-brand-ink shadow-float ring-4 ring-background animate-float">
                    <p className="font-heading text-2xl font-extrabold leading-none">24/7</p>
                    <p className="mt-1.5 text-xs font-semibold text-brand-ink/90 font-ui leading-snug">
                      Materi terverifikasi &amp; reusable se-kelas
                    </p>
                  </div>

                  {/* Mobile-only compact summary cards (zero overflow on small screens) */}
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:hidden font-ui">
                    <div className="rounded-2xl bg-brand-blue-strong p-3.5 text-white shadow-xs">
                      <p className="font-heading text-lg font-extrabold">MathML</p>
                      <p className="mt-0.5 text-xs text-white/90">Narasi rumus bilingual</p>
                    </div>
                    <div className="rounded-2xl bg-brand-peach p-3.5 text-brand-ink shadow-xs">
                      <p className="font-heading text-lg font-extrabold">24/7</p>
                      <p className="mt-0.5 text-xs font-semibold text-brand-ink/90">
                        Materi reusable se-kelas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PARTNER STRIP */}
        <section
          aria-label="Mitra Perguruan Tinggi dan Standar Aksesibilitas"
          className="border-y border-border bg-brand-mint/70 py-6 dark:bg-surface-subtle"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground font-ui">
              Dirancang untuk Ekosistem Pendidikan Tinggi Inklusif &bull; Standar WCAG 2.2 AA
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {PARTNERS.map((partner) => (
                <div
                  key={partner}
                  className="inline-flex items-center gap-2 text-xs font-bold text-foreground/85 font-ui"
                >
                  <GraduationCap className="size-4 text-primary" aria-hidden="true" />
                  <span>{partner}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURE CARDS */}
        <section
          id="features"
          aria-labelledby="features-heading"
          className="py-16 sm:py-24 bg-background"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div className="max-w-2xl space-y-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-mint px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-ink font-ui">
                  <Sparkles className="size-3.5 text-brand-teal" aria-hidden="true" />
                  Kemampuan Inti SONAR
                </span>
                <h2
                  id="features-heading"
                  className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
                >
                  Mengubah materi visual kompleks menjadi narasi akademik yang jernih
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base font-sans">
                Setiap PDF perkuliahan—teks scan, tabel data, rumus diferensial, hingga grafik—dipulihkan
                menjadi struktur semantik yang utuh.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURE_CARDS.map((card) => (
                <article
                  key={card.title}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-float"
                >
                  <div>
                    <div className={`h-1.5 w-full ${card.accentBar}`} aria-hidden="true" />
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                      <Image
                        src={card.image.src}
                        alt={card.image.alt}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <span
                        className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-xs font-ui ${card.badgeClass}`}
                      >
                        {card.category}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="font-heading text-lg font-bold leading-snug text-foreground">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground font-sans">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border/60 px-5 py-3.5">
                    <Link
                      href={card.href}
                      className="inline-flex w-full items-center justify-between text-sm font-semibold text-primary transition-colors hover:text-brand-ink dark:hover:text-brand-aqua font-ui"
                    >
                      <span>{card.cta}</span>
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* EDITORIAL QUOTE & BRAILLE SPOTLIGHT */}
        <section
          aria-label="Kutipan Pengalaman Mahasiswa"
          className="px-4 py-4 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-brand-peach/40 bg-tint-peach dark:border-border dark:bg-card">
            <div className="grid items-center lg:grid-cols-12">
              <div className="relative aspect-[16/10] w-full lg:col-span-5 lg:aspect-auto lg:h-full">
                <Image
                  src={APP_IMAGES.quoteBraille.src}
                  alt={APP_IMAGES.quoteBraille.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
              </div>

              <div className="space-y-4 p-7 sm:p-10 lg:col-span-7 lg:p-12">
                <span className="inline-block rounded-full bg-brand-ink px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-paper font-ui dark:bg-brand-peach dark:text-brand-ink">
                  Suara Mahasiswa Tunanetra
                </span>
                <blockquote className="font-heading text-xl font-bold leading-relaxed tracking-tight text-brand-ink sm:text-2xl dark:text-foreground">
                  &ldquo;Materi perkuliahan yang tadinya hanya tumpukan gambar tak terbaca di PDF
                  slide dosen, kini bisa saya dengarkan dan navigasikan rumus demi rumus dengan
                  presisi. SONAR mengembalikan kemandirian belajar saya.&rdquo;
                </blockquote>
                <p className="text-sm font-semibold text-brand-ink/80 font-ui dark:text-muted-foreground">
                  Maya Lin &bull; Mahasiswi Ilmu Komputer Universitas Indonesia (Tunanetra Total)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section
          id="testimonials"
          aria-labelledby="testimonials-heading"
          className="py-16 sm:py-24 bg-background"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-tint-gold px-3 py-1 text-brand-ink font-ui">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-3.5 fill-current" aria-hidden="true" />
                    ))}
                  </div>
                  <span className="text-xs font-bold">4.9 / 5.0 Ulasan Terverifikasi</span>
                </div>
                <h2
                  id="testimonials-heading"
                  className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
                >
                  Dipercaya mahasiswa dan volunteer akademik
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
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextTestimonial}
                  aria-label="Ulasan berikutnya"
                  className="rounded-full"
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
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
                        ? "border-primary bg-card shadow-float ring-2 ring-primary/20"
                        : "border-border bg-card/80 shadow-xs hover:border-primary/40"
                    }`}
                  >
                    <div>
                      <div className="mb-4 inline-flex items-center gap-1 rounded-full bg-tint-gold px-2.5 py-1 text-brand-ink">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="size-3.5 fill-current" aria-hidden="true" />
                        ))}
                      </div>

                      <p className="text-sm leading-relaxed text-foreground/90 font-sans">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                    </div>

                    <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-brand-mint">
                        <Image
                          src={t.src}
                          alt={t.alt}
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-heading text-sm font-bold text-foreground">
                          {t.name}
                        </h3>
                        <p className="truncate text-xs text-muted-foreground font-ui">{t.role}</p>
                        <p className="truncate text-[11px] font-semibold text-primary font-ui">
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
        <section className="border-y border-border bg-brand-mint/45 py-16 dark:bg-surface-subtle/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <InteractiveSandbox />
          </div>
        </section>

        {/* SHARED REUSABLE COURSE MATERIALS */}
        <section
          aria-labelledby="shared-heading"
          className="py-16 sm:py-24 bg-background"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-12">
              <div className="min-w-0 space-y-5 lg:col-span-6">
                <span className="inline-block rounded-full bg-tint-blue px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-ink font-ui">
                  Shared Reusable Library
                </span>
                <h2
                  id="shared-heading"
                  className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
                >
                  Satu kali review volunteer, langsung siap dipakai seluruh mahasiswa se-kelas
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground font-sans">
                  Tidak perlu memproses ulang slide yang sama setiap semester. Dokumen yang telah
                  disetujui volunteer otomatis tersedia bagi mahasiswa yang terdaftar pada mata kuliah
                  terkait dengan pelacakan versi sumber yang transparan.
                </p>

                <ul className="space-y-3 text-sm font-ui">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      <strong>3 Mata Kuliah Aktif:</strong> CS 201, MATH 105, dan STAT 210 siap
                      diakses langsung dari Course Library.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      <strong>Source-Version Tracking:</strong> Menampilkan versi sumber (misalnya{" "}
                      <code>v2.1</code>), nama volunteer, dan tanggal verifikasi.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      <strong>Notifikasi Pembaruan Slide:</strong> Otomatis memberi tanda jika dosen
                      mengunggah revisi PDF terbaru.
                    </span>
                  </li>
                </ul>

                <div className="pt-2">
                  <Button
                    size="lg"
                    asChild
                    className="h-12 rounded-full bg-brand-teal px-7 font-ui font-semibold text-white hover:bg-brand-ink dark:bg-primary dark:text-primary-foreground"
                  >
                    <Link href="/courses">
                      <span>Buka Katalog Mata Kuliah</span>
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Course Preview Cards */}
              <div className="min-w-0 space-y-4 lg:col-span-6">
                {COURSE_PREVIEWS.map((c) => (
                  <Link
                    key={c.code}
                    href={c.href}
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-float"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-border">
                        <Image
                          src={c.image.src}
                          alt={c.image.alt}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 font-heading text-xs font-bold ${c.badgeClass}`}
                        >
                          {c.code}
                        </span>
                        <p className="truncate font-ui text-sm font-bold text-foreground sm:text-base">
                          {c.title}
                        </p>
                        <p className="text-xs text-muted-foreground font-ui">{c.materials}</p>
                      </div>
                    </div>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* GOLDEN CAMPUS IMPACT BANNER */}
        <section
          aria-label="Daftarkan Kampus Anda"
          className="px-4 pb-16 pt-2 sm:px-6 sm:pb-24 lg:px-8"
        >
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-brand-gold px-6 py-14 text-center text-brand-ink shadow-float sm:px-12 sm:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full bg-brand-peach/45 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -right-12 size-64 rounded-full bg-brand-aqua/35 blur-2xl"
            />

            <div className="relative mx-auto max-w-3xl">
              <span className="inline-block rounded-full bg-brand-ink/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-ink font-ui">
                Campus Partnership &bull; Inklusif Untuk Semua
              </span>
              <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
                Wujudkan perkuliahan yang benar-benar aksesibel di kampus Anda
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-brand-ink/85 font-sans">
                Bergabung bersama mahasiswa tunanetra dan volunteer akademik untuk menghadirkan
                materi kuliah terstruktur, ramah screen reader, dan siap dibagikan se-kelas.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 font-ui">
                <Button
                  size="lg"
                  asChild
                  className="h-12 rounded-full bg-brand-ink px-7 font-semibold text-brand-paper hover:bg-brand-teal"
                >
                  <Link href="/register">
                    <span>Daftar Akun Gratis</span>
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-12 rounded-full border-brand-ink/35 bg-brand-paper/70 px-7 font-semibold text-brand-ink hover:bg-brand-paper"
                >
                  <Link href="/how-it-works">Pelajari Alur Konversi</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
