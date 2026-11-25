import { Ear, Eye, FileCheck, Keyboard } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function AccessibilityStatementPage() {
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
            Komitmen Aksesibilitas Digital SONAR
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            SONAR dirancang agar seluruh fungsi membaca, pencarian, pengaturan tampilan, dan peninjauan materi dapat dijalankan mandiri menggunakan keyboard dan pembaca layar sesuai standar WCAG 2.2 Level AA.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-mint text-brand-teal">
                <Keyboard className="size-5" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-xl font-bold text-foreground">
                Navigasi Keyboard Penuh
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Seluruh halaman menyediakan tautan lewati ke konten utama, indikator fokus kontras tinggi, manajemen fokus otomatis saat berpindah halaman, dan daftar isi yang langsung memindahkan fokus ke blok tujuan.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-tint-blue text-brand-blue-strong">
                <Ear className="size-5" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-xl font-bold text-foreground">
                Kompatibilitas Pembaca Layar
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Struktur semantik menggunakan landmark jelas, satu heading utama per halaman, tabel dengan atribut scope, MathML standar untuk persamaan matematika, serta pengumuman live region untuk perubahan status penting.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-tint-peach text-brand-ink">
                <Eye className="size-5" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-xl font-bold text-foreground">
                Kustomisasi Tampilan Low Vision
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pengguna dapat memilih huruf Atkinson Hyperlegible, Lexend, atau Inter, menyesuaikan ukuran huruf 14px–28px, jarak baris, lebar kolom, mode kontras tinggi, latar kertas hangat, dan opsi pengurangan animasi.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-tint-gold text-brand-ink">
                <FileCheck className="size-5" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-xl font-bold text-foreground">
                Verifikasi Manusia &amp; Versi Sumber
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Volunteer meninjau keakuratan teks, rumus, tabel, dan deskripsi gambar, sambil menandai versi PDF sumber agar materi hasil perbaikan tidak tertukar dengan dokumen lama.
            </p>
          </div>
        </div>

        <section
          aria-labelledby="shortcuts-heading"
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h2 id="shortcuts-heading" className="font-heading text-lg font-bold text-foreground">
            Pintasan &amp; Kontrol Navigasi Utama
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 text-sm font-ui">
            <li className="flex items-center justify-between gap-2 rounded-xl bg-surface-subtle p-3">
              <span className="text-foreground">Lewati ke konten utama</span>
              <kbd className="rounded-md border border-border bg-card px-2 py-0.5 font-mono text-xs text-foreground">
                Tab (awal halaman)
              </kbd>
            </li>
            <li className="flex items-center justify-between gap-2 rounded-xl bg-surface-subtle p-3">
              <span className="text-foreground">Menu lompat cepat halaman</span>
              <kbd className="rounded-md border border-border bg-card px-2 py-0.5 font-mono text-xs text-foreground">
                Ctrl + K / ⌘ + K
              </kbd>
            </li>
            <li className="flex items-center justify-between gap-2 rounded-xl bg-surface-subtle p-3">
              <span className="text-foreground">Navigasi antar subbab dokumen</span>
              <kbd className="rounded-md border border-border bg-card px-2 py-0.5 font-mono text-xs text-foreground">
                Tombol H (NVDA / JAWS)
              </kbd>
            </li>
            <li className="flex items-center justify-between gap-2 rounded-xl bg-surface-subtle p-3">
              <span className="text-foreground">Tutup panel dialog / menu</span>
              <kbd className="rounded-md border border-border bg-card px-2 py-0.5 font-mono text-xs text-foreground">
                Esc
              </kbd>
            </li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
