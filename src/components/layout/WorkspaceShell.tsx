import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getAuthenticatedContext } from "@/lib/supabase/auth-helpers";
import { getCurrentAppUser } from "@/lib/auth/session";

async function AuthenticatedAppShell({ children }: { children: React.ReactNode }) {
  const [{ auth }, demoUser] = await Promise.all([
    getAuthenticatedContext(),
    getCurrentAppUser(),
  ]);

  const userName = auth?.fullName ?? demoUser?.name ?? null;
  const userEmail = auth?.email ?? demoUser?.email ?? null;
  const userRoles = auth?.roles ?? (demoUser ? [demoUser.role] : ["student" as const]);

  return (
    <AppShell userName={userName} userEmail={userEmail} userRoles={userRoles}>
      {children}
    </AppShell>
  );
}

export function WorkspaceShell({
  children,
}: {
  children: React.ReactNode;
  /** Kept for call-site compatibility; the page H1 now carries the page title. */
  pageSectionLabel?: string;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <main
            id="main-content"
            tabIndex={-1}
            className="p-6 text-sm text-muted-foreground outline-none"
          >
            Memuat…
          </main>
        </div>
      }
    >
      <AuthenticatedAppShell>{children}</AuthenticatedAppShell>
    </Suspense>
  );
}
