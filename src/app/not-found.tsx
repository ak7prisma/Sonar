import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SonarLogo } from "@/components/shared/SonarLogo";

export default function NotFoundPage() {
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
            Page not found (404)
          </h1>
          <p className="text-sm text-muted-foreground">
            The requested course material or workspace page could not be located
            or you may not have permission to view it.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button asChild>
              <Link href="/dashboard">Return to dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
