"use client";

import { useState } from "react";
import { Camera, FileUp, Sparkles, FileText } from "lucide-react";
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
        aria-label="Pilihan Metode Input Dokumen"
        className="flex flex-col sm:flex-row gap-2 p-1.5 bg-muted/60 rounded-2xl border border-border/80"
      >
        <button
          type="button"
          role="tab"
          id="tab-ocr"
          aria-selected={activeTab === "ocr"}
          aria-controls="panel-ocr"
          tabIndex={activeTab === "ocr" ? 0 : -1}
          onClick={() => setActiveTab("ocr")}
          className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-heading text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            activeTab === "ocr"
              ? "bg-card text-foreground shadow-sm border border-border/80"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary">
            <Camera className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span>AI OCR Scanner</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-2.5 h-2.5" aria-hidden="true" />
                Live
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-normal">
              Foto/Kamera &amp; rumus MathML langsung
            </p>
          </div>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-pdf"
          aria-selected={activeTab === "pdf"}
          aria-controls="panel-pdf"
          tabIndex={activeTab === "pdf" ? 0 : -1}
          onClick={() => setActiveTab("pdf")}
          className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-heading text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            activeTab === "pdf"
              ? "bg-card text-foreground shadow-sm border border-border/80"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <FileUp className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span>Unggah File PDF</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <FileText className="w-2.5 h-2.5" aria-hidden="true" />
                Multi-halaman
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-normal">
              Buku teks, silabus, &amp; berkas PDF lengkap
            </p>
          </div>
        </button>
      </div>

      {/* Panels */}
      <div
        role="tabpanel"
        id="panel-ocr"
        aria-labelledby="tab-ocr"
        hidden={activeTab !== "ocr"}
        className="focus:outline-none"
      >
        {activeTab === "ocr" && (
          <OcrDocumentScanner
            courses={courses}
            defaultCourseId={defaultCourseId}
          />
        )}
      </div>

      <div
        role="tabpanel"
        id="panel-pdf"
        aria-labelledby="tab-pdf"
        hidden={activeTab !== "pdf"}
        className="focus:outline-none"
      >
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
