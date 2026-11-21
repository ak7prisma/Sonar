import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { ReviewWorkbench } from "@/components/reviewer/ReviewWorkbench";
import { Button } from "@/components/ui/button";
import { loadDocumentDetail } from "@/lib/data/workspace";

export const metadata: Metadata = {
  title: "Review Document",
};

async function ReviewDetailBody({
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
          Document not available for review
        </h1>
        <p className="text-sm text-muted-foreground">
          Ensure Supabase is configured and your account has volunteer reviewer
          or admin permissions for this course.
        </p>
        <Button asChild variant="outline">
          <Link href="/review">Return to review queue</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div>
        <Link
          href="/review"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-teal-text hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span>Back to review queue</span>
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">
          Audit &amp; Verify: {detail.document.title}
        </h1>
      </div>

      <ReviewWorkbench
        document={detail.document}
        initialBlocks={detail.blocks}
        equations={detail.equations}
      />
    </div>
  );
}

export default function ReviewDetailPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  return (
    <WorkspaceShell pageSectionLabel="Document Audit & Review">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading review editor...</p>}>
        <ReviewDetailBody params={params} />
      </Suspense>
    </WorkspaceShell>
  );
}
