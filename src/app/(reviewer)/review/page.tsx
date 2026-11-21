import { Suspense } from "react";
import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { ReviewQueueTable } from "@/components/reviewer/ReviewQueueTable";
import { loadWorkspaceSnapshot, FALLBACK_DOCUMENTS } from "@/lib/data/workspace";

export const metadata: Metadata = {
  title: "Volunteer Review Queue & Overview",
};

async function ReviewQueueBody() {
  const snapshot = await loadWorkspaceSnapshot();
  const allDocs = snapshot.documents.length > 0 ? snapshot.documents : FALLBACK_DOCUMENTS;

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-sans">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-b border-border pb-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-blue-strong dark:text-brand-blue font-ui">
            Volunteer Quality Assurance &amp; Verification
          </span>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Antrean Review &amp; Ikhtisar Kualitas Dokumen
          </h1>
          <p className="text-sm text-muted-foreground font-sans max-w-3xl">
            Periksa hasil ekstraksi OCR, rumus matematika MathML, dan deskripsi taktil gambar.
            Dokumen yang Anda setujui akan langsung tersedia untuk seluruh mahasiswa se-kelas.
          </p>
        </div>
      </div>

      <ReviewQueueTable documents={allDocs} />
    </div>
  );
}

export default function ReviewQueuePage() {
  return (
    <WorkspaceShell pageSectionLabel="Volunteer Review Queue">
      <Suspense fallback={<p className="text-sm text-muted-foreground font-ui">Memuat antrean review...</p>}>
        <ReviewQueueBody />
      </Suspense>
    </WorkspaceShell>
  );
}
