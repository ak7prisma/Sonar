import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ClipboardList, ShieldAlert } from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { ReviewWorkbench } from "@/components/reviewer/ReviewWorkbench";
import { Button } from "@/components/ui/button";
import { loadDocumentDetail } from "@/lib/data/workspace";
import { formatPageCount, formatVersion } from "@/lib/format";

export const metadata: Metadata = {
  title: "Tinjau Dokumen",
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
      <div className="mx-auto max-w-2xl py-8">
        <h1 className="sr-only">Dokumen tidak ditemukan</h1>
        <EmptyState
          icon={ClipboardList}
          title="Dokumen tidak tersedia untuk ditinjau"
          description="Pastikan dokumen ada di mata kuliah yang Anda kelola atau periksa kembali daftar antrean review."
          action={
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/review">Kembali ke antrean review</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const canReview = detail.viewerRoles.some(
    (role) => role === "reviewer" || role === "volunteer" || role === "admin"
  );

  if (!canReview) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <h1 className="sr-only">Akses review ditolak</h1>
        <EmptyState
          icon={ShieldAlert}
          title="Halaman ini khusus untuk volunteer dan administrator"
          description="Akun mahasiswa dapat membaca dan mengunduh materi terverifikasi melalui katalog mata kuliah dan halaman pembaca."
          action={
            <Button asChild className="rounded-full">
              <Link href="/dashboard">Kembali ke dashboard</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const courseLabel = detail.course ? detail.course.code : detail.document.course_id.toUpperCase();

  return (
    <div className="mx-auto max-w-7xl space-y-6 font-sans">
      <PageHeader
        backHref="/review"
        backLabel="Antrean Review"
        title={detail.document.title}
        description={`${courseLabel} · Versi ${formatVersion(detail.document.current_version_id)} · ${formatPageCount(detail.document.page_count)}`}
      />

      <ReviewWorkbench
        document={detail.document}
        initialBlocks={detail.blocks}
        equations={detail.equations}
        tables={detail.tables}
        figures={detail.figures}
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
    <WorkspaceShell>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground font-ui">
            Memuat editor review…
          </p>
        }
      >
        <ReviewDetailBody params={params} />
      </Suspense>
    </WorkspaceShell>
  );
}
