"use client";

import React, { useMemo } from "react";
import katex from "katex";
import { cn } from "cn";

interface FormattedMathTextProps {
  text: string;
  className?: string;
  as?: "p" | "span" | "div";
}

/**
 * Splits text into alternating plain text and inline/display math chunks,
 * rendering LaTeX formulas using KaTeX into styled accessible math.
 */
export function FormattedMathText({
  text,
  className,
  as: Component = "p",
}: FormattedMathTextProps) {
  const renderedElements = useMemo(() => {
    if (!text) return null;

    // Pattern matching:
    // 1. \[ ... \] (display math)
    // 2. \( ... \) (inline math)
    // 3. $$ ... $$ (display math)
    // 4. $ ... $   (inline math)
    const mathRegex =
      /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|\$\$([\s\S]*?)\$\$|\$([^\$\n]+)\$/g;

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let keyIdx = 0;

    while ((match = mathRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(
          <span key={`text-${keyIdx++}`}>
            {text.slice(lastIndex, match.index)}
          </span>
        );
      }

      const rawFormula = match[1] || match[2] || match[3] || match[4] || "";
      const isDisplay = Boolean(match[1] || match[3]);

      try {
        const html = katex.renderToString(rawFormula.trim(), {
          displayMode: isDisplay,
          throwOnError: false,
        });

        elements.push(
          <span
            key={`math-${keyIdx++}`}
            className={cn(
              "inline-math-container font-sans inline-block align-baseline mx-0.5",
              isDisplay && "my-2 block text-center"
            )}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        elements.push(
          <code
            key={`math-err-${keyIdx++}`}
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground"
          >
            {rawFormula}
          </code>
        );
      }

      lastIndex = mathRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      elements.push(
        <span key={`text-${keyIdx++}`}>{text.slice(lastIndex)}</span>
      );
    }

    return elements;
  }, [text]);

  return <Component className={className}>{renderedElements}</Component>;
}

interface MathEquationViewProps {
  latex?: string;
  contentText: string;
  mathMl?: string;
  spokenText?: string;
  className?: string;
}

export function MathEquationView({
  latex,
  contentText,
  mathMl,
  spokenText,
  className,
}: MathEquationViewProps) {
  const [showCode, setShowCode] = React.useState(false);

  const formula = useMemo(() => {
    let raw = (latex || contentText || "").trim();
    if (
      (raw.startsWith("\\[") && raw.endsWith("\\]")) ||
      (raw.startsWith("\\(") && raw.endsWith("\\)"))
    ) {
      raw = raw.slice(2, -2).trim();
    } else if (raw.startsWith("$$") && raw.endsWith("$$")) {
      raw = raw.slice(2, -2).trim();
    } else if (raw.startsWith("$") && raw.endsWith("$") && raw.length > 2) {
      raw = raw.slice(1, -1).trim();
    }
    return raw;
  }, [latex, contentText]);

  const katexHtml = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode: true,
        throwOnError: false,
      });
    } catch {
      return null;
    }
  }, [formula]);

  return (
    <div className={cn("space-y-3", className)}>
      <div
        tabIndex={0}
        role="region"
        aria-label={
          spokenText ? `Rumus: ${spokenText}` : `Rumus matematika: ${formula}`
        }
        className="overflow-x-auto rounded-2xl border border-primary/25 bg-card p-5 shadow-xs transition-colors hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {katexHtml ? (
          <div
            className="flex min-h-12 items-center justify-center text-center text-lg text-foreground font-sans"
            dangerouslySetInnerHTML={{ __html: katexHtml }}
          />
        ) : mathMl ? (
          <div
            className="flex min-h-12 items-center justify-center text-center text-lg text-foreground font-sans"
            dangerouslySetInnerHTML={{ __html: mathMl }}
          />
        ) : (
          <p className="font-mono text-center text-sm text-foreground">
            {formula}
          </p>
        )}
      </div>

      {spokenText && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-ui">
          <span className="font-semibold text-foreground">Narasi suara:</span>
          <span>{spokenText}</span>
        </p>
      )}

      <div className="font-ui">
        <button
          type="button"
          onClick={() => setShowCode((prev) => !prev)}
          className="text-[11px] font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
        >
          {showCode ? "Sembunyikan kode LaTeX" : "Lihat kode LaTeX asli"}
        </button>

        {showCode && (
          <pre className="mt-2 w-full overflow-x-auto rounded-xl bg-muted/60 p-3 font-mono text-xs text-foreground">
            <code>{formula}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
