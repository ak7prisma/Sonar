"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center font-sans outline-none"
    >
      <div className="max-w-md space-y-4 rounded-3xl border border-border bg-card p-8 shadow-card">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-tint-peach text-brand-ink">
          <AlertTriangle className="size-6" aria-hidden="true" />
        </span>
        <h1 className="font-heading text-2xl font-extrabold text-foreground">
          Terjadi Kendala (500)
        </h1>
        <p className="text-sm text-muted-foreground" role="alert">
          {error.message || "Terjadi kesalahan tak terduga saat memuat halaman ini."}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-1 font-ui">
          <Button onClick={reset} className="min-h-10 rounded-full px-5 font-semibold">
            Coba Lagi
          </Button>
          <Button
            variant="outline"
            asChild
            className="min-h-10 rounded-full px-5 font-semibold"
          >
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
