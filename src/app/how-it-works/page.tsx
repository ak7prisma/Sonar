import Link from "next/link";
import { FileUp, Cpu, Users, BookOpen, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const STEPS = [
  {
    step: "01",
    title: "Unggah Dokumen PDF Kuliah",
    icon: FileUp,
    description:
      "Mahasiswa atau dosen mengunggah materi perkuliahan dalam format PDF (baik PDF digital dengan selectable text maupun dokumen hasil foto/scan).",
  },
  {
    step: "02",
    title: "Ekstraksi OCR & Analisis Tata Letak Semantik",
    icon: Cpu,
    description:
      "SONAR mendeteksi heading (H1, H2, H3), urutan membaca kolom majemuk, struktur tabel matriks, formula matematika LaTeX, dan grafik diagram.",
  },
  {
    step: "03",
    title: "Konversi MathML & Sintesis Audio Bilingual",
    icon: BookOpen,
    description:
      "Rumus matematika diubah menjadi kode MathML standar W3C yang didukung screen reader, serta dinarasikan dalam Bahasa Indonesia dan Inggris.",
  },
  {
    step: "04",
    title: "Verifikasi Volunteer Reviewer & QA",
    icon: Users,
    description:
      "Trained volunteer memeriksa hasil ekstraksi teks, memeriksa formula kompleks, dan memberikan persetujuan (Reviewed / Approved) dengan catatan review.",
  },
  {
    step: "05",
    title: "Publikasi ke Course Library & Reusable Sharing",
    icon: Share2,
    description:
      "Materi terverifikasi langsung masuk ke perpustakaan bersama mata kuliah tersebut sehingga seluruh mahasiswa se-kelas dapat langsung membaca tanpa perlu konversi ulang.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <SiteHeader />

      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 space-y-12 px-4 py-12 outline-none sm:px-8">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary font-ui">Alur Kerja Sistem</span>
          <h1 className="font-heading text-4xl font-extrabold text-foreground sm:text-5xl">
            Dari PDF Sulit Dibaca Menjadi Pengalaman Membaca Audio Semantik
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Pelajari bagaimana SONAR memadukan kecerdasan buatan OCR, MathML compiler, dan kontrol kualitas
            volunteer untuk menghasilkan materi kuliah yang 100% ramah teknologi asistif.
          </p>
        </div>

        <div className="space-y-6">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="flex flex-col sm:flex-row items-start gap-6 rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/50"
              >
                <div className="size-14 shrink-0 rounded-2xl bg-primary text-primary-foreground flex flex-col items-center justify-center font-heading font-extrabold text-lg shadow-sm">
                  <span>{s.step}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="size-5 text-primary" aria-hidden="true" />
                    <h2 className="font-heading text-xl font-bold text-foreground">{s.title}</h2>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground font-sans">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border bg-surface-subtle p-8 text-center space-y-4">
          <h2 className="font-heading text-2xl font-bold text-foreground">Siap Mengakses Materi Perkuliahan?</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Masuk ke akun Anda dan mulai membaca materi atau unggah modul kuliah Anda sekarang.
          </p>
          <div className="flex justify-center gap-3 pt-2 font-ui">
            <Button size="lg" asChild className="font-semibold">
              <Link href="/login">Masuk ke Platform</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="font-semibold">
              <Link href="/courses">Lihat Materi Kuliah</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
