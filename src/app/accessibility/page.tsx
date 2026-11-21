import Link from "next/link";
import { ArrowLeft, ShieldCheck, Keyboard, Eye, Ear, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SonarLogo } from "@/components/shared/SonarLogo";

export default function AccessibilityStatementPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="border-b border-border bg-background/95 px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" aria-label="Kembali ke beranda">
            <SonarLogo size="sm" />
          </Link>
          <Button variant="ghost" size="sm" asChild className="font-ui">
            <Link href="/">
              <ArrowLeft className="mr-2 size-4" />
              Kembali ke Beranda
            </Link>
          </Button>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-12 sm:px-8 outline-none space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-secondary px-3 py-1 text-xs font-semibold text-primary font-ui">
            <ShieldCheck className="size-4" />
            <span>Pernyataan Kepatuhan WCAG 2.2 AA</span>
          </div>
          <h1 className="font-heading text-4xl font-extrabold text-foreground sm:text-5xl">
            Komitmen Aksesibilitas Digital SONAR
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Aksesibilitas bukan sekadar fitur pelengkap di SONAR; ia adalah pondasi dasar arsitektur platform.
            Kami berkomitmen memastikan seluruh mahasiswa tunanetra, low-vision, serta pengguna teknologi asistif
            dapat berpartisipasi setara dalam kegiatan akademik.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Keyboard className="size-5" />
              <h2 className="font-heading text-xl font-bold text-foreground">Navigasi Keyboard Mandiri</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground font-sans">
              Seluruh antarmuka dapat dioperasikan tanpa mouse. Tautan lewati ke konten utama
              (<code>SkipLink</code>), indikator fokus visual kontras tinggi, dan pintasan keyboard
              tersedia untuk navigasi per heading, halaman, dan baris tabel.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Ear className="size-5" />
              <h2 className="font-heading text-xl font-bold text-foreground">Kompatibilitas Screen Reader</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground font-sans">
              Diuji dan dioptimalkan secara berkala menggunakan NVDA, JAWS, VoiceOver (macOS &amp; iOS),
              serta TalkBack. Formula matematika dirender sebagai MathML semantik yang terbaca native.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Eye className="size-5" />
              <h2 className="font-heading text-xl font-bold text-foreground">Kustomisasi Tampilan Membaca</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground font-sans">
              Mendukung pemilihan font Atkinson Hyperlegible, pengaturan ukuran teks hingga 24px,
              jarak baris longgar, mode kontras tinggi (High Contrast), dan latar belakang kertas hangat
              (Warm Paper) untuk pengguna disleksia dan photophobia.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <FileCheck className="size-5" />
              <h2 className="font-heading text-xl font-bold text-foreground">Verifikasi &amp; Pelaporan Isu</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground font-sans">
              Materi perkuliahan yang telah disetujui volunteer tetap memiliki tombol lapor isu (Report Issue)
              di setiap blok dokumen sehingga bila ditemukan ketidaktepatan OCR, koreksi dapat dilakukan segera.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface-subtle p-6 space-y-3">
          <h2 className="font-heading text-lg font-bold text-foreground">Daftar Pintasan Keyboard Cepat</h2>
          <ul className="grid gap-2 sm:grid-cols-2 text-xs font-ui text-muted-foreground">
            <li className="flex items-center justify-between p-2 rounded bg-card border border-border">
              <span>Buka Command Menu</span>
              <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-mono text-[11px]">Ctrl + K / ⌘ + K</kbd>
            </li>
            <li className="flex items-center justify-between p-2 rounded bg-card border border-border">
              <span>Buka Menu Aksesibilitas</span>
              <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-mono text-[11px]">Alt + A</kbd>
            </li>
            <li className="flex items-center justify-between p-2 rounded bg-card border border-border">
              <span>Putar / Jeda Audio Reader</span>
              <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-mono text-[11px]">Spasi (saat fokus)</kbd>
            </li>
            <li className="flex items-center justify-between p-2 rounded bg-card border border-border">
              <span>Lompat ke Konten Utama</span>
              <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-mono text-[11px]">Tab (pertama kali)</kbd>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
