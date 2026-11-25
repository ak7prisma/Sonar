"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Image as ImageIcon,
  Save,
  Send,
  Sigma,
  Table2,
  Type,
  Volume2,
} from "lucide-react";
import { cn } from "cn";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Panel } from "@/components/app/Panel";
import { ReviewStatusChip } from "@/components/app/ReviewStatusChip";
import { StructuredTable } from "@/components/app/StructuredTable";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";
import { sanitizeDocumentHtml } from "@/lib/accessibility/sanitize";
import { formatVersion } from "@/lib/format";
import type {
  DocumentBlockRow,
  DocumentEquationRow,
  DocumentFigureRow,
  DocumentRow,
  DocumentTableRow,
} from "@/lib/data/workspace";
import type { ReviewStatus } from "@/types/database";

type BlockFilter = "all" | "unverified" | "equation" | "table" | "figure";
type DecisionStatus = Exclude<ReviewStatus, "unreviewed">;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function blockTypeLabel(type: DocumentBlockRow["block_type"]): string {
  switch (type) {
    case "heading":
      return "Judul";
    case "equation":
      return "Rumus";
    case "table":
      return "Tabel";
    case "figure":
      return "Gambar";
    default:
      return "Paragraf";
  }
}

function BlockTypeIcon({ type }: { type: DocumentBlockRow["block_type"] }) {
  switch (type) {
    case "equation":
      return <Sigma className="size-3.5 shrink-0" aria-hidden="true" />;
    case "table":
      return <Table2 className="size-3.5 shrink-0" aria-hidden="true" />;
    case "figure":
      return <ImageIcon className="size-3.5 shrink-0" aria-hidden="true" />;
    default:
      return <Type className="size-3.5 shrink-0" aria-hidden="true" />;
  }
}

interface BlockReviewEditorProps {
  documentId: string;
  block: DocumentBlockRow;
  equation?: DocumentEquationRow;
  table?: DocumentTableRow;
  figure?: DocumentFigureRow;
  onSavedBlock: (updated: DocumentBlockRow) => void;
  onNextUnverified: () => void;
  hasNextUnverified: boolean;
}

function BlockReviewEditor({
  documentId,
  block,
  equation,
  table,
  figure,
  onSavedBlock,
  onNextUnverified,
  hasNextUnverified,
}: BlockReviewEditorProps) {
  const { announce } = useLiveAnnouncer();

  const [draftText, setDraftText] = useState(block.content_text);
  const [draftSpoken, setDraftSpoken] = useState(
    block.spoken_text ?? equation?.narration_id ?? block.content_text
  );
  const [draftLatex, setDraftLatex] = useState(equation?.latex ?? "");
  const [liveMathMl, setLiveMathMl] = useState<string | null>(
    equation?.mathml ?? (block.block_type === "equation" ? block.content_html : null)
  );
  const [saving, setSaving] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);
  const isFirstLatexRender = useRef(true);

  // Debounced live MathML preview when editing an equation's LaTeX
  useEffect(() => {
    if (isFirstLatexRender.current) {
      isFirstLatexRender.current = false;
      return;
    }
    if (block.block_type !== "equation" || !draftLatex.trim()) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/math/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latex: draftLatex.trim() }),
          signal: controller.signal,
        });
        if (!res.ok) return;
        const payload = (await res.json()) as { mathml?: string };
        if (payload.mathml) {
          setLiveMathMl(payload.mathml);
        }
      } catch {
        // Abaikan jika request dibatalkan
      }
    }, 400);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [block.block_type, draftLatex]);

  const speakPreview = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      announce("Peramban tidak mendukung sintesis suara.", "assertive");
      return;
    }
    window.speechSynthesis.cancel();
    const text = draftSpoken.trim() || draftText.trim();
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "id-ID";
    window.speechSynthesis.speak(utter);
  };

  const handleSave = async (markVerified: boolean) => {
    setBlockError(null);
    if (!draftText.trim()) {
      const msg = "Teks blok tidak boleh kosong.";
      setBlockError(msg);
      announce(msg, "assertive");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `/api/documents/${documentId}/blocks/${block.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentText: draftText.trim(),
            spokenText: draftSpoken.trim() || undefined,
            latex:
              block.block_type === "equation" && draftLatex.trim()
                ? draftLatex.trim()
                : undefined,
            markVerified,
          }),
        }
      );

      let payload: { error?: string; block?: DocumentBlockRow } = {};
      try {
        payload = (await response.json()) as typeof payload;
      } catch {
        payload = {};
      }

      if (!response.ok || !payload.block) {
        const msg =
          payload.error ?? "Gagal menyimpan perubahan blok pada server.";
        setBlockError(msg);
        toast.error(msg);
        announce(msg, "assertive");
        return;
      }

      onSavedBlock(payload.block);
      const okMsg = markVerified
        ? "Blok disimpan dan ditandai terverifikasi."
        : "Perubahan blok disimpan sebagai draf.";
      toast.success(okMsg);
      announce(okMsg, "polite");
    } catch {
      const msg = "Gagal menghubungi server saat menyimpan blok.";
      setBlockError(msg);
      toast.error(msg);
      announce(msg, "assertive");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 font-ui">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-tint-blue px-3 py-1 text-xs font-semibold text-brand-ink">
            <BlockTypeIcon type={block.block_type} />
            <span>{blockTypeLabel(block.block_type)}</span>
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Halaman {block.page_number}
          </span>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
            block.is_verified
              ? "bg-brand-mint text-brand-ink"
              : "bg-tint-gold text-brand-ink"
          )}
        >
          {block.is_verified ? "Terverifikasi" : "Perlu dicek"}
        </span>
      </div>

      {blockError ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{blockError}</span>
        </div>
      ) : null}

      {/* Block-type Specific Preview */}
      <div className="rounded-2xl border border-border bg-surface-subtle/60 p-4 space-y-2">
        <p className="font-ui text-xs font-semibold text-muted-foreground">
          Pratinjau Tampilan Pembaca
        </p>

        {block.block_type === "equation" ? (
          <div
            className="overflow-x-auto rounded-xl border border-border bg-card p-4 text-center text-lg text-foreground"
            dangerouslySetInnerHTML={{
              __html: sanitizeDocumentHtml(
                liveMathMl ?? `<pre>${draftLatex || draftText}</pre>`
              ),
            }}
          />
        ) : block.block_type === "table" ? (
          <div className="overflow-x-auto rounded-xl border border-border bg-card p-2">
            <StructuredTable
              html={block.content_html}
              table={table}
              fallbackText={draftText}
            />
          </div>
        ) : block.block_type === "figure" ? (
          <div className="space-y-2">
            {block.content_html?.trim() ? (
              <div
                className="overflow-hidden rounded-xl border border-border bg-card p-2"
                dangerouslySetInnerHTML={{
                  __html: sanitizeDocumentHtml(block.content_html),
                }}
              />
            ) : null}
            {figure?.summary ? (
              <p className="rounded-xl bg-card p-3 text-sm text-foreground">
                {figure.summary}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="sonar-reader-prose max-w-none rounded-xl bg-card p-4 text-foreground">
            {draftText}
          </p>
        )}
      </div>

      {/* Editable Form Fields */}
      <div className="space-y-4 font-ui">
        {block.block_type === "equation" ? (
          <div className="space-y-1.5">
            <Label htmlFor="review-block-latex">Notasi LaTeX</Label>
            <Input
              id="review-block-latex"
              value={draftLatex}
              onChange={(e) => setDraftLatex(e.target.value)}
              placeholder="Contoh: \frac{df}{dx} = 2x"
              className="h-10 font-mono text-sm"
            />
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="review-block-text">Teks / deskripsi</Label>
          <Textarea
            id="review-block-text"
            rows={3}
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            className="font-sans text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="review-block-spoken">
              Narasi suara untuk pembaca layar
            </Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={speakPreview}
              className="h-9 rounded-full px-3 text-xs"
            >
              <Volume2 className="size-3.5" aria-hidden="true" />
              <span>Dengarkan narasi</span>
            </Button>
          </div>
          <Textarea
            id="review-block-spoken"
            rows={3}
            value={draftSpoken}
            onChange={(e) => setDraftSpoken(e.target.value)}
            className="font-sans text-sm"
          />
        </div>
      </div>

      {/* Block Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 font-ui">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={saving}
            onClick={() => void handleSave(true)}
            className="min-h-10 rounded-full px-4 text-xs font-semibold"
          >
            <CheckCircle2 className="size-4" aria-hidden="true" />
            <span>Simpan &amp; Tandai Terverifikasi</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => void handleSave(false)}
            className="min-h-10 rounded-full px-4 text-xs font-semibold"
          >
            <Save className="size-3.5" aria-hidden="true" />
            <span>Simpan Draf</span>
          </Button>
        </div>

        {hasNextUnverified ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onNextUnverified}
            className="min-h-10 rounded-full px-3 text-xs font-semibold"
          >
            <span>Blok berikutnya</span>
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function ReviewWorkbench({
  document,
  initialBlocks,
  equations,
  tables = [],
  figures = [],
}: {
  document: DocumentRow;
  initialBlocks: DocumentBlockRow[];
  equations: DocumentEquationRow[];
  tables?: DocumentTableRow[];
  figures?: DocumentFigureRow[];
}) {
  const router = useRouter();
  const { announce } = useLiveAnnouncer();

  const [blocks, setBlocks] = useState(initialBlocks);
  const [blockFilter, setBlockFilter] = useState<BlockFilter>("all");
  const [selectedBlockId, setSelectedBlockId] = useState<string>(
    initialBlocks.find((b) => !b.is_verified || b.needs_review)?.id ??
      initialBlocks[0]?.id ??
      ""
  );
  const [decision, setDecision] = useState<DecisionStatus>(
    document.review_status === "verified" ||
      document.review_status === "needs_revision" ||
      document.review_status === "in_review"
      ? document.review_status
      : "in_review"
  );
  const [reviewNotes, setReviewNotes] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const eqMap = useMemo(
    () => new Map(equations.map((e) => [e.block_id, e])),
    [equations]
  );
  const tblMap = useMemo(
    () => new Map(tables.map((t) => [t.block_id, t])),
    [tables]
  );
  const figMap = useMemo(
    () => new Map(figures.map((f) => [f.block_id, f])),
    [figures]
  );

  const verifiedCount = blocks.filter((b) => b.is_verified).length;
  const unverifiedCount = blocks.length - verifiedCount;
  const progressPct =
    blocks.length > 0 ? Math.round((verifiedCount / blocks.length) * 100) : 0;

  const filteredBlocks = useMemo(() => {
    return blocks.filter((b) => {
      if (blockFilter === "unverified") return !b.is_verified || b.needs_review;
      if (blockFilter === "equation") return b.block_type === "equation";
      if (blockFilter === "table") return b.block_type === "table";
      if (blockFilter === "figure") return b.block_type === "figure";
      return true;
    });
  }, [blockFilter, blocks]);

  const selectedBlock =
    blocks.find((b) => b.id === selectedBlockId) ?? filteredBlocks[0] ?? blocks[0];

  const nextUnverified = blocks.find(
    (b) => b.id !== selectedBlock?.id && (!b.is_verified || b.needs_review)
  );

  const isDatabaseDocument = UUID_REGEX.test(document.id);

  const handleSelectBlock = (block: DocumentBlockRow) => {
    setSelectedBlockId(block.id);
    announce(
      `Memilih ${blockTypeLabel(block.block_type)} halaman ${block.page_number}.`
    );
  };

  const handleSavedBlock = (updated: DocumentBlockRow) => {
    setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (decision === "verified" && unverifiedCount > 0) {
      const msg = `Masih terdapat ${unverifiedCount} blok yang belum terverifikasi sebelum menyetujui dokumen.`;
      setSubmitError(msg);
      announce(msg, "assertive");
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await fetch(`/api/documents/${document.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: decision,
          notes: reviewNotes.trim() || undefined,
        }),
      });

      let payload: { error?: string } = {};
      try {
        payload = (await response.json()) as typeof payload;
      } catch {
        payload = {};
      }

      if (!response.ok) {
        const msg =
          payload.error ?? "Gagal mengirim keputusan review ke server.";
        setSubmitError(msg);
        toast.error(msg);
        announce(msg, "assertive");
        return;
      }

      toast.success("Keputusan review berhasil disimpan.");
      announce("Keputusan review berhasil disimpan.", "polite");
      router.push("/review");
      router.refresh();
    } catch {
      const msg = "Terjadi kesalahan koneksi saat mengirim keputusan review.";
      setSubmitError(msg);
      toast.error(msg);
      announce(msg, "assertive");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="grid items-start gap-6 xl:grid-cols-12 font-sans">
      {/* LEFT: BLOCK LIST & PROGRESS */}
      <Panel
        id="workbench-blocks"
        title="Daftar Blok"
        className="min-w-0 xl:col-span-3"
      >
        <div className="space-y-4">
          <div className="space-y-1.5 font-ui">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-foreground">
                {verifiedCount} dari {blocks.length} terverifikasi
              </span>
              <span className="tabular-nums text-muted-foreground">
                {progressPct}%
              </span>
            </div>
            <Progress
              value={progressPct}
              aria-label="Progres verifikasi blok dokumen"
            />
          </div>

          <div
            role="group"
            aria-label="Filter tipe blok"
            className="flex flex-wrap gap-1.5 font-ui"
          >
            {(
              [
                { value: "all", label: "Semua" },
                { value: "unverified", label: "Perlu cek" },
                { value: "equation", label: "Rumus" },
                { value: "table", label: "Tabel" },
                { value: "figure", label: "Gambar" },
              ] as Array<{ value: BlockFilter; label: string }>
            ).map((item) => {
              const pressed = blockFilter === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => setBlockFilter(item.value)}
                  className={cn(
                    "min-h-8 rounded-full border px-2.5 text-xs font-semibold transition-colors",
                    pressed
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="max-h-96 space-y-1.5 overflow-y-auto pr-1">
            {filteredBlocks.length === 0 ? (
              <p className="rounded-xl bg-surface-subtle p-3 text-sm text-muted-foreground">
                Tidak ada blok pada filter ini.
              </p>
            ) : (
              filteredBlocks.map((b) => {
                const isSelected = selectedBlock?.id === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    aria-current={isSelected ? "true" : undefined}
                    onClick={() => handleSelectBlock(b)}
                    className={cn(
                      "w-full space-y-1 rounded-xl border p-3 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-brand-mint/60 text-brand-ink dark:bg-secondary/60 dark:text-foreground"
                        : "border-border bg-background hover:bg-surface-subtle"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 font-ui text-xs">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <BlockTypeIcon type={b.block_type} />
                        <span>
                          {blockTypeLabel(b.block_type)} · Hlm {b.page_number}
                        </span>
                      </span>
                      {b.is_verified ? (
                        <CheckCircle2
                          className="size-3.5 text-primary"
                          aria-label="Terverifikasi"
                        />
                      ) : (
                        <span className="rounded bg-tint-gold px-1.5 py-0.5 text-[11px] font-semibold text-brand-ink">
                          Cek
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {b.content_text.slice(0, 80)}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </Panel>

      {/* CENTER: KEYED BLOCK EDITOR */}
      <Panel
        id="workbench-editor"
        title="Pemeriksaan Blok"
        className="min-w-0 xl:col-span-6"
      >
        {selectedBlock ? (
          <BlockReviewEditor
            key={selectedBlock.id}
            documentId={document.id}
            block={selectedBlock}
            equation={eqMap.get(selectedBlock.id)}
            table={tblMap.get(selectedBlock.id)}
            figure={figMap.get(selectedBlock.id)}
            onSavedBlock={handleSavedBlock}
            onNextUnverified={() => {
              if (nextUnverified) handleSelectBlock(nextUnverified);
            }}
            hasNextUnverified={Boolean(nextUnverified)}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Dokumen ini belum memiliki blok untuk diperiksa.
          </p>
        )}
      </Panel>

      {/* RIGHT: REVIEW DECISION & PUBLISHING */}
      <Panel
        id="workbench-decision"
        title="Keputusan Review"
        className="min-w-0 xl:col-span-3"
      >
        <form onSubmit={handleSubmitDecision} className="space-y-4 font-ui">
          <div className="flex items-center justify-between gap-2 rounded-xl bg-surface-subtle/80 p-3 text-xs">
            <span className="text-muted-foreground">Status saat ini</span>
            <ReviewStatusChip status={document.review_status} />
          </div>

          <div className="space-y-1 rounded-xl border border-border p-3 text-xs">
            <p className="font-semibold text-foreground">Sumber versi dokumen</p>
            <p className="truncate font-mono text-muted-foreground">
              {document.original_filename}
            </p>
            <p className="text-muted-foreground">
              Versi {formatVersion(document.current_version_id)}
            </p>
          </div>

          {!isDatabaseDocument ? (
            <p className="rounded-xl bg-tint-gold p-3 text-xs text-brand-ink">
              Dokumen bawaan contoh ini tidak tersimpan sebagai entitas database; pengiriman ke API akan mengembalikan respons validasi server.
            </p>
          ) : null}

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-foreground">
              Pilih status publikasi
            </legend>
            <div className="space-y-2">
              {(
                [
                  {
                    value: "verified",
                    label: "Setujui dan bagikan ke kelas",
                    hint: "Materi dapat dipakai bersama oleh mahasiswa kelas ini.",
                  },
                  {
                    value: "needs_revision",
                    label: "Perlu perbaikan",
                    hint: "Kembalikan catatan ke pengunggah atau tim.",
                  },
                  {
                    value: "in_review",
                    label: "Tandai sedang ditinjau",
                    hint: "Simpan progres tanpa memublikasikan ke kelas.",
                  },
                ] as const
              ).map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-start gap-2.5 rounded-xl border p-3 text-xs transition-colors",
                    decision === option.value
                      ? "border-primary bg-brand-mint/40 dark:bg-secondary/40"
                      : "border-border bg-background hover:bg-surface-subtle"
                  )}
                >
                  <input
                    id={`review-decision-${option.value}`}
                    type="radio"
                    name="review-decision"
                    value={option.value}
                    checked={decision === option.value}
                    onChange={() => setDecision(option.value)}
                    className="mt-0.5 size-4 accent-primary"
                  />
                  <label
                    htmlFor={`review-decision-${option.value}`}
                    className="flex-1 cursor-pointer space-y-0.5"
                  >
                    <span className="block font-semibold text-foreground">
                      {option.label}
                    </span>
                    <span className="block font-sans text-muted-foreground">
                      {option.hint}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </fieldset>

          {decision === "verified" && unverifiedCount > 0 ? (
            <p
              role="status"
              className="rounded-xl bg-tint-peach p-3 text-xs font-medium text-brand-ink"
            >
              Terdapat {unverifiedCount} blok yang belum diverifikasi. Verifikasi seluruh blok terlebih dahulu atau pilih status lain untuk menyimpan progres.
            </p>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="review-decision-notes">Catatan untuk pengunggah</Label>
            <Textarea
              id="review-decision-notes"
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Ringkasan hasil pemeriksaan MathML, tabel, atau deskripsi visual…"
              className="font-sans text-sm"
            />
          </div>

          {submitError ? (
            <div
              role="alert"
              className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
            >
              {submitError}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={
              submittingReview || (decision === "verified" && unverifiedCount > 0)
            }
            className="min-h-11 w-full rounded-full text-sm font-semibold"
          >
            <Send className="size-4" aria-hidden="true" />
            <span>
              {submittingReview ? "Menyimpan keputusan…" : "Kirim Keputusan"}
            </span>
          </Button>
        </form>
      </Panel>
    </div>
  );
}
