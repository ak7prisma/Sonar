import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { SerializedMmlVisitor } from "mathjax-full/js/core/MmlTree/SerializedMmlVisitor.js";
import { STATE } from "mathjax-full/js/core/MathItem.js";
import { sanitizeDocumentHtml } from "@/lib/accessibility/sanitize";

let initialized = false;

function getMathJaxDocument() {
  if (!initialized) {
    const adaptor = liteAdaptor();
    RegisterHTMLHandler(adaptor);
    initialized = true;
  }
  const tex = new TeX({
    packages: AllPackages.filter((pkg) => pkg !== "bussproofs"),
  });
  return mathjax.document("", { InputJax: tex });
}

export interface MathMlConversionResult {
  mathml: string | null;
  valid: boolean;
  error?: string;
}

/**
 * Converts LaTeX into sanitized semantic MathML using MathJax.
 * Also acts as a strict syntax validator for equation confidence scoring.
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

  try {
    const doc = getMathJaxDocument();
    const mmlNode = doc.convert(trimmed, {
      display: options.display ?? true,
      end: STATE.CONVERT,
    });
    const visitor = new SerializedMmlVisitor();
    const rawMathMl = visitor.visitTree(mmlNode);

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
  } catch (err) {
    return {
      mathml: null,
      valid: false,
      error: err instanceof Error ? err.message : "Failed to parse LaTeX expression.",
    };
  }
}
