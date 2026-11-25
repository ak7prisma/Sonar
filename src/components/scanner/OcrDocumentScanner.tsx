"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Headphones,
  Loader2,
  ScanText,
  Sparkles,
  Square,
  Upload,
  Volume2,
  X,
} from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";
import { validatePdfFile } from "@/lib/upload/pdf-validation";
import { formatFileSize } from "@/lib/format";
import type { CourseRow } from "@/lib/data/workspace";
import type { ExtractedBlockOutput } from "@/features/ocr/ocr-provider";

interface OcrDocumentScannerProps {
  courses: CourseRow[];
  defaultCourseId?: string;
}

interface ScanResultData {
  documentId: string;
  documentTitle: string;
  confidence: number;
  blocks: ExtractedBlockOutput[];
  stats: {
    totalBlocks: number;
    headingsCount: number;
    paragraphsCount: number;
    equationsCount: number;
    tablesCount: number;
    figuresCount: number;
  };
}

export function OcrDocumentScanner({
  courses,
  defaultCourseId,
}: OcrDocumentScannerProps) {
  const { announce } = useLiveAnnouncer();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialCourse =
    defaultCourseId && courses.some((c) => c.id === defaultCourseId)
      ? defaultCourseId
      : (courses[0]?.id ?? "");

  const [courseId, setCourseId] = useState(initialCourse);
  const [language, setLanguage] = useState<"id" | "en">("id");
  const [documentTitle, setDocumentTitle] = useState("");
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStageMessage, setScanStageMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentlyPlayingIndex, setCurrentlyPlayingIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const clearSelection = () => {
    setSelectedPdfFile(null);
    setPdfDataUrl(null);
    setScanResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = async (file: File | undefined) => {
    if (!file) return;
    setErrorMessage(null);
    setScanResult(null);
    setScanProgress(0);
    setScanStageMessage("");

    const validation = await validatePdfFile(file);
    if (!validation.ok) {
      setErrorMessage(validation.message);
      announce(validation.message, "assertive");
      clearSelection();
      return;
    }

    setSelectedPdfFile(file);
    if (!documentTitle.trim()) {
      setDocumentTitle(file.name.replace(/\.pdf$/i, ""));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      if (typeof dataUrl === "string") {
        setPdfDataUrl(dataUrl);
        announce(`Berkas PDF ${file.name} siap dipindai.`, "polite");
      }
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
    noClick: true,
    noKeyboard: true,
    onDrop: (accepted) => {
      if (accepted[0]) void handleFileSelect(accepted[0]);
    },
    onDropRejected: () => {
      const msg = "Format tidak didukung. Pemindaian OCR hanya menerima berkas PDF (.pdf).";
      setErrorMessage(msg);
      announce(msg, "assertive");
      clearSelection();
    },
  });

  const executeOcrScan = async () => {
    if (!pdfDataUrl || !selectedPdfFile) {
      const msg = "Pilih berkas dokumen PDF terlebih dahulu sebelum memindai.";
      setErrorMessage(msg);
      announce(msg, "assertive");
      return;
    }

    let progressTimer: ReturnType<typeof setInterval> | null = null;

    try {
      setScanning(true);
      setScanProgress(12);
      setScanStageMessage("Membaca halaman PDF & mengonfigurasi model AI Vision...");
      setErrorMessage(null);
      announce("Memulai ekstraksi OCR dan konversi MathML…", "polite");

      progressTimer = setInterval(() => {
        setScanProgress((prev) => {
          if (prev < 35) {
            setScanStageMessage("Menganalisis hierarki heading, paragraf, dan tata letak halaman...");
            return prev + 6;
          }
          if (prev < 65) {
            setScanStageMessage("Mendeteksi formula matematika & mengonversi ke MathML standar...");
            return prev + 5;
          }
          if (prev < 85) {
            setScanStageMessage("Menyusun tabel matriks semantik & deskripsi visual...");
            return prev + 3;
          }
          if (prev < 96) {
            setScanStageMessage("Menghasilkan audio narasi lisan dan mengindeks dokumen...");
            return prev + 1;
          }
          return prev;
        });
      }, 400);

      const response = await fetch("/api/ocr/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: pdfDataUrl,
          courseId,
          language,
          title:
            documentTitle.trim() || selectedPdfFile.name.replace(/\.pdf$/i, ""),
        }),
      });

      const data = (await response.json()) as ScanResultData & { error?: string };

      if (progressTimer) clearInterval(progressTimer);

      if (!response.ok || data.error) {
        throw new Error(data.error ?? "Gagal memindai dokumen PDF.");
      }

      setScanProgress(100);
      setScanStageMessage("Konversi OCR selesai! Menyajikan struktur dokumen aksesibel...");

      setTimeout(() => {
        setScanResult(data);
        announce(
          `Pemindaian selesai. Terdeteksi ${data.stats.totalBlocks} blok materi.`,
          "polite"
        );
      }, 350);
    } catch (err) {
      if (progressTimer) clearInterval(progressTimer);
      setScanProgress(0);
      setScanStageMessage("");
      const msg =
        err instanceof Error ? err.message : "Gagal memproses pemindaian OCR.";
      setErrorMessage(msg);
      announce(msg, "assertive");
    } finally {
      setTimeout(() => {
        setScanning(false);
      }, 400);
    }
  };

  const speakText = (text: string, blockIdx?: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      announce("Peramban tidak mendukung sintesis suara.", "assertive");
      return;
    }

    window.speechSynthesis.cancel();
    if (isPlayingAudio && currentlyPlayingIndex === blockIdx) {
      setIsPlayingAudio(false);
      setCurrentlyPlayingIndex(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "id" ? "id-ID" : "en-US";
    utterance.rate = 1.0;

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      if (typeof blockIdx === "number") setCurrentlyPlayingIndex(blockIdx);
    };
    utterance.onend = () => {
      setIsPlayingAudio(false);
      setCurrentlyPlayingIndex(null);
    };
    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setCurrentlyPlayingIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const speakAllDocument = () => {
    if (!scanResult || scanResult.blocks.length === 0) return;
    const fullText = scanResult.blocks
      .map((b) => b.spokenText || b.contentText)
      .join(". ");
    speakText(fullText, -1);
  };

  const stopAllAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setCurrentlyPlayingIndex(null);
  };

  return (
    <div className="space-y-6 font-sans">
      <div
        aria-busy={scanning}
        className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-7 space-y-5"
      >
        {errorMessage ? (
          <Alert variant="destructive" role="alert">
            <AlertCircle className="size-4" aria-hidden="true" />
            <AlertTitle>Kesalahan pemindaian</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3 font-ui">
          <div className="space-y-1.5">
            <Label htmlFor="ocr-course">Mata kuliah</Label>
            <select
              id="ocr-course"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} — {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ocr-lang">Bahasa narasi</Label>
            <select
              id="ocr-lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value as "id" | "en")}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
            >
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ocr-title">Judul bacaan</Label>
            <Input
              id="ocr-title"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="Misalnya: Catatan Integral Lipat"
              className="h-10 rounded-xl"
            />
          </div>
        </div>

        <div
          {...getRootProps()}
          className={cn(
            "rounded-2xl border-2 border-dashed p-6 transition-colors",
            isDragActive
              ? "border-primary bg-brand-mint/50"
              : selectedPdfFile
                ? "border-border bg-surface-subtle/60"
                : "border-border bg-surface-subtle/40 hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} aria-hidden="true" tabIndex={-1} />
          <input
            ref={fileInputRef}
            id="ocr-pdf-input"
            type="file"
            accept=".pdf,application/pdf"
            aria-label="Pilih berkas PDF untuk dipindai cepat"
            className="sr-only"
            onChange={(e) => void handleFileSelect(e.target.files?.[0])}
          />

          {!selectedPdfFile ? (
            <div className="flex flex-col items-center gap-3 py-3 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-tint-blue text-brand-blue-strong">
                <Upload className="size-5" aria-hidden="true" />
              </span>
              <div className="space-y-1">
                <p className="font-heading text-base font-bold text-foreground">
                  Pilih berkas PDF hasil pindai
                </p>
                <p className="text-sm text-muted-foreground">
                  Ekstraksi teks, rumus MathML, dan tabel langsung untuk dibaca atau didengarkan.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 min-h-10 rounded-full border-border bg-card px-5 font-ui text-sm font-semibold hover:bg-brand-mint hover:text-brand-ink"
              >
                Pilih Berkas PDF
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-xs">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-tint-blue text-brand-blue-strong">
                    {scanning ? (
                      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                    ) : (
                      <FileText className="size-5" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground font-ui">
                      {selectedPdfFile.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground font-ui">
                      <span className="rounded-md bg-brand-mint px-1.5 py-0.5 font-semibold text-brand-ink">
                        PDF
                      </span>
                      <span>
                        {scanning ? "Memindai…" : formatFileSize(selectedPdfFile.size)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-ui">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={scanning}
                    onClick={() => fileInputRef.current?.click()}
                    className="min-h-10 rounded-full px-4 text-xs"
                  >
                    Ganti berkas
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={scanning}
                    aria-label="Hapus berkas PDF"
                    onClick={clearSelection}
                    className="size-10 rounded-full text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {/* Live Loading Progress Bar during OCR Conversion */}
              {scanning && (
                <div
                  role="status"
                  aria-live="polite"
                  aria-label="Status konversi dokumen OCR"
                  className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3 text-left shadow-xs transition-all"
                >
                  <div className="flex items-center justify-between text-xs font-ui">
                    <div className="flex items-center gap-2 text-primary font-bold min-w-0">
                      <Sparkles className="size-4 animate-spin text-primary shrink-0" aria-hidden="true" />
                      <span className="truncate">{scanStageMessage}</span>
                    </div>
                    <span className="font-mono font-bold text-foreground bg-primary/15 px-2 py-0.5 rounded-full text-[11px] shrink-0">
                      {scanProgress}%
                    </span>
                  </div>

                  <Progress
                    value={scanProgress}
                    aria-label={`Progres konversi OCR: ${scanProgress}%`}
                    className="h-2.5 rounded-full bg-muted/80"
                  />

                  <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-ui text-center">
                    <span
                      className={`py-1 px-1 rounded transition-colors ${
                        scanProgress >= 25
                          ? "bg-primary/20 text-primary font-bold border border-primary/30"
                          : "bg-muted/70 text-muted-foreground border border-transparent"
                      }`}
                    >
                      1. Analisis Visual
                    </span>
                    <span
                      className={`py-1 px-1 rounded transition-colors ${
                        scanProgress >= 60
                          ? "bg-primary/20 text-primary font-bold border border-primary/30"
                          : "bg-muted/70 text-muted-foreground border border-transparent"
                      }`}
                    >
                      2. Rumus MathML
                    </span>
                    <span
                      className={`py-1 px-1 rounded transition-colors ${
                        scanProgress >= 85
                          ? "bg-primary/20 text-primary font-bold border border-primary/30"
                          : "bg-muted/70 text-muted-foreground border border-transparent"
                      }`}
                    >
                      3. Narasi Suara
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end font-ui">
          <Button
            type="button"
            size="lg"
            disabled={!pdfDataUrl || scanning}
            onClick={executeOcrScan}
            className="min-h-11 rounded-full px-6 text-sm font-semibold shadow-xs"
          >
            {scanning ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <ScanText className="size-4" aria-hidden="true" />
            )}
            <span>{scanning ? "Memindai…" : "Mulai Pindai OCR"}</span>
          </Button>
        </div>
      </div>

      {scanResult ? (
        <section
          aria-label="Hasil pemindaian dokumen"
          className="space-y-5 rounded-3xl border border-border bg-card p-5 shadow-card sm:p-7"
        >
          <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
                <h2 className="font-heading text-lg font-bold text-foreground">
                  {scanResult.documentTitle}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground font-ui">
                Tingkat keyakinan ekstraksi: {Math.round(scanResult.confidence)}%
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-ui">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={isPlayingAudio ? stopAllAudio : speakAllDocument}
                className="min-h-10 rounded-full px-4 text-xs font-semibold"
              >
                {isPlayingAudio ? (
                  <>
                    <Square className="size-3.5" aria-hidden="true" />
                    <span>Hentikan Suara</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="size-3.5" aria-hidden="true" />
                    <span>Dengarkan Semua</span>
                  </>
                )}
              </Button>

              <Button
                asChild
                size="sm"
                className="min-h-10 rounded-full px-4 text-xs font-semibold"
              >
                <Link href={`/reader/${scanResult.documentId}`}>
                  <Headphones className="size-3.5" aria-hidden="true" />
                  <span>Buka di Pembaca</span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-ui">
            <div className="rounded-2xl bg-brand-mint p-3.5 text-brand-ink">
              <p className="text-xs font-medium">Total Blok</p>
              <p className="mt-1 font-heading text-2xl font-extrabold tabular-nums">
                {scanResult.stats.totalBlocks}
              </p>
            </div>
            <div className="rounded-2xl bg-tint-blue p-3.5 text-brand-ink">
              <p className="text-xs font-medium">Heading</p>
              <p className="mt-1 font-heading text-2xl font-extrabold tabular-nums">
                {scanResult.stats.headingsCount}
              </p>
            </div>
            <div className="rounded-2xl bg-tint-peach p-3.5 text-brand-ink">
              <p className="text-xs font-medium">Rumus MathML</p>
              <p className="mt-1 font-heading text-2xl font-extrabold tabular-nums">
                {scanResult.stats.equationsCount}
              </p>
            </div>
            <div className="rounded-2xl bg-tint-gold p-3.5 text-brand-ink">
              <p className="text-xs font-medium">Tabel</p>
              <p className="mt-1 font-heading text-2xl font-extrabold tabular-nums">
                {scanResult.stats.tablesCount}
              </p>
            </div>
          </div>

          <div className="sonar-reader-prose max-w-none space-y-3">
            {scanResult.blocks.map((block, idx) => {
              const isPlayingThis =
                isPlayingAudio && currentlyPlayingIndex === idx;

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border bg-surface-subtle/50 p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 font-ui">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {block.blockType === "heading"
                        ? `Heading level ${block.headingLevel ?? 2}`
                        : block.blockType === "equation"
                          ? "Rumus Matematika"
                          : block.blockType === "table"
                            ? "Tabel Terstruktur"
                            : "Paragraf"}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        speakText(block.spokenText || block.contentText, idx)
                      }
                      className="h-9 rounded-full px-3 text-xs"
                    >
                      {isPlayingThis ? (
                        <>
                          <Square className="size-3.5" aria-hidden="true" />
                          <span>Berhenti</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="size-3.5" aria-hidden="true" />
                          <span>Dengarkan</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {block.blockType === "heading" ? (
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      {block.contentText}
                    </h3>
                  ) : block.blockType === "equation" ? (
                    <div className="space-y-2">
                      <p className="overflow-x-auto rounded-xl bg-card p-3 font-mono text-sm text-foreground">
                        {block.latex || block.contentText}
                      </p>
                      {block.spokenText ? (
                        <p className="text-sm text-muted-foreground">
                          Narasi: {block.spokenText}
                        </p>
                      ) : null}
                    </div>
                  ) : block.blockType === "table" &&
                    block.tableHeaders &&
                    block.tableRows ? (
                    <div className="overflow-x-auto rounded-xl border border-border bg-card">
                      <table className="w-full border-collapse text-left text-sm">
                        <caption className="px-3 py-2 text-left font-medium">
                          {block.contentText}
                        </caption>
                        <thead>
                          <tr className="border-b border-border bg-surface-subtle">
                            {block.tableHeaders.map((header, hIdx) => (
                              <th
                                key={hIdx}
                                scope="col"
                                className="px-3 py-2 font-semibold text-foreground"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {block.tableRows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className="border-b border-border/60 last:border-b-0"
                            >
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-3 py-2 text-foreground">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-foreground">{block.contentText}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
