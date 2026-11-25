import * as React from "react";
import Link from "next/link";
import { SonarLogo } from "@/components/shared/SonarLogo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

interface AuthCardLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthCardLayout({
  title,
  description,
  children,
}: AuthCardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
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
        <div className="w-full max-w-md space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
          <div className="space-y-1.5">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
