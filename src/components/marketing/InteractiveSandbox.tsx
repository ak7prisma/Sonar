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
    label: "Matrix (flagged for volunteer review)",
    latex: "A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}",
  },
];

export function InteractiveSandbox() {
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
            Live Accessibility Engine Preview
          </p>
          <h2
            id="sandbox-heading"
            className="font-heading text-2xl font-semibold tracking-tight text-foreground"
          >
            Test SONAR&apos;s equation narrator, structured tables, and layered
            figure descriptions
          </h2>
        </div>

        <div
          role="group"
          aria-label="Narration language"
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
          <TabsTrigger value="equations" className="text-xs sm:text-sm">Math Narration</TabsTrigger>
          <TabsTrigger value="tables" className="text-xs sm:text-sm">Semantic Table</TabsTrigger>
          <TabsTrigger value="figures" className="text-xs sm:text-sm">Layered Figure</TabsTrigger>
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
              LaTeX academic equation input
            </Label>
            <Input
              id="sandbox-latex-input"
              value={latexInput}
              onChange={(e) => setLatexInput(e.target.value)}
              className="font-mono text-sm"
              aria-describedby="sandbox-latex-help"
            />
            <p id="sandbox-latex-help" className="text-xs text-muted-foreground">
              Deterministic rule-based speech translation runs locally in real
              time and flags unsupported constructs instead of hiding them.
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
                    ? "Supported rule-based grammar"
                    : "Unsupported construct flagged for human review"}
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
                  <span>Pause</span>
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
                  <span>{audio.isPaused ? "Resume speech" : "Listen now"}</span>
                </Button>
              )}
              {(audio.isPlaying || audio.isPaused) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={audio.stop}
                  aria-label="Stop speech playback"
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
              Screen readers announce explicit row and column headers using native{" "}
              <code className="font-mono text-xs">&lt;th scope=&quot;col&quot;&gt;</code>{" "}
              and <code className="font-mono text-xs">&lt;th scope=&quot;row&quot;&gt;</code>.
            </p>
            <StatusBadge status="verified" />
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="border-b bg-surface-subtle px-4 py-3 text-left font-medium text-foreground">
                Table 1 — Quarterly Elasticity &amp; Revenue Summary (ECON-110)
              </caption>
              <thead>
                <tr className="border-b bg-muted/50">
                  <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                    Quarter
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                    Price Elasticity
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                    Unit Demand
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                    Total Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <th scope="row" className="px-4 py-3 font-medium text-foreground">
                    Q1 2026
                  </th>
                  <td className="px-4 py-3">-0.82 (Inelastic)</td>
                  <td className="px-4 py-3 tabular-nums">14,200</td>
                  <td className="px-4 py-3 tabular-nums">$142,000</td>
                </tr>
                <tr className="border-b">
                  <th scope="row" className="px-4 py-3 font-medium text-foreground">
                    Q2 2026
                  </th>
                  <td className="px-4 py-3">-1.15 (Elastic)</td>
                  <td className="px-4 py-3 tabular-nums">18,650</td>
                  <td className="px-4 py-3 tabular-nums">$167,850</td>
                </tr>
                <tr>
                  <th scope="row" className="px-4 py-3 font-medium text-foreground">
                    Q3 2026
                  </th>
                  <td className="px-4 py-3">-1.04 (Unit near-elastic)</td>
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
              <span>Progressive disclosure avoids cognitive overload</span>
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
                { id: "summary", label: "1. Overview" },
                { id: "axes", label: "2. Axes & Units" },
                { id: "trends", label: "3. Key Trends" },
                { id: "uncertainty", label: "4. Uncertainty Notes" },
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
              Figure 3.2 — Action Potential Membrane Voltage Curve (BIO-204)
            </figcaption>
            <div className="sonar-reader-prose mt-3 space-y-2 text-foreground">
              {expandedLayer === "summary" && (
                <p>
                  Line graph showing neuron membrane potential transitioning from
                  resting state (-70 mV) through rapid depolarization to +35 mV,
                  followed by repolarization and brief hyperpolarization.
                </p>
              )}
              {expandedLayer === "axes" && (
                <p>
                  Horizontal axis: Time in milliseconds from 0 ms to 5 ms in 1 ms
                  increments. Vertical axis: Membrane potential in millivolts from
                  -90 mV to +40 mV, with a dashed threshold line marked at -55 mV.
                </p>
              )}
              {expandedLayer === "trends" && (
                <p>
                  Once stimulus crosses the -55 mV threshold at 1.1 ms, voltage
                  rises steeply to peak at +35 mV near 2.0 ms, drops below resting
                  level to -80 mV at 3.4 ms, and stabilizes back at -70 mV by 4.6 ms.
                </p>
              )}
              {expandedLayer === "uncertainty" && (
                <p className="flex items-start gap-2">
                  <AlertTriangle
                    className="mt-1 size-4 shrink-0 text-warning"
                    aria-hidden="true"
                  />
                  <span>
                    Sub-millisecond grid ticks between 2.0 ms and 3.0 ms are
                    estimated visually from the scanned slide and flagged for
                    volunteer verification.
                  </span>
                </p>
              )}
            </div>
          </figure>
        </TabsContent>
      </Tabs>
    </section>
  );
}
