import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const FAQS = [
  {
    q: "Bagaimana cara membaca materi kuliah dengan pembaca layar?",
    a: "Buka halaman Pembaca Dokumen, gunakan tombol Tab untuk menavigasi kontrol audio atau gunakan daftar isi di sisi kiri untuk melompat dan memindahkan fokus langsung ke bab, rumus, atau tabel tertentu.",
  },
  {
    q: "Apa perbedaan dokumen pribadi dan materi terverifikasi kelas?",
    a: "Dokumen pribadi hanya dapat dibuka oleh pengunggahnya. Materi yang diajukan untuk review volunteer akan diperiksa keakuratannya lalu tersedia bagi seluruh mahasiswa yang terdaftar di mata kuliah yang sama.",
  },
  {
    q: "Bagaimana SONAR memastikan kesesuaian antara versi PDF dan hasil review?",
    a: "Setiap dokumen menyimpan identitas versi sumber dan catatan verifikasi volunteer. Jika versi dokumen diperbarui, peringatan versi ditampilkan langsung di halaman mata kuliah dan pembaca.",
  },
  {
    q: "Apakah narasi suara mendukung Bahasa Indonesia dan Inggris?",
    a: "Ya. Pemutar audio pembaca dan pengaturan aksesibilitas mendukung pembacaan dokumen maupun narasi rumus matematika dalam Bahasa Indonesia dan Bahasa Inggris.",
  },
];

export default function HelpCenterPage() {
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
            Pusat Bantuan &amp; Pertanyaan Umum
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Panduan penggunaan pembaca dokumen terstruktur, verifikasi volunteer, dan berbagi materi antar mahasiswa se-kelas.
          </p>
        </header>

        <section aria-labelledby="faq-heading" className="space-y-5">
          <h2 id="faq-heading" className="font-heading text-2xl font-bold text-foreground">
            Pertanyaan yang Sering Diajukan
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {FAQS.map((item) => (
              <div
                key={item.q}
                className="space-y-2 rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <h3 className="font-heading text-base font-bold text-foreground">
                  {item.q}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-4 rounded-3xl border border-border bg-card p-8 text-center shadow-card">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-mint text-brand-teal">
            <Mail className="size-6" aria-hidden="true" />
          </span>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Butuh Bantuan Tambahan?
          </h2>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            Hubungi tim aksesibilitas melalui{" "}
            <span className="font-semibold text-foreground">support@sonar.ac.id</span>{" "}
            atau masuk langsung ke workspace Anda.
          </p>
          <div className="pt-1 font-ui">
            <Button asChild size="lg" className="min-h-11 rounded-full px-6 font-semibold">
              <Link href="/login">Masuk ke Workspace</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
