"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/use-translation";

interface ReaderEmptyStateProps {
  type?: "no_documents" | "not_found";
}

export function ReaderEmptyState({ type = "no_documents" }: ReaderEmptyStateProps) {
  const { t, isEn } = useTranslation();

  if (type === "not_found") {
    return (
      <div className="w-full max-w-4xl py-6">
        <h1 className="sr-only">
          {isEn ? "Document unavailable" : "Dokumen tidak dapat dimuat"}
        </h1>
        <EmptyState
          icon={BookOpen}
          title={isEn ? "Document could not be loaded" : "Dokumen tidak dapat dimuat"}
          description={
            isEn
              ? "Select course materials from the catalog to open them."
              : "Pilih materi dari katalog mata kuliah untuk membukanya."
          }
          action={
            <Button asChild className="rounded-full">
              <Link href="/courses">{isEn ? "View Courses" : "Lihat Mata Kuliah"}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl py-6">
      <h1 className="sr-only">
        {isEn ? "Document Reader" : "Pembaca Dokumen"}
      </h1>
      <EmptyState
        icon={BookOpen}
        title={t("readerEmptyTitle")}
        description={t("readerEmptyDesc")}
        action={
          <Button asChild className="rounded-full">
            <Link href="/upload">{t("readerUploadAction")}</Link>
          </Button>
        }
      />
    </div>
  );
}
