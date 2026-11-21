import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import type { Metadata } from "next";
import { FileUp } from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { AccessibleReaderStudio } from "@/components/document/AccessibleReaderStudio";
import { loadDocumentDetail } from "@/lib/data/workspace";

export const metadata: Metadata = {
  title: "Accessible Document Reader",
};

async function ReaderIndexBody() {
  await connection();
  const detail = await loadDocumentDetail("doc-cs-01");

  if (!detail) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <p className="text-sm text-muted-foreground">Memuat dokumen perkuliahan...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 font-sans">
      {/* Document Selector Pills (Image 2 style sessions / documents) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 font-ui">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
            Pilih Materi:
          </span>
          <Button
            size="sm"
            asChild
            variant="default"
            className="h-8 text-xs font-semibold"
          >
            <Link href="/reader/doc-cs-01">CS 201: Modul 04 AVL Trees</Link>
          </Button>
          <Button
            size="sm"
            asChild
            variant="outline"
            className="h-8 text-xs font-semibold border-border"
          >
            <Link href="/reader/doc-math-01">MATH 105: Bab 03 Turunan Parsial</Link>
          </Button>
          <Button
            size="sm"
            asChild
            variant="outline"
            className="h-8 text-xs font-semibold border-border"
          >
            <Link href="/reader/doc-stat-01">STAT 210: Handout 02 Distribusi</Link>
          </Button>
        </div>

        <Button size="sm" variant="outline" asChild className="h-8 text-xs font-semibold border-border">
          <Link href="/upload">
            <FileUp className="size-3.5 mr-1.5" />
            <span>Unggah PDF Baru</span>
          </Link>
        </Button>
      </div>

      <AccessibleReaderStudio
        document={detail.document}
        courseLabel={
          detail.course ? `${detail.course.code} &bull; ${detail.course.title}` : undefined
        }
        blocks={detail.blocks}
        tables={detail.tables}
        equations={detail.equations}
        figures={detail.figures}
        aiEnabled={true}
      />
    </div>
  );
}

export default function ReaderIndexPage() {
  return (
    <WorkspaceShell pageSectionLabel="Accessible Document Reader">
      <Suspense fallback={<p className="text-sm text-muted-foreground font-ui">Memuat pembaca dokumen...</p>}>
        <ReaderIndexBody />
      </Suspense>
    </WorkspaceShell>
  );
}
