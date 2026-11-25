import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { ReaderSkeleton } from "@/components/skeletons/PageSkeletons";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import { AccessibleReaderStudio } from "@/components/document/AccessibleReaderStudio";
import {
  loadDocumentDetail,
  loadRelatedDocuments,
} from "@/lib/data/workspace";
import { getSharedMaterialById } from "@/lib/data/course-materials";
import { isAiConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Pembaca Dokumen",
};

async function ReaderDetailBody({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  const detail = await loadDocumentDetail(documentId);

  if (!detail) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 space-y-4">
        <h1 className="sr-only">Dokumen tidak tersedia</h1>
        <EmptyState
          icon={BookOpen}
          title="Dokumen tidak tersedia atau akses ditolak"
          description="Anda hanya dapat membuka dokumen dari mata kuliah yang Anda ikuti atau yang dibagikan ke akun Anda."
          action={
            <Button asChild className="rounded-full">
              <Link href="/reader">Kembali ke pembaca</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const relatedDocuments = detail.course
    ? await loadRelatedDocuments(detail.course.id, detail.document.id)
    : [];

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

export default function ReaderDetailPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  return (
    <WorkspaceShell>
      <Suspense fallback={<ReaderSkeleton />}>
        <ReaderDetailBody params={params} />
      </Suspense>
    </WorkspaceShell>
  );
}
