import type { ReaderLanguage } from "@/stores/accessibility-store";

export interface EquationNarrationResult {
  narrationEn: string;
  narrationId: string;
  supported: boolean;
  unsupportedConstructs: string[];
  confidencePenalty: number;
  explorationTree: EquationNode[];
}

export interface EquationNode {
  label: string;
  spokenEn: string;
  spokenId: string;
  latex: string;
  children?: EquationNode[];
}

const UNSUPPORTED_MACROS = [
  "\\begin{matrix}",
  "\\begin{pmatrix}",
  "\\begin{bmatrix}",
  "\\begin{cases}",
  "\\begin{aligned}",
  "\\oint",
  "\\iint",
  "\\iiint",
  "\\stackrel",
  "\\overset",
  "\\underset",
];

const GREEK_MAP: Record<string, { en: string; id: string }> = {
  "\\alpha": { en: "alpha", id: "alfa" },
  "\\beta": { en: "beta", id: "beta" },
  "\\gamma": { en: "gamma", id: "gama" },
  "\\Gamma": { en: "capital gamma", id: "gama besar" },
  "\\delta": { en: "delta", id: "delta" },
  "\\Delta": { en: "delta", id: "delta" },
  "\\epsilon": { en: "epsilon", id: "epsilon" },
  "\\varepsilon": { en: "epsilon", id: "epsilon" },
  "\\theta": { en: "theta", id: "teta" },
  "\\Theta": { en: "capital theta", id: "teta besar" },
  "\\lambda": { en: "lambda", id: "lambda" },
  "\\mu": { en: "mu", id: "miu" },
  "\\pi": { en: "pi", id: "pi" },
  "\\rho": { en: "rho", id: "ro" },
  "\\sigma": { en: "sigma", id: "sigma" },
  "\\Sigma": { en: "capital sigma", id: "sigma besar" },
  "\\tau": { en: "tau", id: "tau" },
  "\\phi": { en: "phi", id: "fi" },
  "\\omega": { en: "omega", id: "omega" },
  "\\Omega": { en: "capital omega", id: "omega besar" },
  "\\infty": { en: "infinity", id: "tak hingga" },
  "\\partial": { en: "partial", id: "parsial" },
  "\\nabla": { en: "nabla", id: "nabla" },
};

const FUNCTION_MAP: Record<string, { en: string; id: string }> = {
  "\\sin": { en: "sine of", id: "sinus dari" },
  "\\cos": { en: "cosine of", id: "kosinus dari" },
  "\\tan": { en: "tangent of", id: "tangen dari" },
  "\\ln": { en: "natural log of", id: "logaritma natural dari" },
  "\\log": { en: "log of", id: "logaritma dari" },
  "\\exp": { en: "exponential of", id: "eksponensial dari" },
};

function readBracedGroup(
  src: string,
  startIdx: number
): { content: string; nextIdx: number } {
  let idx = startIdx;
  while (idx < src.length && src[idx] === " ") idx++;
  if (idx >= src.length) return { content: "", nextIdx: idx };

  if (src[idx] !== "{") {
    return { content: src[idx], nextIdx: idx + 1 };
  }

  let depth = 0;
  const begin = idx + 1;
  for (; idx < src.length; idx++) {
    if (src[idx] === "{") depth++;
    else if (src[idx] === "}") {
      depth--;
      if (depth === 0) {
        return { content: src.slice(begin, idx), nextIdx: idx + 1 };
      }
    }
  }
  return { content: src.slice(begin), nextIdx: src.length };
}

function translateSimpleTokens(
  expr: string,
  lang: ReaderLanguage
): string {
  let out = expr
    .replace(/\\,|\\;|\\:|\\!/g, " ")
    .replace(/\\left\s*\(/g, "(")
    .replace(/\\right\s*\)/g, ")")
    .replace(/\\left\s*\[/g, "[")
    .replace(/\\right\s*\]/g, "]")
    .replace(/\\left\s*\|/g, "|")
    .replace(/\\right\s*\|/g, "|")
    .replace(/\^\{\\circ\}|\^\\circ/g, lang === "id" ? " derajat" : " degrees")
    .replace(/\\cdot/g, lang === "id" ? " dot " : " dot ")
    .replace(/\\times/g, lang === "id" ? " dikali " : " times ")
    .replace(/\\div/g, lang === "id" ? " dibagi " : " divided by ")
    .replace(/\\pm/g, lang === "id" ? " plus minus " : " plus or minus ")
    .replace(/\\leq|\\le/g, lang === "id" ? " kurang dari atau sama dengan " : " less than or equal to ")
    .replace(/\\geq|\\ge/g, lang === "id" ? " lebih dari atau sama dengan " : " greater than or equal to ")
    .replace(/\\neq|\\ne/g, lang === "id" ? " tidak sama dengan " : " is not equal to ")
    .replace(/\\approx/g, lang === "id" ? " kira-kira sama dengan " : " is approximately equal to ")
    .replace(/\\to|\\rightarrow/g, lang === "id" ? " menuju " : " approaches ")
    .replace(/\\in/g, lang === "id" ? " anggota " : " in ");

  for (const [macro, labels] of Object.entries(FUNCTION_MAP)) {
    out = out.replaceAll(macro, ` ${labels[lang]} `);
  }
  for (const [macro, labels] of Object.entries(GREEK_MAP)) {
    out = out.replaceAll(macro, ` ${labels[lang]} `);
  }

  // Handle superscripts and subscripts iteratively
  out = out.replace(/\^\{([^}]+)\}|\^([A-Za-z0-9])/g, (_m, braced, single) => {
    const exp = (braced ?? single ?? "").trim();
    if (exp === "2") return lang === "id" ? " kuadrat" : " squared";
    if (exp === "3") return lang === "id" ? " pangkat tiga" : " cubed";
    const translatedExp = translateExpression(exp, lang);
    return lang === "id" ? ` pangkat ${translatedExp}` : ` to the power of ${translatedExp}`;
  });

  out = out.replace(/_\{([^}]+)\}|_([A-Za-z0-9])/g, (_m, braced, single) => {
    const sub = (braced ?? single ?? "").trim();
    const translatedSub = translateExpression(sub, lang);
    return lang === "id" ? ` indeks ${translatedSub}` : ` sub ${translatedSub}`;
  });

  // Handle differentials like dx, dt
  out = out.replace(/\bd([xyztn])\b/g, (_m, v) =>
    lang === "id" ? ` terhadap ${v}` : ` d ${v}`
  );

  // Spoken numbers / operators
  out = out
    .replace(/=/g, lang === "id" ? " sama dengan " : " equals ")
    .replace(/\+/g, lang === "id" ? " tambah " : " plus ")
    .replace(/(^|\s)-(\s|[A-Za-z0-9])/g, (_m, a, b) =>
      lang === "id" ? `${a}kurang ${b}` : `${a}minus ${b}`
    )
    .replace(/[{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (lang === "id") {
    out = out
      .replace(/\b0\b/g, "nol")
      .replace(/\b1\b/g, "satu")
      .replace(/\b2\b/g, "dua");
  }

  return out;
}

function translateExpression(
  rawLatex: string,
  lang: ReaderLanguage,
  nodes?: EquationNode[]
): string {
  const src = rawLatex.trim();
  if (!src) return "";

  let i = 0;
  let buffer = "";
  const parts: string[] = [];

  const flushBuffer = () => {
    if (buffer.trim()) {
      parts.push(translateSimpleTokens(buffer, lang));
      buffer = "";
    }
  };

  while (i < src.length) {
    if (src.startsWith("\\frac", i)) {
      flushBuffer();
      const num = readBracedGroup(src, i + 5);
      const den = readBracedGroup(src, num.nextIdx);
      const numSpoken = translateExpression(num.content, lang);
      const denSpoken = translateExpression(den.content, lang);
      const spoken =
        lang === "id"
          ? `pecahan dengan pembilang ${numSpoken}, dan penyebut ${denSpoken}`
          : `fraction with numerator ${numSpoken}, over denominator ${denSpoken}`;
      parts.push(spoken);
      nodes?.push({
        label: lang === "id" ? "Pecahan" : "Fraction",
        spokenEn: `fraction with numerator ${translateExpression(num.content, "en")}, over denominator ${translateExpression(den.content, "en")}`,
        spokenId: `pecahan dengan pembilang ${translateExpression(num.content, "id")}, dan penyebut ${translateExpression(den.content, "id")}`,
        latex: `\\frac{${num.content}}{${den.content}}`,
        children: [
          {
            label: lang === "id" ? "Pembilang" : "Numerator",
            spokenEn: translateExpression(num.content, "en"),
            spokenId: translateExpression(num.content, "id"),
            latex: num.content,
          },
          {
            label: lang === "id" ? "Penyebut" : "Denominator",
            spokenEn: translateExpression(den.content, "en"),
            spokenId: translateExpression(den.content, "id"),
            latex: den.content,
          },
        ],
      });
      i = den.nextIdx;
      continue;
    }

    if (src.startsWith("\\sqrt", i)) {
      flushBuffer();
      let idx = i + 5;
      while (idx < src.length && src[idx] === " ") idx++;
      let rootDegree = "";
      if (src[idx] === "[") {
        const endBracket = src.indexOf("]", idx);
        if (endBracket !== -1) {
          rootDegree = src.slice(idx + 1, endBracket);
          idx = endBracket + 1;
        }
      }
      const radicand = readBracedGroup(src, idx);
      const inner = translateExpression(radicand.content, lang);
      if (rootDegree) {
        parts.push(
          lang === "id"
            ? `akar pangkat ${translateExpression(rootDegree, lang)} dari ${inner}`
            : `the ${translateExpression(rootDegree, lang)} root of ${inner}`
        );
      } else {
        parts.push(
          lang === "id"
            ? `akar kuadrat dari ${inner}`
            : `square root of ${inner}`
        );
      }
      i = radicand.nextIdx;
      continue;
    }

    if (src.startsWith("\\vec", i)) {
      flushBuffer();
      const target = readBracedGroup(src, i + 4);
      const inner = translateExpression(target.content, lang);
      parts.push(lang === "id" ? `vektor ${inner}` : `vector ${inner}`);
      i = target.nextIdx;
      continue;
    }

    if (src.startsWith("\\hat", i)) {
      flushBuffer();
      const target = readBracedGroup(src, i + 4);
      const inner = translateExpression(target.content, lang);
      parts.push(lang === "id" ? `vektor satuan ${inner}` : `unit vector ${inner}`);
      i = target.nextIdx;
      continue;
    }

    if (src.startsWith("\\|", i) || src.startsWith("\\Vert", i)) {
      flushBuffer();
      const skipLen = src.startsWith("\\Vert", i) ? 5 : 2;
      const endIdx = src.indexOf("\\|", i + skipLen);
      const endVertIdx = src.indexOf("\\Vert", i + skipLen);
      const closingIdx = endIdx !== -1 ? endIdx : endVertIdx;
      if (closingIdx !== -1) {
        const innerContent = src.slice(i + skipLen, closingIdx);
        const inner = translateExpression(innerContent, lang);
        parts.push(lang === "id" ? `panjang ${inner}` : `norm of ${inner}`);
        i = closingIdx + (endIdx !== -1 ? 2 : 5);
        continue;
      }
    }

    if (src.startsWith("\\int", i)) {
      flushBuffer();
      let idx = i + 4;
      let lower = "";
      let upper = "";
      while (idx < src.length && src[idx] === " ") idx++;
      if (src[idx] === "_") {
        const g = readBracedGroup(src, idx + 1);
        lower = g.content;
        idx = g.nextIdx;
        while (idx < src.length && src[idx] === " ") idx++;
      }
      if (src[idx] === "^") {
        const g = readBracedGroup(src, idx + 1);
        upper = g.content;
        idx = g.nextIdx;
      }
      const rest = src.slice(idx).trim();
      const integrandSpoken = translateExpression(rest, lang);
      if (lower || upper) {
        const lo = translateExpression(lower, lang);
        const hi = translateExpression(upper, lang);
        parts.push(
          lang === "id"
            ? `integral dari ${lo} sampai ${hi}, dari ${integrandSpoken}`
            : `the integral from ${lo} to ${hi} of ${integrandSpoken}`
        );
        nodes?.push({
          label: lang === "id" ? "Integral tentu" : "Definite integral",
          spokenEn: `the integral from ${translateExpression(lower, "en")} to ${translateExpression(upper, "en")} of ${translateExpression(rest, "en")}`,
          spokenId: `integral dari ${translateExpression(lower, "id")} sampai ${translateExpression(upper, "id")}, dari ${translateExpression(rest, "id")}`,
          latex: src.slice(i),
          children: [
            {
              label: lang === "id" ? "Batas bawah" : "Lower bound",
              spokenEn: translateExpression(lower, "en"),
              spokenId: translateExpression(lower, "id"),
              latex: lower,
            },
            {
              label: lang === "id" ? "Batas atas" : "Upper bound",
              spokenEn: translateExpression(upper, "en"),
              spokenId: translateExpression(upper, "id"),
              latex: upper,
            },
            {
              label: lang === "id" ? "Integran" : "Integrand",
              spokenEn: translateExpression(rest, "en"),
              spokenId: translateExpression(rest, "id"),
              latex: rest,
            },
          ],
        });
      } else {
        parts.push(
          lang === "id"
            ? `integral tak tentu dari ${integrandSpoken}`
            : `the integral of ${integrandSpoken}`
        );
      }
      i = src.length;
      continue;
    }

    if (src.startsWith("\\sum", i)) {
      flushBuffer();
      let idx = i + 4;
      let lower = "";
      let upper = "";
      while (idx < src.length && src[idx] === " ") idx++;
      if (src[idx] === "_") {
        const g = readBracedGroup(src, idx + 1);
        lower = g.content;
        idx = g.nextIdx;
        while (idx < src.length && src[idx] === " ") idx++;
      }
      if (src[idx] === "^") {
        const g = readBracedGroup(src, idx + 1);
        upper = g.content;
        idx = g.nextIdx;
      }
      const rest = src.slice(idx).trim();
      const body = translateExpression(rest, lang);
      parts.push(
        lang === "id"
          ? `sigma penjumlahan dari ${translateExpression(lower, lang)} sampai ${translateExpression(upper, lang)}, dari ${body}`
          : `summation from ${translateExpression(lower, lang)} to ${translateExpression(upper, lang)} of ${body}`
      );
      i = src.length;
      continue;
    }

    if (src.startsWith("\\lim", i)) {
      flushBuffer();
      let idx = i + 4;
      let sub = "";
      while (idx < src.length && src[idx] === " ") idx++;
      if (src[idx] === "_") {
        const g = readBracedGroup(src, idx + 1);
        sub = g.content;
        idx = g.nextIdx;
      }
      const rest = src.slice(idx).trim();
      parts.push(
        lang === "id"
          ? `limit untuk ${translateExpression(sub, lang)}, dari ${translateExpression(rest, lang)}`
          : `the limit as ${translateExpression(sub, lang)} of ${translateExpression(rest, lang)}`
      );
      i = src.length;
      continue;
    }

    buffer += src[i];
    i++;
  }

  flushBuffer();
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Deterministically translates LaTeX into structured, screen-reader-friendly
 * English and Indonesian speech strings. Flags unsupported matrix/multiline macros
 * explicitly rather than silently omitting or hallucinating content.
 */
export function narrateLatexEquation(latex: string): EquationNarrationResult {
  const cleaned = latex.trim();
  const unsupported = UNSUPPORTED_MACROS.filter((macro) =>
    cleaned.includes(macro)
  );

  // Also detect unknown LaTeX commands outside supported set
  const knownCommands = new Set([
    "\\frac",
    "\\sqrt",
    "\\int",
    "\\sum",
    "\\lim",
    "\\left",
    "\\right",
    "\\cdot",
    "\\times",
    "\\div",
    "\\pm",
    "\\leq",
    "\\le",
    "\\geq",
    "\\ge",
    "\\neq",
    "\\ne",
    "\\approx",
    "\\to",
    "\\rightarrow",
    "\\in",
    "\\vec",
    "\\hat",
    "\\circ",
    "\\Vert",
    "\\operatorname",
    ...Object.keys(GREEK_MAP),
    ...Object.keys(FUNCTION_MAP),
  ]);

  const commandMatches = cleaned.match(/\\[A-Za-z]+/g) ?? [];
  for (const cmd of commandMatches) {
    if (!knownCommands.has(cmd) && !unsupported.includes(cmd)) {
      unsupported.push(cmd);
    }
  }

  const tree: EquationNode[] = [];
  const en = translateExpression(cleaned, "en", tree);
  const id = translateExpression(cleaned, "id");

  const supported = unsupported.length === 0;
  const fallbackNoteEn = supported
    ? en
    : `${en} (Warning: complex LaTeX constructs detected: ${unsupported.join(", ")}. Volunteer verification recommended.)`;
  const fallbackNoteId = supported
    ? id
    : `${id} (Peringatan: ditemukan konstruksi LaTeX kompleks: ${unsupported.join(", ")}. Perlu verifikasi relawan.)`;

  return {
    narrationEn: fallbackNoteEn,
    narrationId: fallbackNoteId,
    supported,
    unsupportedConstructs: unsupported,
    confidencePenalty: supported ? 0 : 0.35,
    explorationTree:
      tree.length > 0
        ? tree
        : [
            {
              label: "Expression",
              spokenEn: en,
              spokenId: id,
              latex: cleaned,
            },
          ],
  };
}
