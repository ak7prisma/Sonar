import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import { AccessibleReaderStudio } from "@/components/document/AccessibleReaderStudio";
import { loadDocumentDetail, loadWorkspaceSnapshot } from "@/lib/data/workspace";
import { getSharedMaterialById } from "@/lib/data/course-materials";
import { isAiConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Pembaca Dokumen",
};

async function ReaderIndexBody() {
  await connection();
  const snapshot = await loadWorkspaceSnapshot();
  const initialDoc =
    snapshot.documents.find((d) => d.review_status === "verified") ??
    snapshot.documents[0];

  if (!initialDoc) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="sr-only">Pembaca Dokumen</h1>
        <EmptyState
          icon={BookOpen}
          title="Belum ada dokumen untuk dibaca"
          description="Unggah berkas PDF perkuliahan atau buka salah satu mata kuliah untuk mulai membaca."
          action={
            <Button asChild className="rounded-full">
              <Link href="/upload">Unggah PDF Kuliah</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const detail = await loadDocumentDetail(initialDoc.id);
  if (!detail) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="sr-only">Pembaca Dokumen</h1>
        <EmptyState
          icon={BookOpen}
          title="Dokumen tidak dapat dimuat"
          description="Pilih materi dari katalog mata kuliah untuk membukanya."
          action={
            <Button asChild className="rounded-full">
              <Link href="/courses">Lihat Mata Kuliah</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const relatedDocuments = snapshot.documents
    .filter((d) => d.id !== detail.document.id)
    .slice(0, 6)
    .map((d) => ({
      id: d.id,
      title: d.title,
      reviewStatus: d.review_status,
    }));

  const sharedMeta = getSharedMaterialById(detail.document.id);

  return (
    <AccessibleReaderStudio
      document={detail.document}
      courseLabel={
        detail.course ? `${detail.course.code} — ${detail.course.title}` : undefined
      }
      blocks={detail.blocks}
      tables={detail.tables}
      equations={detail.equations}
      figures={detail.figures}
      signedPdfUrl={detail.signedPdfUrl}
      aiEnabled={isAiConfigured()}
      relatedDocuments={relatedDocuments}
      versionNotice={sharedMeta?.versionNotice ?? null}
    />
  );
}

export default function ReaderIndexPage() {
  return (
    <WorkspaceShell>
      <Suspense
        fallback={
          <p className="p-6 text-sm text-muted-foreground font-ui">
            Memuat pembaca dokumen…
          </p>
        }
      >
        <ReaderIndexBody />
      </Suspense>
    </WorkspaceShell>
  );
}
