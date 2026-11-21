"use client";

import Link from "next/link";
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
      className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center outline-none"
    >
      <div className="max-w-md space-y-4 rounded-2xl border bg-card p-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Something went wrong (500)
        </h1>
        <p className="text-sm text-muted-foreground" role="alert">
          {error.message || "An unexpected server or rendering error occurred."}
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Return home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
