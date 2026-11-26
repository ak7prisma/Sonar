import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { SettingsSkeleton } from "@/components/skeletons/PageSkeletons";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { PreferencesForm } from "@/components/settings/PreferencesForm";
import { getAuthenticatedContext } from "@/lib/supabase/auth-helpers";

export const metadata: Metadata = {
  title: "Pengaturan Membaca & Aksesibilitas",
};

async function SettingsBody() {
  await connection();
  const { auth } = await getAuthenticatedContext();

  return (
    <div className="w-full max-w-5xl space-y-6 font-sans">
      <SettingsPageHeader />

      <PreferencesForm isAuthenticated={Boolean(auth)} />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <WorkspaceShell>
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsBody />
      </Suspense>
    </WorkspaceShell>
  );
}
