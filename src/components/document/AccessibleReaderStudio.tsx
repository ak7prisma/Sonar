"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Flag,
  Lightbulb,
  ListTree,
  Pause,
  Play,
  Search,
  Send,
  SkipBack,
  SkipForward,
  Sparkles,
  Square,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAccessibilityStore } from "@/stores/accessibility-store";
import { useAudioReader } from "@/features/audio/use-audio-reader";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";
import { sanitizeDocumentHtml } from "@/lib/accessibility/sanitize";
import { APP_IMAGES } from "@/lib/images";
import type {
  DocumentBlockRow,
  DocumentEquationRow,
  DocumentFigureRow,
  DocumentRow,
  DocumentTableRow,
} from "@/lib/data/workspace";

export interface ReaderStudioProps {
  document: DocumentRow;
  courseLabel?: string;
  blocks: DocumentBlockRow[];
  tables: DocumentTableRow[];
  equations: DocumentEquationRow[];
  figures: DocumentFigureRow[];
  signedPdfUrl?: string | null;
  aiEnabled?: boolean;
  isReferencePreview?: boolean;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: string[];
}

export function AccessibleReaderStudio({
  document,
  courseLabel,
  blocks,
  equations,
  figures,
  signedPdfUrl,
  aiEnabled = true,
}: ReaderStudioProps) {
  const [showOutline, setShowOutline] = useState(true);
  const [showAssistant, setShowAssistant] = useState(aiEnabled);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(
    blocks[0]?.id ?? null
  );
  const [chatInput, setChatInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSidebarTab, setActiveSidebarTab] = useState<"outline" | "bookmarks" | "search">("outline");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [reportingBlockId, setReportingBlockId] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportIssueType, setReportIssueType] = useState("ocr");
  const [reportText, setReportText] = useState("");

  const language = useAccessibilityStore((s) => s.language);
  const setLanguage = useAccessibilityStore((s) => s.setLanguage);
  const narrationSpeed = useAccessibilityStore((s) => s.narrationSpeed);
  const setNarrationSpeed = useAccessibilityStore((s) => s.setNarrationSpeed);
  const { announce } = useLiveAnnouncer();

  // Preset assistant responses for instant interactive feedback
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      text: `Halo! Saya Asisten Dokumen SONAR. Materi "${document.title}" telah diverifikasi oleh volunteer. Anda dapat memilih pertanyaan cepat di bawah atau mengetik pertanyaan tentang konsep, rumus MathML, maupun tabel di dokumen ini.`,
      citations: ["Halaman 1", "Verifikasi Volunteer Dewi Sartika, S.Kom."],
    },
  ]);

  const equationsByBlock = useMemo(() => {
    const map = new Map<string, DocumentEquationRow>();
    for (const eq of equations) map.set(eq.block_id, eq);
    return map;
  }, [equations]);

  const figuresByBlock = useMemo(() => {
    const map = new Map<string, DocumentFigureRow>();
    for (const fig of figures) map.set(fig.block_id, fig);
    return map;
  }, [figures]);

  const audioBlocks = useMemo(
    () =>
      blocks.map((block) => {
        const eq = equationsByBlock.get(block.id);
        const eqSpoken = eq
          ? language === "id"
            ? eq.narration_id
            : eq.narration_en
          : null;
        return {
          id: block.id,
          spokenText: eqSpoken ?? block.spoken_text ?? block.content_text,
          label: `${block.block_type} pada halaman ${block.page_number}`,
        };
      }),
    [blocks, equationsByBlock, language]
  );

  const audio = useAudioReader({
    blocks: audioBlocks,
    rate: narrationSpeed,
    language,
    onBlockChange: (id) => setActiveBlockId(id),
    onAnnounce: (msg) => announce(msg, "polite"),
  });

  const outlineItems = useMemo(
    () =>
      blocks.filter(
        (b) =>
          b.block_type === "heading" ||
          b.block_type === "equation" ||
          b.block_type === "table" ||
          b.block_type === "figure"
      ),
    [blocks]
  );

  const filteredBlocks = useMemo(() => {
    if (!searchQuery.trim()) return blocks;
    const q = searchQuery.toLowerCase();
    return blocks.filter((b) => b.content_text.toLowerCase().includes(q));
  }, [blocks, searchQuery]);

  const jumpToBlock = (blockId: string) => {
    setActiveBlockId(blockId);
    const el = window.document.getElementById(`block-${blockId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.focus({ preventScroll: true });
    }
  };

  const toggleBookmark = (blockId: string) => {
    setBookmarks((prev) =>
      prev.includes(blockId) ? prev.filter((id) => id !== blockId) : [...prev, blockId]
    );
    announce("Status penanda halaman diperbarui.", "polite");
  };

  const handleQuickAction = (action: string) => {
    let userQuery = "";
    let assistantReply = "";
    let citations: string[] = [];

    if (action === "summary") {
      userQuery = "Ringkas bab ini dalam 3 poin utama.";
      assistantReply =
        "Ringkasan Inti Dokumen:\n1. Binary Search Tree (BST) biasa rentan membentuk rantai linier O(n) saat data berurutan.\n2. Pohon AVL menerapkan invariant ketinggian dengan faktor keseimbangan BF(v) = height(left) - height(right) yang bernilai {-1, 0, 1}.\n3. Saat terjadi ketidakseimbangan (+2 atau -2), dilakukan operasi Single Rotation (LL/RR) atau Double Rotation (LR/RL) dalam waktu O(1).";
      citations = ["Halaman 1, Bab 1.1", "Halaman 2, Tabel 1"];
    } else if (action === "equation") {
      userQuery = "Jelaskan rumus faktor keseimbangan BF(v).";
      assistantReply =
        "Rumus BF(v) = height(left(v)) - height(right(v)) menyatakan selisih antara tinggi subpohon anak kiri dikurangi tinggi anak kanan. Pohon AVL menjamin selisih ini tidak boleh melebihi 1, sehingga tinggi total pohon selalu O(log n).";
      citations = ["Halaman 1, Rumus BF(v)"];
    } else if (action === "rotations") {
      userQuery = "Apa perbedaan rotasi LL dan rotasi LR?";
      assistantReply =
        "Perbedaan Rotasi AVL:\n• LL (Left-Left): Penyisipan terjadi pada subpohon kiri dari anak kiri; diselesaikan dengan SATU rotasi kanan pada simpul kakek.\n• LR (Left-Right): Penyisipan terjadi pada subpohon kanan dari anak kiri; memerlukan DUA rotasi: rotasi kiri pada anak, lalu rotasi kanan pada kakek.";
      citations = ["Halaman 2, Tabel 1"];
    } else if (action === "quiz") {
      userQuery = "Buat 1 soal kuis latihan untuk konsep ini.";
      assistantReply =
        "Latihan Konsep AVL:\nSoal: Jika sebuah simpul memiliki subpohon kiri setinggi 3 dan subpohon kanan setinggi 1, berapakah nilai Balance Factor simpul tersebut dan apakah simpul tersebut masih seimbang?\nJawaban: BF = 3 - 1 = +2 (Tidak seimbang, memerlukan rotasi LL atau LR).";
      citations = ["Halaman 1, Definisi 1.1"];
    }

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text: userQuery },
      { id: `asst-${Date.now()}`, role: "assistant", text: assistantReply, citations },
    ]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput.trim();
    setChatInput("");

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text: query },
      {
        id: `asst-${Date.now()}`,
        role: "assistant",
        text: `Berdasarkan dokumen "${document.title}": Pertanyaan Anda mengenai "${query}" berkaitan dengan struktur pohon biner dan invariant AVL di Bab 1. Seluruh operasi pencarian dan penyisipan dijamin beroperasi dalam batas O(log n).`,
        citations: ["Halaman 1, Paragraf 2", "Halaman 2, Tabel 1"],
      },
    ]);
  };

  const submitReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSuccess(true);
    announce("Laporan isu berhasil dikirim ke volunteer reviewer.", "polite");
    setTimeout(() => {
      setReportingBlockId(null);
      setReportSuccess(false);
      setReportText("");
    }, 1500);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* TOP HEADER: Inspired by Image 2 (bookmind.com) */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between font-ui">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link
              href="/courses"
              className="font-bold text-primary hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="size-3.5" />
              <span>{courseLabel ? courseLabel.split("—")[0].trim() : "Mata Kuliah"}</span>
            </Link>
            <span className="text-muted-foreground">&bull;</span>
            <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 font-bold text-success text-[11px]">
              <CheckCircle2 className="size-3" />
              Verified by Dewi Sartika, S.Kom. &bull; v2.1
            </span>
          </div>

          <h1 className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight text-foreground truncate">
            {document.title}
          </h1>
        </div>

        {/* View toggles & actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            aria-expanded={showOutline}
            onClick={() => setShowOutline((v) => !v)}
            className="text-xs h-9 border-border font-semibold"
          >
            <ListTree className="size-3.5 mr-1.5" aria-hidden="true" />
            <span>{showOutline ? "Tutup Outline" : "Buka Outline"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            aria-expanded={showAssistant}
            onClick={() => setShowAssistant((v) => !v)}
            className="text-xs h-9 border-border font-semibold"
          >
            <Sparkles className="size-3.5 mr-1.5 text-primary" aria-hidden="true" />
            <span>{showAssistant ? "Tutup AI" : "Tanya AI"}</span>
          </Button>

          {signedPdfUrl && (
            <Button size="sm" variant="ghost" asChild className="text-xs h-9">
              <a href={signedPdfUrl} target="_blank" rel="noopener noreferrer">
                <span>PDF Asli</span>
                <ExternalLink className="size-3 ml-1" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* STICKY AUDIO PLAYER TOOLBAR: Inspired by Image 2 (bookmind.com) */}
      <section
        aria-label="Kontrol Pemutar Audio Reader"
        className="sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-card/95 px-4 py-3 shadow-sm backdrop-blur-md font-ui"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={audio.previous}
            disabled={!audio.isSupported || audio.activeIndex === 0}
            aria-label="Paragraf sebelumnya"
            className="size-8 p-0"
          >
            <SkipBack className="size-4" aria-hidden="true" />
          </Button>

          {audio.isPlaying ? (
            <Button size="sm" onClick={audio.pause} className="h-8 px-3 font-semibold">
              <Pause className="size-4 mr-1.5 fill-current" aria-hidden="true" />
              <span>Jeda</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() =>
                audio.isPaused ? audio.resume() : audio.playFrom(audio.activeIndex)
              }
              disabled={!audio.isSupported || audioBlocks.length === 0}
              className="h-8 px-3 font-semibold"
            >
              <Play className="size-4 mr-1.5 fill-current" aria-hidden="true" />
              <span>{audio.isPaused ? "Lanjutkan" : "Dengarkan Audio"}</span>
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={audio.next}
            disabled={!audio.isSupported || audio.activeIndex >= audioBlocks.length - 1}
            aria-label="Paragraf berikutnya"
            className="size-8 p-0"
          >
            <SkipForward className="size-4" aria-hidden="true" />
          </Button>

          {(audio.isPlaying || audio.isPaused) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={audio.stop}
              aria-label="Hentikan pembacaan"
              className="size-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <Square className="size-3.5" aria-hidden="true" />
            </Button>
          )}

          <span className="ml-2 text-xs font-semibold tabular-nums text-muted-foreground">
            Blok {audioBlocks.length === 0 ? 0 : audio.activeIndex + 1} dari {audioBlocks.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 text-muted-foreground">
            <span>Kecepatan:</span>
            <select
              aria-label="Kecepatan pembacaan suara"
              value={narrationSpeed}
              onChange={(e) => setNarrationSpeed(Number(e.target.value))}
              className="h-7 rounded border border-input bg-background px-1.5 text-xs text-foreground font-semibold"
            >
              <option value="0.75">0.75&times;</option>
              <option value="1">1.0&times; (Normal)</option>
              <option value="1.25">1.25&times;</option>
              <option value="1.5">1.5&times;</option>
              <option value="2">2.0&times;</option>
            </select>
          </label>

          <label className="flex items-center gap-1.5 text-muted-foreground">
            <span>Bahasa:</span>
            <select
              aria-label="Bahasa audio"
              value={language}
              onChange={(e) => setLanguage(e.target.value === "id" ? "id" : "en")}
              className="h-7 rounded border border-input bg-background px-1.5 text-xs text-foreground font-semibold"
            >
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>
      </section>

      {/* 3-PANE STUDIO LAYOUT: Left Navigator | Center Reader | Right AI Assistant (Image 2) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* LEFT NAVIGATOR PANE (Chapters, Bookmarks, Search) */}
        {showOutline && (
          <aside
            id="reader-outline-pane"
            aria-label="Navigasi Dokumen &amp; Bab"
            className="rounded-2xl border border-border bg-card p-4 shadow-xs lg:col-span-3 space-y-4 font-ui"
          >
            {/* Book Info Card in Sidebar (Image 2 style) */}
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                <Image
                  src={APP_IMAGES.courseCS.src}
                  alt={APP_IMAGES.courseCS.alt}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-primary uppercase">CS 201 Modul</p>
                <p className="text-xs font-bold text-foreground truncate">AVL Balancing Trees</p>
                <p className="text-[10px] text-muted-foreground">24 Halaman &bull; v2.1</p>
              </div>
            </div>

            {/* Sidebar Tabs */}
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-surface-subtle p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveSidebarTab("outline")}
                className={`rounded py-1 font-semibold transition-colors ${
                  activeSidebarTab === "outline" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                Bab &amp; Hlm
              </button>
              <button
                type="button"
                onClick={() => setActiveSidebarTab("bookmarks")}
                className={`rounded py-1 font-semibold transition-colors ${
                  activeSidebarTab === "bookmarks" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                Penanda ({bookmarks.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveSidebarTab("search")}
                className={`rounded py-1 font-semibold transition-colors ${
                  activeSidebarTab === "search" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                Cari
              </button>
            </div>

            {activeSidebarTab === "search" && (
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari teks di dokumen..."
                  className="pl-8 text-xs h-8"
                />
              </div>
            )}

            {/* Heading Tree */}
            <nav aria-label="Hierarki Bab Dokumen" className="max-h-[500px] overflow-y-auto pr-1">
              <ul className="space-y-1 text-xs">
                {outlineItems.map((item) => {
                  const isActive = activeBlockId === item.id;
                  const isH1 = item.block_type === "heading" && (!item.heading_level || item.heading_level === 1);
                  const isH2 = item.block_type === "heading" && item.heading_level === 2;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => jumpToBlock(item.id)}
                        className={`w-full text-left rounded-lg px-2.5 py-1.5 transition-colors flex items-center justify-between ${
                          isActive
                            ? "bg-primary text-primary-foreground font-bold shadow-xs"
                            : "text-foreground/80 hover:bg-muted hover:text-foreground"
                        } ${isH2 ? "pl-5 text-[11px]" : isH1 ? "font-bold text-xs" : "text-[11px]"}`}
                      >
                        <span className="truncate">{item.content_text}</span>
                        <span
                          className={`text-[10px] ml-1 shrink-0 ${
                            isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                          }`}
                        >
                          Hlm {item.page_number}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        )}

        {/* CENTER READING CANVAS (Atkinson Hyperlegible, Paper Reading Mode) */}
        <article
          aria-label="Isi Materi Perkuliahan Terstruktur"
          className={`rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-xs transition-colors ${
            showOutline && showAssistant
              ? "lg:col-span-5"
              : showOutline || showAssistant
              ? "lg:col-span-8"
              : "lg:col-span-12"
          }`}
        >
          <div className="sonar-reader-prose max-w-none space-y-6">
            {filteredBlocks.map((block, index) => {
              const isCurrent = activeBlockId === block.id;
              const isBookmarked = bookmarks.includes(block.id);
              const eqData = equationsByBlock.get(block.id);
              const figData = figuresByBlock.get(block.id);

              return (
                <section
                  key={block.id}
                  id={`block-${block.id}`}
                  tabIndex={-1}
                  aria-label={`Halaman ${block.page_number}, ${block.block_type}`}
                  className={`group relative scroll-mt-36 rounded-xl p-3 transition-colors ${
                    isCurrent ? "ring-2 ring-primary/50 bg-secondary/30" : "hover:bg-surface-subtle/50"
                  }`}
                >
                  {/* Quick Action Overlay (Bookmark & Report Issue) */}
                  <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-background/90 rounded-md p-1 shadow-xs border border-border">
                    <button
                      type="button"
                      onClick={() => toggleBookmark(block.id)}
                      aria-label={isBookmarked ? "Hapus penanda" : "Tambah penanda"}
                      className="p-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Bookmark className={`size-3.5 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportingBlockId(block.id)}
                      aria-label="Laporkan masalah pada bagian ini"
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Flag className="size-3.5" />
                    </button>
                  </div>

                  {/* Block Content Renderers */}
                  {block.block_type === "heading" && (!block.heading_level || block.heading_level === 1) && (
                    <h2 className="font-heading text-2xl font-extrabold text-foreground tracking-tight pt-2">
                      {block.content_text}
                    </h2>
                  )}

                  {block.block_type === "heading" && block.heading_level === 2 && (
                    <h3 className="font-heading text-xl font-bold text-foreground tracking-tight pt-2">
                      {block.content_text}
                    </h3>
                  )}

                  {block.block_type === "heading" && block.heading_level === 3 && (
                    <h4 className="font-heading text-lg font-bold text-foreground pt-1">
                      {block.content_text}
                    </h4>
                  )}

                  {block.block_type === "paragraph" && (
                    <p className="text-foreground text-base leading-relaxed font-sans">
                      {block.content_text}
                    </p>
                  )}

                  {block.block_type === "table" && (
                    <div className="my-3 space-y-2">
                      <div className="overflow-x-auto rounded-xl border border-border">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: sanitizeDocumentHtml(block.content_html ?? ""),
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground font-ui">
                        Tabel dapat dinavigasi menggunakan panah keyboard. Kolom dan baris memiliki header terasosiasi.
                      </p>
                    </div>
                  )}

                  {block.block_type === "equation" && (
                    <div className="my-4 rounded-xl border-2 border-primary/25 bg-secondary/30 p-5 space-y-3">
                      <div className="flex items-center justify-between border-b border-border/60 pb-2">
                        <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground font-ui uppercase">
                          MathML &bull; Formula Matematika
                        </span>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => audio.playFrom(index)}
                          className="font-ui text-xs h-7 border-border"
                        >
                          <Volume2 className="mr-1 size-3.5 text-primary" aria-hidden="true" />
                          <span>Dengarkan Rumus</span>
                        </Button>
                      </div>

                      {/* Rendered MathML */}
                      <div
                        className="overflow-x-auto py-2 text-xl font-serif text-foreground"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeDocumentHtml(eqData?.mathml ?? block.content_html ?? ""),
                        }}
                      />

                      <div className="rounded-lg bg-background p-3 text-xs text-foreground/90 font-ui border border-border">
                        <span className="font-bold text-primary">Narasi Audio: </span>
                        <span>
                          {eqData?.narration_id ?? "B F dari v sama dengan tinggi anak kiri dikurang tinggi anak kanan."}
                        </span>
                      </div>
                    </div>
                  )}

                  {block.block_type === "figure" && (
                    <div className="my-4 rounded-xl border border-border bg-surface-subtle p-5 space-y-3">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: sanitizeDocumentHtml(block.content_html ?? ""),
                        }}
                      />
                      <div className="rounded-lg bg-card p-3.5 border border-border text-xs space-y-1.5 font-sans">
                        <p className="font-bold font-ui text-primary flex items-center gap-1.5">
                          <EyeOff className="size-3.5" aria-hidden="true" />
                          <span>Deskripsi Taktil untuk Screen Reader:</span>
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          {figData?.summary ??
                            "Struktur pohon AVL menunjukkan proses rotasi kanan searah jarum jam untuk memulihkan ketinggian pohon."}
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </article>

        {/* RIGHT GROUNDED AI ASSISTANT PANE: Inspired by Image 2 (bookmind.com) */}
        {showAssistant && (
          <aside
            id="reader-assistant-pane"
            aria-label="Asisten Dokumen AI &amp; Ringkasan"
            className="flex flex-col rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs lg:col-span-4 space-y-4 font-ui"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h2 className="font-heading text-sm font-bold text-foreground">
                    Tanya AI &bull; Asisten Dokumen
                  </h2>
                  <p className="text-[10px] text-muted-foreground">Tersitasi ketat dari modul ini</p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowAssistant(false)}
                aria-label="Tutup panel asisten"
                className="size-7"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            {/* Quick Action Chips (Image 2 right pane feature!) */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Tindakan Cepat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction("summary")}
                  className="text-xs h-7 px-2.5 border-primary/30 hover:bg-primary/10 font-semibold"
                >
                  <BookOpen className="size-3 mr-1 text-primary" />
                  Ringkas Bab Ini
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction("equation")}
                  className="text-xs h-7 px-2.5 border-primary/30 hover:bg-primary/10 font-semibold"
                >
                  <Lightbulb className="size-3 mr-1 text-warning" />
                  Jelaskan Rumus BF(v)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction("rotations")}
                  className="text-xs h-7 px-2.5 border-primary/30 hover:bg-primary/10 font-semibold"
                >
                  Perbedaan LL &amp; LR
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction("quiz")}
                  className="text-xs h-7 px-2.5 border-primary/30 hover:bg-primary/10 font-semibold"
                >
                  Kuis Latihan
                </Button>
              </div>
            </div>

            {/* Chat History Container */}
            <div
              className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-[380px] text-xs font-sans"
              aria-label="Riwayat Tanya Jawab AI"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl p-3.5 space-y-1.5 ${
                    m.role === "user"
                      ? "ml-4 bg-primary text-primary-foreground font-medium"
                      : "mr-2 border border-border bg-surface-subtle text-foreground"
                  }`}
                >
                  <p className="font-bold font-ui text-[11px] opacity-85">
                    {m.role === "user" ? "Anda" : "Asisten Dokumen SONAR"}
                  </p>
                  <p className="leading-relaxed whitespace-pre-line">{m.text}</p>
                  {m.citations && (
                    <div className="pt-2 border-t border-border/40 flex flex-wrap gap-1 font-ui text-[10px]">
                      {m.citations.map((c, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-primary/10 px-1.5 py-0.5 text-primary font-bold"
                        >
                          Sitasi: {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="space-y-2 border-t border-border pt-3 font-ui">
              <label htmlFor="ai-chat-input" className="sr-only">
                Ajukan pertanyaan tentang materi ini
              </label>
              <div className="relative flex items-center">
                <Input
                  id="ai-chat-input"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Tanyakan rumus, tabel, atau konsep..."
                  className="pr-10 text-xs h-10 font-sans"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!chatInput.trim()}
                  aria-label="Kirim pertanyaan ke AI"
                  className="absolute right-1 size-8"
                >
                  <Send className="size-3.5" />
                </Button>
              </div>
            </form>
          </aside>
        )}
      </div>

      {/* REPORT ISSUE MODAL / DIALOG */}
      {reportingBlockId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-ui"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 id="report-modal-title" className="font-heading text-lg font-bold text-foreground">
                Laporkan Masalah Aksesibilitas
              </h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReportingBlockId(null)}
                aria-label="Tutup dialog"
              >
                &times;
              </Button>
            </div>

            {reportSuccess ? (
              <div className="p-6 text-center space-y-2 text-success">
                <CheckCircle2 className="size-10 mx-auto" />
                <p className="font-bold text-sm">Laporan Terkirim!</p>
                <p className="text-xs text-muted-foreground">Volunteer reviewer akan meninjau bagian ini.</p>
              </div>
            ) : (
              <form onSubmit={submitReportIssue} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="issue-type" className="text-xs font-semibold text-foreground">
                    Jenis Kendala:
                  </label>
                  <select
                    id="issue-type"
                    value={reportIssueType}
                    onChange={(e) => setReportIssueType(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground"
                  >
                    <option value="ocr">Kesalahan Teks / OCR Terpotong</option>
                    <option value="math">Rumus MathML / Narasi Suara Salah</option>
                    <option value="table">Struktur Tabel Tidak Terbaca</option>
                    <option value="figure">Deskripsi Gambar / Diagram Kurang Jelas</option>
                    <option value="version">Versi Sumber Telah Diperbarui Dosen</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="issue-desc" className="text-xs font-semibold text-foreground">
                    Deskripsi Masalah:
                  </label>
                  <Textarea
                    id="issue-desc"
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Jelaskan secara singkat apa yang perlu diperbaiki oleh volunteer..."
                    rows={3}
                    className="text-xs font-sans"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setReportingBlockId(null)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" size="sm" className="font-semibold">
                    Kirim Laporan Isu
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EyeOff(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .698 10.747 10.747 0 0 1-5.111 5.372" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499A10.75 10.75 0 0 1 2.062 12.35a1 1 0 0 1 0-.698 10.75 10.75 0 0 1 2.883-4.148" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}
