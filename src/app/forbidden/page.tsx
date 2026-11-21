import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SonarLogo } from "@/components/shared/SonarLogo";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center border-b px-6">
        <Link href="/" aria-label="SONAR home page">
          <SonarLogo size="sm" />
        </Link>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-1 flex-col items-center justify-center px-4 text-center outline-none"
      >
        <div className="max-w-md space-y-4">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Access denied (403)
          </h1>
          <p className="text-sm text-muted-foreground">
            Your account does not have permission to open this course material
            or administrative workspace.
          </p>
          <Button asChild>
            <Link href="/dashboard">Return to dashboard</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
