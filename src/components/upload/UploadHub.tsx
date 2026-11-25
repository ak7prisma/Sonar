"use client";

import { useState } from "react";
import { cn } from "cn";
import type { CourseRow } from "@/lib/data/workspace";
import { OcrDocumentScanner } from "@/components/scanner/OcrDocumentScanner";
import { UploadForm } from "@/components/documents/UploadForm";

interface UploadHubProps {
  courses: CourseRow[];
  defaultCourseId?: string;
  initialMode?: "ocr" | "pdf";
}

export function UploadHub({
  courses,
  defaultCourseId,
  initialMode = "pdf",
}: UploadHubProps) {
  const [activeTab, setActiveTab] = useState<"pdf" | "ocr">(initialMode);

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveTab((prev) => (prev === "pdf" ? "ocr" : "pdf"));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="Metode pemrosesan dokumen"
          className="inline-flex rounded-full border border-border bg-card p-1 shadow-xs font-ui"
        >
          <button
            type="button"
            role="tab"
            id="tab-pdf"
            aria-selected={activeTab === "pdf"}
            aria-controls="panel-pdf"
            tabIndex={activeTab === "pdf" ? 0 : -1}
            onClick={() => setActiveTab("pdf")}
            onKeyDown={handleTabKeyDown}
            className={cn(
              "min-h-10 rounded-full px-5 text-sm font-semibold transition-colors",
              activeTab === "pdf"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Unggah &amp; Bagikan
          </button>

          <button
            type="button"
            role="tab"
            id="tab-ocr"
            aria-selected={activeTab === "ocr"}
            aria-controls="panel-ocr"
            tabIndex={activeTab === "ocr" ? 0 : -1}
            onClick={() => setActiveTab("ocr")}
            onKeyDown={handleTabKeyDown}
            className={cn(
              "min-h-10 rounded-full px-5 text-sm font-semibold transition-colors",
              activeTab === "ocr"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Pindai Cepat
          </button>
        </div>
      </div>

      <div
        role="tabpanel"
        id="panel-pdf"
        aria-labelledby="tab-pdf"
        hidden={activeTab !== "pdf"}
      >
        {activeTab === "pdf" ? (
          <UploadForm courses={courses} defaultCourseId={defaultCourseId} />
        ) : null}
      </div>

      <div
        role="tabpanel"
        id="panel-ocr"
        aria-labelledby="tab-ocr"
        hidden={activeTab !== "ocr"}
      >
        {activeTab === "ocr" ? (
          <OcrDocumentScanner
            courses={courses}
            defaultCourseId={defaultCourseId}
          />
        ) : null}
      </div>

      <p className="text-center text-xs text-muted-foreground font-ui">
        Dokumen diekstrak menjadi teks, tabel, dan MathML, lalu ditinjau volunteer sebelum dibagikan ke mahasiswa kelas ini.
      </p>
    </div>
  );
}
