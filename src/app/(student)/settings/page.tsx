import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { PageHeader } from "@/components/app/PageHeader";
import { PreferencesForm } from "@/components/settings/PreferencesForm";
import { getAuthenticatedContext } from "@/lib/supabase/auth-helpers";

export const metadata: Metadata = {
  title: "Pengaturan Membaca & Aksesibilitas",
};

async function SettingsBody() {
  await connection();
  const { auth } = await getAuthenticatedContext();

  return (
    <div className="mx-auto max-w-4xl space-y-6 font-sans">
      <PageHeader
        title="Pengaturan Membaca & Aksesibilitas"
        description="Perubahan berlaku langsung di seluruh halaman pembaca dan tersimpan di peramban maupun profil akun Anda."
      />

      <PreferencesForm isAuthenticated={Boolean(auth)} />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <WorkspaceShell>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground font-ui">
            Memuat pengaturan aksesibilitas…
          </p>
        }
      >
        <SettingsBody />
      </Suspense>
    </WorkspaceShell>
  );
}
