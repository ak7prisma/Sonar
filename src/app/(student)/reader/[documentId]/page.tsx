import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { AccessibleReaderStudio } from "@/components/document/AccessibleReaderStudio";
import { Button } from "@/components/ui/button";
import { loadDocumentDetail } from "@/lib/data/workspace";
import { isAiConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Document Reader",
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
      <div className="mx-auto max-w-2xl space-y-4 rounded-xl border bg-card p-8 text-center">
        <h1 className="font-heading text-2xl font-bold">
          Document unavailable or access denied
        </h1>
        <p className="text-sm text-muted-foreground">
          You may only open documents belonging to your enrolled courses or
          explicitly shared with your account.
        </p>
        <Button asChild>
          <Link href="/reader">Return to reader workspace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
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
      />
    </div>
  );
}

export default function ReaderDetailPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  return (
    <WorkspaceShell pageSectionLabel="Document Reader">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading document...</p>}>
        <ReaderDetailBody params={params} />
      </Suspense>
    </WorkspaceShell>
  );
}
