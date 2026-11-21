import Link from "next/link";
import Image from "next/image";
import { HeartHandshake, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { APP_IMAGES } from "@/lib/images";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <SiteHeader />

      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 space-y-12 px-4 py-12 outline-none sm:px-8">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary font-ui">Tentang SONAR</span>
          <h1 className="font-heading text-4xl font-extrabold text-foreground sm:text-5xl">
            Menghapus Hambatan Digital di Ruang Kuliah Perguruan Tinggi
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            SONAR lahir dari kenyataan bahwa ribuan mahasiswa tunanetra di Indonesia dan seluruh dunia
            menghadapi kendala besar saat mengakses materi perkuliahan dalam format PDF hasil scan dosen,
            slide presentasi, tabel kompleks, dan rumus matematika.
          </p>
        </div>

        <div className="relative aspect-21/9 w-full overflow-hidden rounded-2xl border border-border shadow-md">
          <Image
            src={APP_IMAGES.featureStudy.src}
            alt={APP_IMAGES.featureStudy.alt}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 space-y-2">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
              <Shield className="size-5" />
            </div>
            <h2 className="font-heading text-xl font-bold text-foreground">Visi Kami</h2>
            <p className="text-sm leading-relaxed text-muted-foreground font-sans">
              Mewujudkan kesetaraan penuh bagi mahasiswa tunanetra dan low-vision dalam mengakses
              ilmu pengetahuan sains, teknologi, teknik, dan matematika (STEM) tanpa diskriminasi format.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-2">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
              <Sparkles className="size-5" />
            </div>
            <h2 className="font-heading text-xl font-bold text-foreground">Misi Kami</h2>
            <p className="text-sm leading-relaxed text-muted-foreground font-sans">
              Mengintegrasikan kecerdasan buatan multimodal berstandar tinggi dengan kepastian
              verifikasi manusia melalui volunteer reviewer demi menghasilkan materi belajar yang akurat.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-2">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
              <HeartHandshake className="size-5" />
            </div>
            <h2 className="font-heading text-xl font-bold text-foreground">Prinsip Inklusif</h2>
            <p className="text-sm leading-relaxed text-muted-foreground font-sans">
              Bukan sekadar visual yang bagus, tetapi setiap tombol, heading, rumus, dan tabel
              harus dapat dioperasikan secara mandiri hanya dengan keyboard dan pembaca layar.
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex justify-between items-center">
          <Button asChild size="lg" className="font-ui font-semibold">
            <Link href="/how-it-works">Pelajari Alur Konversi</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="font-ui font-semibold">
            <Link href="/courses">Lihat Mata Kuliah Tersedia</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
