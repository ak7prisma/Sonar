import { Suspense } from "react";
import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { PreferencesForm } from "@/components/settings/PreferencesForm";
import { getAuthenticatedContext } from "@/lib/supabase/auth-helpers";

export const metadata: Metadata = {
  title: "Accessibility & Preferences",
};

async function SettingsBody() {
  const { auth } = await getAuthenticatedContext();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Accessibility &amp; Reading Preferences
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Settings apply immediately across the reader and persist locally as
          well as in your private user profile when signed in.
        </p>
      </div>

      <PreferencesForm isAuthenticated={Boolean(auth)} />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <WorkspaceShell pageSectionLabel="Preferences">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading preferences...</p>}>
        <SettingsBody />
      </Suspense>
    </WorkspaceShell>
  );
}
