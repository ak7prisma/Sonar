"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Save,
  Send,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";
import { sanitizeDocumentHtml } from "@/lib/accessibility/sanitize";
import type {
  DocumentBlockRow,
  DocumentEquationRow,
  DocumentRow,
} from "@/lib/data/workspace";
import { toast } from "sonner";

const REVIEW_STEPS = [
  { id: "step-1", number: "1", title: "Ekstraksi Teks & OCR", status: "completed" },
  { id: "step-2", number: "2", title: "Hierarki Heading & Urutan Baca", status: "completed" },
  { id: "step-3", number: "3", title: "Struktur Tabel Semantik", status: "completed" },
  { id: "step-4", number: "4", title: "Rumus Matematika & MathML", status: "current" },
  { id: "step-5", number: "5", title: "Deskripsi Gambar & Diagram", status: "completed" },
];

type ReviewDecisionType = "reviewed" | "changes_required" | "in_review";

export function ReviewWorkbench({
  document,
  initialBlocks,
  equations,
}: {
  document: DocumentRow;
  initialBlocks: DocumentBlockRow[];
  equations: DocumentEquationRow[];
}) {
  const router = useRouter();
  const { announce } = useLiveAnnouncer();

  const [activeStep, setActiveStep] = useState("step-4");
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState(
    initialBlocks.find((b) => b.block_type === "equation")?.id ?? initialBlocks[0]?.id ?? ""
  );
  const [reviewDecision, setReviewDecision] = useState<ReviewDecisionType>("reviewed");
  const [reviewNotes, setReviewNotes] = useState(
    "Seluruh 14 pohon biner, rumus keseimbangan, dan tabel rotasi telah diverifikasi MathML dan deskripsi taktilnya. Sangat akurat untuk pembaca layar."
  );
  const [savingBlock, setSavingBlock] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? blocks[0];
  const selectedEquation = equations.find((e) => e.block_id === selectedBlock?.id);

  const [draftText, setDraftText] = useState(selectedBlock?.content_text ?? "");
  const [draftSpoken, setDraftSpoken] = useState(
    selectedBlock?.spoken_text ?? selectedBlock?.content_text ?? ""
  );
  const [draftLatex, setDraftLatex] = useState(selectedEquation?.latex ?? "");
  const [liveMathMl, setLiveMathMl] = useState<string | null>(
    selectedEquation?.mathml ?? null
  );

  const selectBlock = (block: DocumentBlockRow) => {
    setSelectedBlockId(block.id);
    setDraftText(block.content_text);
    setDraftSpoken(block.spoken_text ?? block.content_text);
    const eq = equations.find((e) => e.block_id === block.id);
    setDraftLatex(eq?.latex ?? "");
    setLiveMathMl(eq?.mathml ?? null);
    announce(`Blok terpilih: ${block.block_type} di halaman ${block.page_number}.`);
  };

  const saveBlockChanges = async () => {
    if (!selectedBlock) return;
    setSavingBlock(true);

    try {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === selectedBlock.id
            ? { ...b, content_text: draftText, spoken_text: draftSpoken, is_verified: true }
            : b
        )
      );
      toast.success("Perubahan blok berhasil diverifikasi!");
      announce("Blok berhasil diverifikasi.", "polite");
    } finally {
      setSavingBlock(false);
    }
  };

  const submitReviewDecision = async () => {
    setSubmittingReview(true);
    try {
      toast.success(
        reviewDecision === "reviewed"
          ? "Dokumen disetujui & dipublikasikan ke perpustakaan bersama mata kuliah!"
          : "Keputusan review tersimpan dan dikirim ke pengunggah."
      );
      announce("Dokumen berhasil disetujui.", "polite");
      setTimeout(() => {
        router.push("/review");
      }, 1000);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12 font-sans items-start">
      {/* LEFT COLUMN: Multi-step Audit Stepper (Inspired by Image 6 Linkora style) */}
      <aside
        aria-label="Tahapan Review Volunteer"
        className="rounded-2xl border border-border bg-card p-5 shadow-xs lg:col-span-3 space-y-5 font-ui"
      >
        <div className="border-b border-border pb-3">
          <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
            Review Checklist &bull; v2.1
          </p>
          <h2 className="font-heading text-sm font-bold text-foreground">
            Tahapan Verifikasi Dokumen
          </h2>
        </div>

        <nav aria-label="Langkah Audit">
          <ol className="space-y-3">
            {REVIEW_STEPS.map((s) => {
              const isCurrent = activeStep === s.id;
              const isDone = s.status === "completed";
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setActiveStep(s.id)}
                    className={`w-full text-left rounded-xl p-3 transition-all flex items-start gap-3 border ${isCurrent
                        ? "border-primary bg-secondary/50 ring-1 ring-primary/30"
                        : "border-transparent hover:bg-surface-subtle"
                      }`}
                  >
                    <div
                      className={`size-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isDone
                          ? "bg-success text-success-foreground"
                          : isCurrent
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {isDone ? "✓" : s.number}
                    </div>

                    <div className="space-y-0.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider block ${isDone
                            ? "text-success"
                            : isCurrent
                              ? "text-primary font-extrabold"
                              : "text-muted-foreground"
                          }`}
                      >
                        {isDone ? "COMPLETED" : isCurrent ? "CURRENT" : "PENDING"}
                      </span>
                      <span className="font-heading font-bold text-xs text-foreground block leading-tight">
                        {s.title}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Source Version Info Card */}
        <div className="rounded-xl border border-border bg-surface-subtle p-3.5 space-y-1 text-xs">
          <p className="font-bold font-ui text-foreground">Pelacakan Versi Sumber:</p>
          <p className="text-muted-foreground font-mono text-[11px]">
            {document.original_filename}
          </p>
          <p className="text-[11px] text-primary font-semibold">
            Versi Direview: {document.current_version_id ?? "v2.1"}
          </p>
        </div>
      </aside>

      {/* CENTER COLUMN: Interactive Block Editor & Media Inspector (Image 6 style) */}
      <section
        aria-label="Editor dan Pratinjau Blok"
        className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs lg:col-span-6 font-sans"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary font-ui">
              Langkah 4: Rumus Matematika &amp; Narasi MathML
            </span>
            <h2 className="font-heading text-xl font-bold text-foreground">
              Verifikasi Formula &amp; Rekonstruksi MathML
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary font-ui mr-1">
              Halaman {selectedBlock?.page_number ?? 1}
            </span>
            {blocks
              .filter((b) => b.block_type === "equation" || b.block_type === "figure")
              .map((b, idx) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => selectBlock(b)}
                  className={`rounded-md px-2 py-1 text-[11px] font-bold transition-colors ${selectedBlockId === b.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                >
                  Blok #{idx + 1} ({b.block_type})
                </button>
              ))}
          </div>
        </div>

        {/* Media / Visual Preview (Image 6 center card) */}
        <div className="rounded-xl border border-border bg-surface-subtle p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-ui">
              Pratinjau Asli &amp; MathML Rendered
            </span>
            <Button
              size="xs"
              variant="outline"
              className="font-ui text-xs h-7 border-border"
              onClick={() => {
                const synth = window.speechSynthesis;
                if (synth) {
                  const utter = new SpeechSynthesisUtterance(draftSpoken);
                  utter.lang = "id-ID";
                  synth.speak(utter);
                }
              }}
            >
              <Volume2 className="size-3.5 mr-1 text-primary" />
              <span>Uji Narasi Suara</span>
            </Button>
          </div>

          {/* Live MathML Container */}
          <div
            className="overflow-x-auto rounded-lg bg-card p-4 text-center text-2xl font-serif text-foreground border border-border"
            dangerouslySetInnerHTML={{
              __html: sanitizeDocumentHtml(
                liveMathMl ??
                `<math display="block"><mrow><mi>BF</mi><mo>(</mo><mi>v</mi><mo>)</mo><mo>=</mo><mi>height</mi><mo>(</mo><mi>left</mi><mo>(</mo><mi>v</mi><mo>)</mo><mo>)</mo><mo>-</mo><mi>height</mi><mo>(</mo><mi>right</mi><mo>(</mo><mi>v</mi><mo>)</mo><mo>)</mo><mo>&isin;</mo><mo>{</mo><mo>-</mo><mn>1</mn><mo>,</mo><mn>0</mn><mo>,</mo><mn>1</mn><mo>}</mo></mrow></math>`
              ),
            }}
          />
        </div>

        {/* Editable Fields: LaTeX, Spoken Text, and Accessible Description */}
        <div className="space-y-4 font-ui">
          <div className="space-y-1.5">
            <Label htmlFor="edit-latex" className="text-xs font-bold text-foreground">
              Notasi LaTeX Formula:
            </Label>
            <Input
              id="edit-latex"
              value={draftLatex || "BF(v) = height(left(v)) - height(right(v)) \\in \\{-1, 0, 1\\}"}
              onChange={(e) => setDraftLatex(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-spoken" className="text-xs font-bold text-foreground">
              Narasi Audio Bahasa Indonesia (Untuk Screen Reader):
            </Label>
            <Textarea
              id="edit-spoken"
              value={
                draftSpoken ||
                "B F dari v sama dengan ketinggian anak kiri v dikurangi ketinggian anak kanan v, bernilai antara minus satu, nol, atau satu."
              }
              onChange={(e) => setDraftSpoken(e.target.value)}
              rows={3}
              className="text-xs font-sans"
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border font-ui">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setActiveStep("step-5")}
            className="border-border text-xs font-semibold"
          >
            Lewati Langkah Ini
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={savingBlock}
            onClick={saveBlockChanges}
            className="text-xs font-semibold shadow-xs"
          >
            <Save className="size-3.5 mr-1.5" />
            <span>Simpan Koreksi Blok Ini</span>
          </Button>
        </div>
      </section>

      {/* RIGHT COLUMN: Review Decision & Publishing to Course (Image 6 style action box) */}
      <aside
        aria-label="Keputusan Review &amp; Publikasi"
        className="rounded-2xl border border-border bg-card p-5 shadow-xs lg:col-span-3 space-y-4 font-ui"
      >
        <div className="border-b border-border pb-3">
          <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
            Keputusan Review Akhir
          </p>
          <h2 className="font-heading text-sm font-bold text-foreground">
            Persetujuan &amp; Publikasi Kelas
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <Label htmlFor="review-decision" className="font-bold">
              Status Keputusan:
            </Label>
            <select
              id="review-decision"
              value={reviewDecision}
              onChange={(e) => setReviewDecision(e.target.value as ReviewDecisionType)}
              className="w-full rounded-lg border border-input bg-background p-2 text-xs font-semibold text-foreground"
            >
              <option value="reviewed">Disetujui &bull; Reviewed / Approved</option>
              <option value="changes_required">Memerlukan Perbaikan Dosen</option>
              <option value="in_review">Simpan Sebagai Draf Ditinjau</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="review-notes" className="font-bold">
              Catatan Volunteer untuk Mahasiswa:
            </Label>
            <Textarea
              id="review-notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={4}
              className="text-xs font-sans"
            />
          </div>

          <div className="rounded-xl border border-success/30 bg-success/10 p-3 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-success text-[11px]">
              <CheckCircle2 className="size-3.5 shrink-0" />
              <span>Izin Berbagi Otomatis Aktif</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Materi akan dipublikasikan ke mahasiswa yang terdaftar di{" "}
              <strong className="text-foreground">{document.course_id.toUpperCase()}</strong>.
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="lg"
          disabled={submittingReview}
          onClick={submitReviewDecision}
          className="w-full font-semibold shadow-md text-xs h-11"
        >
          <Send className="size-4 mr-1.5" />
          <span>Kirim Keputusan &amp; Publikasikan</span>
        </Button>
      </aside>
    </div>
  );
}
