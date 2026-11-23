"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  FileText,
  Headphones,
  RotateCcw,
  Sparkles,
  Square,
  Table as TableIcon,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";
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
  isAiLive: boolean;
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

  const [courseId, setCourseId] = useState(
    defaultCourseId || courses[0]?.id || "cs-201"
  );
  const [language, setLanguage] = useState<"id" | "en">("id");
  const [documentTitle, setDocumentTitle] = useState("Catatan Kuliah OCR");
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentlyPlayingIndex, setCurrentlyPlayingIndex] = useState<number | null>(null);

  // Stop speech when unmounting
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleFileSelect = async (file: File | undefined) => {
    if (!file) return;
    setErrorMessage(null);
    setScanResult(null);

    const lowerName = file.name.toLowerCase();

    // Validasi ketat: HANYA BERKAS PDF
    if (!lowerName.endsWith(".pdf")) {
      const msg = `Format berkas "${file.name}" tidak diizinkan. Pemindaian OCR wajib menggunakan berkas dokumen PDF (.pdf). Format foto/gambar biasa (JPG/PNG) atau format lainnya tidak didukung.`;
      setErrorMessage(msg);
      announce(msg, "assertive");
      setSelectedPdfFile(null);
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validasi MIME type
    const allowedMimes = ["application/pdf", "application/x-pdf", ""];
    if (file.type && !allowedMimes.includes(file.type.toLowerCase())) {
      const msg = `Tipe berkas (${file.type}) tidak valid. Hanya berkas dokumen PDF (.pdf) yang diperbolehkan masuk.`;
      setErrorMessage(msg);
      announce(msg, "assertive");
      setSelectedPdfFile(null);
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validasi ukuran
    if (file.size === 0) {
      const msg = "Berkas PDF yang dipilih kosong (0 byte). Harap pilih berkas PDF materi yang valid.";
      setErrorMessage(msg);
      announce(msg, "assertive");
      setSelectedPdfFile(null);
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      const msg = "Ukuran berkas PDF melebihi batas maksimal 25 MB.";
      setErrorMessage(msg);
      announce(msg, "assertive");
      return;
    }

    // Validasi Magic Header Signature (%PDF-)
    try {
      const headerSlice = file.slice(0, 5);
      const buffer = await headerSlice.arrayBuffer();
      const header = new TextDecoder("ascii").decode(buffer);
      if (!header.startsWith("%PDF-")) {
        const msg = `Berkas "${file.name}" bukan dokumen PDF asli yang valid (signature %PDF- tidak ditemukan). Hanya berkas dokumen PDF asli yang diperbolehkan.`;
        setErrorMessage(msg);
        announce(msg, "assertive");
        setSelectedPdfFile(null);
        setPreviewImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    } catch {
      // Abaikan jika lingkungan runtime tidak mengizinkan pembacaan slice
    }

    setSelectedPdfFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewImage(dataUrl);
      if (!documentTitle || documentTitle === "Catatan Kuliah OCR") {
        setDocumentTitle(file.name.replace(/\.pdf$/i, ""));
      }
      announce(`Berkas PDF ${file.name} berhasil dimuat. Siap dipindai.`, "polite");
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSample = (sampleType: "math" | "cs") => {
    setErrorMessage(null);
    setScanResult(null);
    setSelectedPdfFile(null);

    if (sampleType === "math") {
      setCourseId(courses.find((c) => c.id === "math-105")?.id || courses[0]?.id || "math-105");
      setDocumentTitle("Bab 03: Turunan Parsial & Matriks Hessian");
      setPreviewImage("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'><rect width='800' height='400' fill='%23f8fafc'/><text x='40' y='60' font-family='sans-serif' font-size='22' font-weight='bold' fill='%230f172a'>Bab 03 — Turunan Parsial &amp; Matriks Hessian</text><text x='40' y='110' font-family='sans-serif' font-size='16' fill='%23334155'>f_xx(x, y) = d^2f / dx^2 &amp; f_yy(x, y) = d^2f / dy^2</text><text x='40' y='160' font-family='sans-serif' font-size='16' fill='%23334155'>Hessian H(f) Matrix: [[f_xx, f_xy], [f_yx, f_yy]]</text><rect x='40' y='200' width='720' height='120' fill='%23e2e8f0' rx='8'/><text x='60' y='240' font-family='sans-serif' font-size='14' font-weight='bold' fill='%230f172a'>Tabel Uji Titik Stasioner:</text><text x='60' y='275' font-family='sans-serif' font-size='14' fill='%23475569'>D = det(H) &gt; 0 &amp; f_xx &gt; 0 : Minimum Lokal</text><text x='60' y='300' font-family='sans-serif' font-size='14' fill='%23475569'>D = det(H) &lt; 0 : Titik Pelana (Saddle Point)</text></svg>");
      announce("Contoh lembar kuliah Matematika dimuat.", "polite");
    } else {
      setCourseId(courses.find((c) => c.id === "cs-201")?.id || courses[0]?.id || "cs-201");
      setDocumentTitle("Modul 04: Binary Search Trees & AVL Balancing");
      setPreviewImage("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'><rect width='800' height='400' fill='%23f8fafc'/><text x='40' y='60' font-family='sans-serif' font-size='22' font-weight='bold' fill='%230f172a'>Modul 04 — Binary Search Trees &amp; AVL Balancing</text><text x='40' y='110' font-family='sans-serif' font-size='16' fill='%23334155'>Kompleksitas Pencarian BST Kasus Rata-rata: O(log n)</text><text x='40' y='160' font-family='sans-serif' font-size='16' fill='%23334155'>Relasi Rekursi: T(n) = 2T(n/2) + O(n)</text><rect x='40' y='200' width='720' height='120' fill='%23e2e8f0' rx='8'/><text x='60' y='240' font-family='sans-serif' font-size='14' font-weight='bold' fill='%230f172a'>Tabel Perbandingan Pohon Seimbang:</text><text x='60' y='275' font-family='sans-serif' font-size='14' fill='%23475569'>Operasi Search: BST O(log n) vs AVL O(log n)</text><text x='60' y='300' font-family='sans-serif' font-size='14' fill='%23475569'>Operasi Insert: BST O(n) vs AVL O(log n)</text></svg>");
      announce("Contoh lembar kuliah Struktur Data dimuat.", "polite");
    }
  };

  const executeOcrScan = async () => {
    if (!previewImage) {
      setErrorMessage("Harap pilih berkas dokumen PDF terlebih dahulu.");
      announce("Harap pilih berkas PDF terlebih dahulu.", "assertive");
      return;
    }

    try {
      setScanning(true);
      setErrorMessage(null);
      announce("Memulai analisis OCR multimodal dan ekstraksi MathML...", "polite");

      const response = await fetch("/api/ocr/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: previewImage,
          courseId,
          language,
          title: documentTitle,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error ?? "Gagal menjalankan OCR pada dokumen.");
      }

      setScanResult(data);
      announce(
        `Pemindaian OCR selesai dengan tingkat keyakinan ${data.confidence}%. Terdeteksi ${data.stats.totalBlocks} blok struktur semantik.`,
        "polite"
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memproses pemindaian OCR.";
      setErrorMessage(msg);
      announce(msg, "assertive");
    } finally {
      setScanning(false);
    }
  };

  const speakText = (text: string, blockIdx?: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      announce("Browser Anda tidak mendukung Web Speech Synthesis.", "assertive");
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

    const fullSpokenText = scanResult.blocks
      .map((b) => b.spokenText || b.contentText)
      .join(". ");

    speakText(fullSpokenText, -1);
  };

  const stopAllAudio = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setCurrentlyPlayingIndex(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Notice */}
      <div className="rounded-xl border border-primary/20 bg-brand-mint/60 dark:bg-secondary/50 p-4 font-ui">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-primary">
          <Sparkles className="size-4 shrink-0" aria-hidden="true" />
          <span>AI Multimodal Document &amp; Math OCR Scanner</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          Ambil foto materi dari kamera ponsel atau unggah scan lembar catatan. SONAR
          mengekstraksi teks berstruktur, tabel baris-kolom, dan mengonversi formula ke MathML beserta narasi suara asistif.
        </p>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Kesalahan OCR</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Configuration Controls */}
      <div className="grid gap-4 sm:grid-cols-3 font-ui">
        <div className="space-y-1.5">
          <Label htmlFor="ocr-course">Mata Kuliah Tujuan</Label>
          <select
            id="ocr-course"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} — {course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ocr-lang">Bahasa Narasi</Label>
          <select
            id="ocr-lang"
            value={language}
            onChange={(e) => setLanguage(e.target.value as "id" | "en")}
            className="w-full h-10 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="id">Bahasa Indonesia</option>
            <option value="en">English (Bilingual)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ocr-title">Judul Materi</Label>
          <input
            id="ocr-title"
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Capture & Viewfinder Area */}
      <div className="rounded-2xl border-2 border-dashed border-border bg-card p-6 text-center space-y-4">
        {previewImage ? (
          <div className="space-y-4">
            {selectedPdfFile ? (
              <div className="relative mx-auto max-w-md overflow-hidden rounded-xl border-2 border-primary/30 bg-primary/5 p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-48 shadow-sm">
                <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <FileText className="size-8" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <p className="font-heading font-bold text-foreground text-sm truncate max-w-xs">{selectedPdfFile.name}</p>
                  <p className="text-xs text-muted-foreground font-ui">
                    {(selectedPdfFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Dokumen PDF Terverifikasi
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/15 text-primary">
                    <CheckCircle2 className="size-3" aria-hidden="true" />
                    Format PDF Valid &bull; Siap Dipindai OCR
                  </span>
                </div>
                {/* Scanning Laser Animation */}
                {scanning && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_14px_rgba(20,184,166,0.9)] animate-pulse top-1/2 -translate-y-1/2" />
                )}
              </div>
            ) : (
              <div className="relative mx-auto max-w-md overflow-hidden rounded-xl border border-border shadow-sm max-h-72 flex items-center justify-center bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImage}
                  alt="Pratinjau lembar materi perkuliahan"
                  className="w-full object-contain max-h-72"
                />
                {/* Scanning Laser Animation */}
                {scanning && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_12px_rgba(20,184,166,0.8)] animate-pulse" />
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                onClick={executeOcrScan}
                disabled={scanning}
                className="h-11 px-6 font-semibold flex items-center gap-2 shadow-xs"
              >
                {scanning ? (
                  <>
                    <Sparkles className="size-4 animate-spin" aria-hidden="true" />
                    <span>Menganalisis Dokumen via AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" aria-hidden="true" />
                    <span>Mulai Pindai Dokumen OCR</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedPdfFile(null);
                  setPreviewImage(null);
                  setScanResult(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                disabled={scanning}
                className="h-11 font-ui"
              >
                <RotateCcw className="size-4 mr-2" aria-hidden="true" />
                Ganti Berkas PDF
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="mx-auto size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="size-8" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <h3 className="font-heading text-lg font-bold text-foreground">
                Unggah Berkas PDF Materi Kuliah
              </h3>
              <p className="text-xs text-muted-foreground font-ui max-w-md mx-auto">
                Khusus dokumen berformat PDF (.pdf). SONAR menganalisis halaman PDF via AI Vision untuk mengekstrak rumus MathML &amp; tabel semantik.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-11 font-semibold flex items-center gap-2 px-6"
              >
                <FileText className="size-4" aria-hidden="true" />
                <span>Pilih Berkas Dokumen PDF</span>
              </Button>
            </div>

            {/* Quick Sample Demonstrators */}
            <div className="pt-4 border-t border-border flex items-center justify-center gap-2 text-xs text-muted-foreground font-ui">
              <span>Coba sampel PDF instan:</span>
              <button
                type="button"
                onClick={() => handleLoadSample("math")}
                className="text-primary font-semibold underline underline-offset-4 hover:text-primary/80"
              >
                Rumus Kalkulus &amp; Matriks
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => handleLoadSample("cs")}
                className="text-primary font-semibold underline underline-offset-4 hover:text-primary/80"
              >
                Struktur Data BST &amp; Tabel
              </button>
            </div>

            {/* Hidden Native File Input (STRICT PDF ONLY) */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              aria-label="Pilih berkas dokumen PDF untuk dipindai OCR"
              className="hidden"
              onChange={(e) => void handleFileSelect(e.target.files?.[0])}
            />
          </div>
        )}
      </div>

      {/* Live OCR Scan Results View */}
      {scanResult && (
        <div className="space-y-6 pt-2">
          {/* Results Summary Bar */}
          <div className="rounded-2xl border border-primary/20 bg-card p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
                  <h2 className="font-heading text-lg font-bold text-foreground">
                    Hasil Pemindaian OCR Berhasil
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground font-ui mt-0.5">
                  Tingkat Keyakinan:{" "}
                  <strong className="text-foreground">{scanResult.confidence}%</strong> &bull;{" "}
                  {scanResult.isAiLive ? "Gemini 2.5 Flash Vision Live" : "Mesin Analisis Semantik Terpadu"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={isPlayingAudio ? stopAllAudio : speakAllDocument}
                  className="font-ui font-semibold text-xs flex items-center gap-2"
                >
                  {isPlayingAudio ? (
                    <>
                      <Square className="size-3.5 fill-current" aria-hidden="true" />
                      <span>Hentikan Suara</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="size-3.5 text-primary" aria-hidden="true" />
                      <span>Putar Narasi Audio</span>
                    </>
                  )}
                </Button>

                <Button
                  asChild
                  size="sm"
                  className="font-ui font-semibold text-xs flex items-center gap-2 shadow-xs"
                >
                  <Link href={`/reader/${scanResult.documentId}`}>
                    <Headphones className="size-3.5" aria-hidden="true" />
                    <span>Buka di Reader</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-ui">
              <div className="rounded-xl bg-surface-subtle p-3 text-center">
                <p className="text-[11px] text-muted-foreground">Total Blok</p>
                <p className="text-lg font-bold text-foreground font-heading">
                  {scanResult.stats.totalBlocks}
                </p>
              </div>
              <div className="rounded-xl bg-surface-subtle p-3 text-center">
                <p className="text-[11px] text-muted-foreground">Heading Terstruktur</p>
                <p className="text-lg font-bold text-primary font-heading">
                  {scanResult.stats.headingsCount}
                </p>
              </div>
              <div className="rounded-xl bg-surface-subtle p-3 text-center">
                <p className="text-[11px] text-muted-foreground">Rumus MathML</p>
                <p className="text-lg font-bold text-primary font-heading">
                  {scanResult.stats.equationsCount}
                </p>
              </div>
              <div className="rounded-xl bg-surface-subtle p-3 text-center">
                <p className="text-[11px] text-muted-foreground">Tabel Baris-Kolom</p>
                <p className="text-lg font-bold text-primary font-heading">
                  {scanResult.stats.tablesCount}
                </p>
              </div>
            </div>
          </div>

          {/* Structured Semantic Blocks Feed */}
          <div className="space-y-3">
            <h3 className="font-heading text-sm font-bold text-foreground">
              Blok Semantik Dokumen Terorganisir:
            </h3>

            <div className="space-y-3">
              {scanResult.blocks.map((block, idx) => {
                const isPlayingThis = isPlayingAudio && currentlyPlayingIndex === idx;

                if (block.blockType === "heading") {
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-primary/20 bg-brand-mint/20 dark:bg-card p-4 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-ui">
                          Heading Level {block.headingLevel || 2}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => speakText(block.contentText, idx)}
                          aria-label={`Dengarkan judul: ${block.contentText}`}
                        >
                          <Volume2 className="size-3.5 text-primary" />
                        </Button>
                      </div>
                      <h3 className="font-heading text-lg font-bold text-foreground">
                        {block.contentText}
                      </h3>
                    </div>
                  );
                }

                if (block.blockType === "equation") {
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary font-ui">
                          <BookOpen className="size-3.5" aria-hidden="true" />
                          Rumus Matematika Terverifikasi MathML
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            speakText(block.spokenText || block.contentText, idx)
                          }
                          className="h-8 text-xs font-ui font-semibold flex items-center gap-1.5"
                        >
                          {isPlayingThis ? (
                            <>
                              <Square className="size-3 fill-current" aria-hidden="true" />
                              <span>Berhenti</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="size-3 text-primary" aria-hidden="true" />
                              <span>Dengarkan Narasi Rumus</span>
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Mathematical Display */}
                      <div className="p-3 bg-surface-subtle rounded-lg text-center font-mono text-base font-semibold text-foreground overflow-x-auto">
                        {block.latex ? `$$ ${block.latex} $$` : block.contentText}
                      </div>

                      {/* Screen Reader Narration Box */}
                      {block.spokenText && (
                        <div className="rounded-lg bg-secondary/50 p-3 text-xs space-y-1 font-ui">
                          <p className="font-bold text-primary">Narasi Suara Audio Reader:</p>
                          <p className="text-muted-foreground italic">
                            &ldquo;{block.spokenText}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }

                if (block.blockType === "table" && block.tableHeaders && block.tableRows) {
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary font-ui">
                          <TableIcon className="size-3.5" aria-hidden="true" />
                          Tabel Data Terstruktur
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => speakText(block.contentText, idx)}
                          aria-label={`Dengarkan tabel: ${block.contentText}`}
                        >
                          <Volume2 className="size-3.5 text-primary" />
                        </Button>
                      </div>

                      <p className="text-xs font-semibold text-foreground font-ui">
                        {block.contentText}
                      </p>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-border bg-surface-subtle font-ui">
                              {block.tableHeaders.map((header, hIdx) => (
                                <th
                                  key={hIdx}
                                  className="px-3 py-2 font-bold text-foreground"
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
                                className="border-b border-border/50 hover:bg-muted/40 transition-colors"
                              >
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className="px-3 py-2 text-muted-foreground"
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }

                // Default paragraph block
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-ui">
                        Paragraf Teks
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => speakText(block.contentText, idx)}
                        aria-label="Dengarkan paragraf"
                      >
                        <Volume2 className="size-3.5 text-primary" />
                      </Button>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground font-sans">
                      {block.contentText}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
