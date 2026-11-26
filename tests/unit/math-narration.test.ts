import { describe, expect, it } from "vitest";
import {
  narrateLatexEquation,
  narrateMixedText,
} from "@/features/math-ocr/math-narration";
import { latexToMathMl } from "@/features/math-ocr/latex-to-mathml";
import { parseTableData, narrateTable } from "@/lib/accessibility/table-narration";

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

  it("narrates complex vector math, norms, and unit vectors accurately", () => {
    const res = narrateLatexEquation("\\|\\vec{a}\\| = \\sqrt{a_1^2 + a_2^2}");
    expect(res.supported).toBe(true);
    expect(res.narrationId.toLowerCase()).toContain("vektor a");
    expect(res.narrationId.toLowerCase()).toContain("akar kuadrat");
    expect(res.narrationEn.toLowerCase()).toContain("vector a");

    const vecDot = narrateLatexEquation("\\vec{a} = 2\\hat{i} + 2\\hat{j}");
    expect(vecDot.supported).toBe(true);
    expect(vecDot.narrationId.toLowerCase()).toContain("vektor a");
    expect(vecDot.narrationId.toLowerCase()).toContain("vektor satuan i");
  });

  it("narrates set operations (irisan/gabungan) and inequalities correctly in Indonesian", () => {
    const setRes = narrateLatexEquation("A \\cap B \\cup C");
    expect(setRes.supported).toBe(true);
    expect(setRes.narrationId.toLowerCase()).toContain("irisan");
    expect(setRes.narrationId.toLowerCase()).toContain("gabungan");
    expect(setRes.narrationEn.toLowerCase()).toContain("intersection");
    expect(setRes.narrationEn.toLowerCase()).toContain("union");

    const ineqRes = narrateLatexEquation("x < 5 \\le y > 2 \\ge z");
    expect(ineqRes.supported).toBe(true);
    expect(ineqRes.narrationId.toLowerCase()).toContain("kurang dari");
    expect(ineqRes.narrationId.toLowerCase()).toContain("kurang dari atau sama dengan");
    expect(ineqRes.narrationId.toLowerCase()).toContain("lebih dari");
    expect(ineqRes.narrationId.toLowerCase()).toContain("lebih dari atau sama dengan");
  });

  it("narrates mixed prose paragraphs with inline math formulas seamlessly", () => {
    const prose =
      "Contoh 4.2: Tentukan hasil kali dari vektor \\(\\vec{a} = 2\\hat{i}\\) jika \\(x < 10\\).";
    const spokenId = narrateMixedText(prose, "id");
    expect(spokenId).toContain("vektor a sama dengan dua vektor satuan i");
    expect(spokenId).toContain("x kurang dari");
    expect(spokenId).not.toContain("\\(");
    expect(spokenId).not.toContain("\\vec");
    expect(spokenId).not.toContain("backslash");
  });

  it("narrates un-delimited LaTeX sets, subscripts, and Greek symbols naturally without raw code", () => {
    const text =
      'kejadian E_7 = "robot" himpunan \\{(x, y), L - 3 \\le x \\le L, 0 \\le y \\le W\\}. E_8 = "robot" \\varepsilon \\text{ kaki}';
    const spoken = narrateMixedText(text, "id");
    expect(spoken).toContain("E indeks tujuh");
    expect(spoken).toContain("himpunan");
    expect(spoken).toContain("kurang dari atau sama dengan");
    expect(spoken).toContain("epsilon kaki");
    expect(spoken).not.toContain("\\");
  });

  it("narrates un-delimited vector equations, coordinate tuples, and norms into natural speech", () => {
    const text =
      "Diketahui o{a} dan o{b} di ruang (\\mathbb{R}^3).\n* \\bar{a} + \\bar{b} = (a_1 + b_1, a_2 + b_2, a_3 + b_3)\n* Luas \\|\\bar{u} \\times \\bar{v}\\|";
    const spoken = narrateMixedText(text, "id");
    expect(spoken.toLowerCase()).toContain("vektor a");
    expect(spoken.toLowerCase()).toContain("vektor b");
    expect(spoken.toLowerCase()).toContain("ruang r tiga");
    expect(spoken.toLowerCase()).toContain("panjang vektor");
    expect(spoken.toLowerCase()).toContain("dikali silang");
    expect(spoken).not.toContain("\\");
  });

  it("parses and narrates tabular data with mathematical cells cleanly for screen readers", () => {
    const htmlTable = `
      <table>
        <caption>Operasi Vektor</caption>
        <thead><tr><th>Vektor</th><th>Operasi</th></tr></thead>
        <tbody>
          <tr><td>\\bar{a}</td><td>\\bar{a} + \\bar{b}</td></tr>
          <tr><td>\\bar{u}</td><td>\\|\\bar{u} \\times \\bar{v}\\|</td></tr>
        </tbody>
      </table>
    `;
    const parsed = parseTableData(htmlTable);
    expect(parsed.caption).toBe("Operasi Vektor");
    expect(parsed.headers).toEqual(["Vektor", "Operasi"]);
    expect(parsed.rows.length).toBe(2);

    const spoken = narrateTable(parsed, "id");
    expect(spoken).toContain("Tabel: Operasi Vektor");
    expect(spoken).toContain("Terdiri dari 2 kolom: Vektor, Operasi");
    expect(spoken).toContain("Baris 1: Vektor: vektor a, Operasi: vektor a tambah vektor b");
    expect(spoken).toContain("Baris 2: Vektor: vektor u, Operasi: panjang vektor u dikali silang vektor v");
  });
});
