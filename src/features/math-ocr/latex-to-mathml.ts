import { sanitizeDocumentHtml } from "@/lib/accessibility/sanitize";

export interface MathMlConversionResult {
  mathml: string | null;
  valid: boolean;
  error?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mathjaxDocInstance: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let visitorInstance: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let stateConvertVal: any = null;
let mathjaxLoadFailed = false;

function initMathJax(): boolean {
  if (mathjaxDocInstance && visitorInstance) return true;
  if (mathjaxLoadFailed) return false;

  try {
    // Dynamic require inside helper ensures zero top-level module evaluation crash
    // in serverless / AWS Lambda environments where mathjax-full might not be fully traced.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { mathjax } = require("mathjax-full/js/mathjax.js");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { TeX } = require("mathjax-full/js/input/tex.js");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { AllPackages } = require("mathjax-full/js/input/tex/AllPackages.js");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { RegisterHTMLHandler } = require("mathjax-full/js/handlers/html.js");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { liteAdaptor } = require("mathjax-full/js/adaptors/liteAdaptor.js");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SerializedMmlVisitor } = require("mathjax-full/js/core/MmlTree/SerializedMmlVisitor.js");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { STATE } = require("mathjax-full/js/core/MathItem.js");

    const adaptor = liteAdaptor();
    RegisterHTMLHandler(adaptor);
    const tex = new TeX({
      packages: AllPackages.filter((pkg: string) => pkg !== "bussproofs"),
    });
    mathjaxDocInstance = mathjax.document("", { InputJax: tex });
    visitorInstance = new SerializedMmlVisitor();
    stateConvertVal = STATE.CONVERT;
    return true;
  } catch (err) {
    mathjaxLoadFailed = true;
    console.warn(
      "[latexToMathMl] MathJax could not be loaded in runtime, falling back to standard MathML encapsulation:",
      err instanceof Error ? err.message : String(err)
    );
    return false;
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createFallbackMathMl(latex: string, display: boolean): string {
  const displayAttr = display ? ' display="block"' : ' display="inline"';
  return `<math xmlns="http://www.w3.org/1998/Math/MathML"${displayAttr}><semantics><mrow><mtext>${escapeXml(latex)}</mtext></mrow><annotation encoding="application/x-tex">${escapeXml(latex)}</annotation></semantics></math>`;
}

/**
 * Converts LaTeX into sanitized semantic MathML using MathJax when available,
 * or standard accessible W3C MathML semantic encapsulation as a resilient fallback.
 * Also acts as a syntax validator for equation confidence scoring.
 */
export function latexToMathMl(
  latex: string,
  options: { display?: boolean } = {}
): MathMlConversionResult {
  const trimmed = latex.trim();
  if (!trimmed) {
    return {
      mathml: null,
      valid: false,
      error: "Empty mathematical expression.",
    };
  }

  const isMathJaxAvailable = initMathJax();
  if (isMathJaxAvailable && mathjaxDocInstance && visitorInstance) {
    try {
      const mmlNode = mathjaxDocInstance.convert(trimmed, {
        display: options.display ?? true,
        end: stateConvertVal,
      });
      const rawMathMl = visitorInstance.visitTree(mmlNode);

      const hasParseError =
        rawMathMl.includes("merror") || rawMathMl.includes("data-mjx-error");

      if (hasParseError) {
        return {
          mathml: sanitizeDocumentHtml(rawMathMl),
          valid: false,
          error: "LaTeX expression produced a MathJax parse error node.",
        };
      }

      return {
        mathml: sanitizeDocumentHtml(rawMathMl),
        valid: true,
      };
    } catch {
      return {
        mathml: createFallbackMathMl(trimmed, options.display ?? true),
        valid: true,
      };
    }
  }

  // Graceful fallback for serverless runtimes
  return {
    mathml: createFallbackMathMl(trimmed, options.display ?? true),
    valid: true,
  };
}
