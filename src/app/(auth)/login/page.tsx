import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SonarLogo } from "@/components/shared/SonarLogo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Masuk ke Akun",
};

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const params = await searchParams;
  return <AuthForm mode="login" redirectTo={params.redirectTo} />;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle font-sans">
      <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
        <Link href="/" aria-label="SONAR beranda">
          <SonarLogo size="sm" />
        </Link>
        <ThemeToggle />
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-1 items-center justify-center px-4 py-12 outline-none"
      >
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="space-y-1.5">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              Masuk ke SONAR
            </h1>
            <p className="text-xs text-muted-foreground font-ui">
              Akses materi perkuliahan, audio reader sinkron, dan ruang review volunteer.
            </p>
          </div>

          <Suspense fallback={<div className="p-4 text-xs text-muted-foreground">Memuat formulir masuk...</div>}>
            <LoginContent searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
