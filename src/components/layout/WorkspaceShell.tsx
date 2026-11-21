import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getAuthenticatedContext } from "@/lib/supabase/auth-helpers";
import { getCurrentAppUser } from "@/lib/auth/session";

async function AuthenticatedAppShell({
  children,
  pageSectionLabel,
}: {
  children: React.ReactNode;
  pageSectionLabel?: string;
}) {
  const [{ auth }, demoUser] = await Promise.all([
    getAuthenticatedContext(),
    getCurrentAppUser(),
  ]);

  const userEmail = auth?.email ?? demoUser?.email ?? "ahmad.fauzi@student.ac.id";
  const userRoles = auth?.roles ?? (demoUser ? [demoUser.role] : ["student"]);

  return (
    <AppShell
      userEmail={userEmail}
      userRoles={userRoles}
      pageSectionLabel={pageSectionLabel}
    >
      {children}
    </AppShell>
  );
}

export function WorkspaceShell({
  children,
  pageSectionLabel,
}: {
  children: React.ReactNode;
  pageSectionLabel?: string;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <main
            id="main-content"
            tabIndex={-1}
            className="p-6 text-sm text-muted-foreground outline-none"
          >
            Memuat workspace SONAR...
          </main>
        </div>
      }
    >
      <AuthenticatedAppShell pageSectionLabel={pageSectionLabel}>
        {children}
      </AuthenticatedAppShell>
    </Suspense>
  );
}
