"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Pause,
  Play,
  Square,
  Volume2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { narrateLatexEquation } from "@/features/math-ocr/math-narration";
import { useAccessibilityStore } from "@/stores/accessibility-store";
import { useAudioReader } from "@/features/audio/use-audio-reader";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useTranslation } from "@/lib/i18n/use-translation";

const PRESET_EQUATIONS = [
  {
    label: "Definite integral",
    latex: "\\int_0^1 x^2 \\, dx = \\frac{1}{3}",
  },
  {
    label: "Quadratic formula",
    latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
  },
  {
    label: "Standard normal PDF",
    latex: "f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{(x - \\mu)^2}{2\\sigma^2}}",
  },
  {
    label: "Matrix (flagged for review)",
    latex: "A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}",
  },
];

export function InteractiveSandbox() {
  const { t } = useTranslation();
  const [latexInput, setLatexInput] = useState(PRESET_EQUATIONS[0].latex);
  const [expandedLayer, setExpandedLayer] = useState<
    "summary" | "axes" | "trends" | "uncertainty"
  >("summary");
  const language = useAccessibilityStore((s) => s.language);
  const setLanguage = useAccessibilityStore((s) => s.setLanguage);
  const narrationSpeed = useAccessibilityStore((s) => s.narrationSpeed);
  const { announce } = useLiveAnnouncer();

  const narrationResult = useMemo(
    () => narrateLatexEquation(latexInput),
    [latexInput]
  );

  const spokenPhrase =
    language === "id" ? narrationResult.narrationId : narrationResult.narrationEn;

  const audioBlocks = useMemo(
    () => [{ id: "sandbox-eq", spokenText: spokenPhrase }],
    [spokenPhrase]
  );

  const audio = useAudioReader({
    blocks: audioBlocks,
    rate: narrationSpeed,
    language,
    onAnnounce: (msg) => announce(msg),
  });

  return (
    <section
      aria-labelledby="sandbox-heading"
      className="rounded-2xl border bg-card p-6 shadow-xs sm:p-8"
    >
      <div className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-accent-teal-text">
            {t("sandboxEnginePreview")}
          </p>
          <h2
            id="sandbox-heading"
            className="font-heading text-2xl font-semibold tracking-tight text-foreground"
          >
            {t("sandboxHeading")}
          </h2>
        </div>

        <div
          role="group"
          aria-label={t("language")}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border bg-surface-subtle p-1"
        >
          <Button
            size="sm"
            variant={language === "en" ? "default" : "ghost"}
            aria-pressed={language === "en"}
            onClick={() => {
              setLanguage("en");
              announce("Narration language switched to English.");
            }}
          >
            English
          </Button>
          <Button
            size="sm"
            variant={language === "id" ? "default" : "ghost"}
            aria-pressed={language === "id"}
            onClick={() => {
              setLanguage("id");
              announce("Bahasa narasi diubah ke Bahasa Indonesia.");
            }}
          >
            Bahasa Indonesia
          </Button>
        </div>
      </div>

      <Tabs defaultValue="equations" className="mt-6">
        <TabsList className="grid h-auto w-full grid-cols-3 sm:inline-flex sm:h-9 sm:w-auto">
          <TabsTrigger value="equations" className="text-xs sm:text-sm">
            {t("sandboxMathNarration")}
          </TabsTrigger>
          <TabsTrigger value="tables" className="text-xs sm:text-sm">
            {t("sandboxSemanticTable")}
          </TabsTrigger>
          <TabsTrigger value="figures" className="text-xs sm:text-sm">
            {t("sandboxLayeredFigure")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equations" className="mt-6 space-y-5">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Sample equations">
            {PRESET_EQUATIONS.map((preset) => (
              <Button
                key={preset.label}
                variant={latexInput === preset.latex ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  setLatexInput(preset.latex);
                  announce(`Loaded ${preset.label} equation.`);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sandbox-latex-input">
              {t("sandboxLatexInputLabel")}
            </Label>
            <Input
              id="sandbox-latex-input"
              value={latexInput}
              onChange={(e) => setLatexInput(e.target.value)}
              className="font-mono text-sm"
              aria-describedby="sandbox-latex-help"
            />
            <p id="sandbox-latex-help" className="text-xs text-muted-foreground">
              {t("sandboxLatexHelp")}
            </p>
          </div>

          <div className="grid gap-4 rounded-xl border bg-surface-subtle p-5 lg:grid-cols-[1fr_auto]">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {narrationResult.supported ? (
                  <StatusBadge status="verified_block" />
                ) : (
                  <StatusBadge status="ai_draft" />
                )}
                <span className="text-xs text-muted-foreground">
                  {narrationResult.supported
                    ? t("sandboxRuleSupported")
                    : t("sandboxHumanReview")}
                </span>
              </div>

              <div className="sonar-reader-prose">
                <p className="font-medium text-foreground">{spokenPhrase}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              {audio.isPlaying ? (
                <Button variant="outline" onClick={audio.pause}>
                  <Pause className="size-4" aria-hidden="true" />
                  <span>{t("sandboxPause")}</span>
                </Button>
              ) : (
                <Button
                  onClick={() => audio.playFrom(0)}
                  disabled={!audio.isSupported}
                >
                  {audio.isPaused ? (
                    <Play className="size-4" aria-hidden="true" />
                  ) : (
                    <Volume2 className="size-4" aria-hidden="true" />
                  )}
                  <span>
                    {audio.isPaused
                      ? t("sandboxResumeSpeech")
                      : t("sandboxListenNow")}
                  </span>
                </Button>
              )}
              {(audio.isPlaying || audio.isPaused) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={audio.stop}
                  aria-label={t("sandboxStopSpeech")}
                >
                  <Square className="size-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tables" className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {t("sandboxTableColScope")}{" "}
              <code className="font-mono text-xs">&lt;th scope=&quot;col&quot;&gt;</code>{" "}
              and <code className="font-mono text-xs">&lt;th scope=&quot;row&quot;&gt;</code>.
            </p>
            <StatusBadge status="verified" />
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="border-b bg-surface-subtle px-4 py-3 text-left font-medium text-foreground">
                {t("sandboxTableCaption")}
              </caption>
              <thead>
                <tr className="border-b bg-muted/50">
                  <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                    {t("sandboxQuarter")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                    {t("sandboxPriceElasticity")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                    {t("sandboxUnitDemand")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                    {t("sandboxTotalRevenue")}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <th scope="row" className="px-4 py-3 font-medium text-foreground">
                    Q1 2026
                  </th>
                  <td className="px-4 py-3">-0.82</td>
                  <td className="px-4 py-3 tabular-nums">14,200</td>
                  <td className="px-4 py-3 tabular-nums">$142,000</td>
                </tr>
                <tr className="border-b">
                  <th scope="row" className="px-4 py-3 font-medium text-foreground">
                    Q2 2026
                  </th>
                  <td className="px-4 py-3">-1.15</td>
                  <td className="px-4 py-3 tabular-nums">18,650</td>
                  <td className="px-4 py-3 tabular-nums">$167,850</td>
                </tr>
                <tr>
                  <th scope="row" className="px-4 py-3 font-medium text-foreground">
                    Q3 2026
                  </th>
                  <td className="px-4 py-3">-1.04</td>
                  <td className="px-4 py-3 tabular-nums">17,900</td>
                  <td className="px-4 py-3 tabular-nums">$161,100</td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="figures" className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
              <span>{t("sandboxProgressiveDisclosure")}</span>
            </div>
            <StatusBadge status="ai_draft" />
          </div>

          <div
            role="group"
            aria-label="Layered figure description depth"
            className="flex flex-wrap gap-2"
          >
            {(
              [
                { id: "summary", label: t("sandboxFigureOverview") },
                { id: "axes", label: t("sandboxFigureAxes") },
                { id: "trends", label: t("sandboxFigureTrends") },
                { id: "uncertainty", label: t("sandboxFigureUncertainty") },
              ] as const
            ).map((layer) => (
              <Button
                key={layer.id}
                size="sm"
                variant={expandedLayer === layer.id ? "default" : "outline"}
                aria-pressed={expandedLayer === layer.id}
                onClick={() => setExpandedLayer(layer.id)}
              >
                {layer.label}
              </Button>
            ))}
          </div>

          <figure className="rounded-xl border bg-surface-subtle p-5">
            <figcaption className="font-heading text-base font-semibold text-foreground">
              {t("sandboxFigureCaption")}
            </figcaption>
            <div className="sonar-reader-prose mt-3 space-y-2 text-foreground">
              {expandedLayer === "summary" && (
                <p>{t("sandboxFigDescSummary")}</p>
              )}
              {expandedLayer === "axes" && (
                <p>{t("sandboxFigDescAxes")}</p>
              )}
              {expandedLayer === "trends" && (
                <p>{t("sandboxFigDescTrends")}</p>
              )}
              {expandedLayer === "uncertainty" && (
                <p className="flex items-start gap-2">
                  <AlertTriangle
                    className="mt-1 size-4 shrink-0 text-warning"
                    aria-hidden="true"
                  />
                  <span>{t("sandboxFigDescUncertainty")}</span>
                </p>
              )}
            </div>
          </figure>
        </TabsContent>
      </Tabs>
    </section>
  );
}
