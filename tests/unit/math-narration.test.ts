import { describe, expect, it } from "vitest";
import { narrateLatexEquation } from "@/features/math-ocr/math-narration";
import { latexToMathMl } from "@/features/math-ocr/latex-to-mathml";

describe("SONAR Deterministic Math Narration & MathML Engine", () => {
  it("narrates definite integrals accurately in English and Indonesian", () => {
    const res = narrateLatexEquation("\\int_0^1 x^2 \\, dx");
    expect(res.supported).toBe(true);
    expect(res.confidencePenalty).toBe(0);
    expect(res.narrationEn.toLowerCase()).toContain("integral from 0 to 1");
    expect(res.narrationEn.toLowerCase()).toContain("x squared");
    expect(res.narrationId.toLowerCase()).toContain("integral dari nol sampai satu");
    expect(res.narrationId.toLowerCase()).toContain("x kuadrat");
    expect(res.explorationTree.length).toBeGreaterThan(0);
  });

  it("narrates fractions and square roots cleanly", () => {
    const res = narrateLatexEquation("x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}");
    expect(res.supported).toBe(true);
    expect(res.narrationEn).toContain("fraction with numerator");
    expect(res.narrationEn).toContain("square root of");
    expect(res.narrationId).toContain("pecahan dengan pembilang");
    expect(res.narrationId).toContain("akar kuadrat dari");
  });

  it("flags unsupported matrix macros explicitly rather than dropping them", () => {
    const res = narrateLatexEquation("A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}");
    expect(res.supported).toBe(false);
    expect(res.unsupportedConstructs).toContain("\\begin{bmatrix}");
    expect(res.confidencePenalty).toBeGreaterThan(0);
    expect(res.narrationEn).toContain("Warning:");
  });

  it("converts valid LaTeX into sanitized semantic MathML", () => {
    const mml = latexToMathMl("\\frac{a + b}{c}");
    expect(mml.valid).toBe(true);
    expect(mml.mathml).toContain("<math");
    expect(mml.mathml).toContain("<mfrac>");
  });

  it("flags invalid LaTeX syntax via MathJax parse validation", () => {
    const mml = latexToMathMl("\\frac{1}{");
    expect(mml.valid).toBe(false);
  });
});
