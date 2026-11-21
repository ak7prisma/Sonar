import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SonarLogo } from "@/components/shared/SonarLogo";

const FAQS = [
  {
    q: "Bagaimana cara membaca materi perkuliahan menggunakan screen reader?",
    a: "Buka halaman Reader, gunakan tombol Tab untuk menavigasi ke kontrol audio atau gunakan heading shortcut (tombol H di NVDA/JAWS) untuk melompat langsung antar bab dan subbab materi.",
  },
  {
    q: "Apa perbedaan antara Dokumen Pribadi dan Materi Reusable?",
    a: "Dokumen Pribadi hanya dapat diakses oleh Anda sendiri. Materi Reusable adalah dokumen yang telah Anda ajukan untuk direview oleh volunteer, diverifikasi kualitasnya, lalu dibagikan ke seluruh rekan sekelas yang terdaftar dalam mata kuliah yang sama.",
  },
  {
    q: "Bagaimana jika ada rumus matematika atau tabel yang salah dibacakan?",
    a: "Di setiap blok paragraf, tabel, atau rumus pada Document Reader terdapat tombol 'Laporkan Masalah (Report Issue)'. Anda dapat memilih kategori kendala (OCR, tabel, rumus, atau deskripsi gambar) dan volunteer akan segera meninjaunya.",
  },
  {
    q: "Apakah SONAR mendukung bahasa Indonesia dan bahasa Inggris?",
    a: "Ya. Narasi rumus matematika dan sintesis suara audio reader mendukung penuh pengucapan istilah teknis dalam Bahasa Indonesia dan Bahasa Inggris.",
  },
];

export default function HelpCenterPage() {
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
          <span className="text-xs font-bold uppercase tracking-wider text-primary font-ui">Help Center &amp; Panduan</span>
          <h1 className="font-heading text-4xl font-extrabold text-foreground sm:text-5xl">
            Pusat Bantuan &amp; Pertanyaan Umum (FAQ)
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Temukan panduan praktis penggunaan fitur SONAR, cara menavigasi dokumen dengan teknologi asistif,
            serta langkah melaporkan isu aksesibilitas.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="font-heading text-2xl font-bold text-foreground">Pertanyaan yang Sering Diajukan</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FAQS.map((item, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-2">
                <h3 className="font-heading text-base font-bold text-foreground">{item.q}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground font-sans">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface-subtle p-8 text-center space-y-4">
          <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Mail className="size-6" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Butuh Bantuan Khusus?</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Tim dukungan aksesibilitas kami siap membantu Anda atau kampus Anda. Hubungi kami melalui email
            di <span className="font-semibold text-foreground">support@sonar.ac.id</span>
          </p>
          <div className="pt-2 font-ui">
            <Button asChild size="lg" className="font-semibold">
              <Link href="/login">Buka Workspace Mahasiswa</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
