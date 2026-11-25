import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SonarLogo } from "@/components/shared/SonarLogo";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <header className="flex h-16 items-center border-b border-border bg-card px-6">
        <Link href="/" aria-label="SONAR beranda">
          <SonarLogo size="sm" />
        </Link>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-1 flex-col items-center justify-center px-4 text-center outline-none"
      >
        <div className="max-w-md space-y-4 rounded-3xl border border-border bg-card p-8 shadow-card">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-tint-gold text-brand-ink">
            <FileQuestion className="size-6" aria-hidden="true" />
          </span>
          <h1 className="font-heading text-2xl font-extrabold text-foreground">
            Halaman Tidak Ditemukan (404)
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Materi kuliah atau halaman yang Anda cari tidak tersedia atau tidak dapat diakses dengan akun saat ini.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-1 font-ui">
            <Button asChild className="min-h-10 rounded-full px-5 font-semibold">
              <Link href="/dashboard">Ke Dashboard</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="min-h-10 rounded-full px-5 font-semibold"
            >
              <Link href="/">Beranda</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
