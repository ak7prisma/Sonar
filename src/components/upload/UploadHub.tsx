"use client";

import { useState } from "react";
import { FileUp, Sparkles } from "lucide-react";
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
  initialMode = "ocr",
}: UploadHubProps) {
  const [activeTab, setActiveTab] = useState<"ocr" | "pdf">(initialMode);

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div
        role="tablist"
        aria-label="Pilihan mode pemrosesan materi kuliah"
        className="inline-flex flex-wrap rounded-2xl border border-border bg-card p-1.5 shadow-xs font-ui"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "ocr"}
          aria-controls="panel-ocr"
          onClick={() => setActiveTab("ocr")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold transition-all",
            activeTab === "ocr"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Sparkles className="size-4 shrink-0" aria-hidden="true" />
          <span>Pindai &amp; Analisis OCR AI</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "pdf"}
          aria-controls="panel-pdf"
          onClick={() => setActiveTab("pdf")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold transition-all",
            activeTab === "pdf"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <FileUp className="size-4 shrink-0" aria-hidden="true" />
          <span>Unggah Berkas PDF ke Mata Kuliah</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div id="panel-ocr" role="tabpanel" hidden={activeTab !== "ocr"}>
        {activeTab === "ocr" && (
          <OcrDocumentScanner
            courses={courses}
            defaultCourseId={defaultCourseId}
          />
        )}
      </div>

      <div id="panel-pdf" role="tabpanel" hidden={activeTab !== "pdf"}>
        {activeTab === "pdf" && (
          <UploadForm
            courses={courses}
            defaultCourseId={defaultCourseId}
          />
        )}
      </div>
    </div>
  );
}
