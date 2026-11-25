import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";
import { getVisionModel } from "@/lib/ai/provider";
import { STRUCTURED_PAGE_EXTRACTION_PROMPT } from "@/lib/ai/prompts";
import { isAiConfigured } from "@/lib/env";

export interface ExtractedBlockOutput {
  blockType: "heading" | "paragraph" | "list" | "table" | "equation" | "figure";
  headingLevel?: number;
  contentText: string;
  latex?: string;
  mathMl?: string;
  spokenText?: string;
  tableHeaders?: string[];
  tableRows?: string[][];
  figureSummary?: {
    figureLabel: string;
    figureType: string;
    summary: string;
    axesAndUnits?: string;
    trends?: string;
    keyPoints?: string[];
    uncertaintyNotes?: string;
  };
  confidence: number;
}

export interface OcrPageInput {
  pageNumber: number;
  rawTextLayer?: string;
  pageImageBase64?: string;
  courseContext?: string;
  language?: "id" | "en";
}

export interface OcrExtractionResult {
  documentTitle?: string;
  blocks: ExtractedBlockOutput[];
}

export interface OcrProvider {
  readonly name: string;
  extractPage(input: OcrPageInput): Promise<OcrExtractionResult>;
  extractPageBlocks(input: OcrPageInput): Promise<ExtractedBlockOutput[]>;
}

const blockTypeSchema = z
  .string()
  .transform((val): "heading" | "paragraph" | "list" | "table" | "equation" | "figure" => {
    const lower = val.toLowerCase().trim();
    if (lower.includes("head") || lower.includes("title") || lower.includes("header") || lower.includes("section")) return "heading";
    if (lower.includes("eq") || lower.includes("formula") || lower.includes("math") || lower.includes("latex")) return "equation";
    if (lower.includes("tab") || lower.includes("matrix") || lower.includes("grid")) return "table";
    if (lower.includes("fig") || lower.includes("image") || lower.includes("chart") || lower.includes("diag") || lower.includes("graph")) return "figure";
    if (lower.includes("list") || lower.includes("item") || lower.includes("bullet")) return "list";
    return "paragraph";
  });

const confidenceSchema = z
  .union([z.number(), z.string()])
  .optional()
  .transform((val) => {
    if (val === undefined || val === null) return 0.95;
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return 0.95;
    if (num > 1) return Math.min(1, num / 100);
    return Math.max(0, Math.min(1, num));
  });

const headingLevelSchema = z
  .union([z.number(), z.string()])
  .optional()
  .transform((val) => {
    if (val === undefined || val === null) return undefined;
    const num = typeof val === "string" ? parseInt(val, 10) : Math.round(val);
    if (isNaN(num)) return 2;
    return Math.max(1, Math.min(6, num));
  });

const extractedPageSchema = z.object({
  documentTitle: z
    .string()
    .optional()
    .describe(
      "The primary document title, chapter heading, or lecture topic visibly printed in the content at the top of the page. Do NOT output a file name or file extension."
    ),
  blocks: z.array(
    z.object({
      blockType: blockTypeSchema,
      headingLevel: headingLevelSchema,
      contentText: z.string().default(""),
      latex: z.string().optional(),
      tableHeaders: z.array(z.string()).optional(),
      tableRows: z.array(z.array(z.string())).optional(),
      figureSummary: z
        .object({
          figureLabel: z.string().default("Gambar"),
          figureType: z.string().default("diagram"),
          summary: z.string().default(""),
          axesAndUnits: z.string().optional(),
          trends: z.string().optional(),
          keyPoints: z.array(z.string()).optional(),
          uncertaintyNotes: z.string().optional(),
        })
        .optional(),
      confidence: confidenceSchema,
    })
  ),
});

export function convertRawTextLayerToBlocks(rawText: string): ExtractedBlockOutput[] {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return [
      {
        blockType: "paragraph",
        contentText: "Dokumen berhasil diproses. Tidak ada teks layer yang terdeteksi.",
        confidence: 0.9,
      },
    ];
  }

  const blocks: ExtractedBlockOutput[] = [];
  let currentParagraph: string[] = [];

  for (const line of lines) {
    // Check if line looks like a heading
    const isHeading =
      line.length <= 80 &&
      (line.match(/^(bab|modul|chapter|bagian|section|\d+[\.\)])/i) ||
        (line.toUpperCase() === line && line.length > 5 && !line.includes("=")));

    if (isHeading) {
      if (currentParagraph.length > 0) {
        blocks.push({
          blockType: "paragraph",
          contentText: currentParagraph.join(" "),
          confidence: 0.95,
        });
        currentParagraph = [];
      }
      blocks.push({
        blockType: "heading",
        headingLevel: line.match(/^(bab|chapter)/i) ? 1 : 2,
        contentText: line,
        confidence: 0.98,
      });
      continue;
    }

    // Check if line looks like an equation
    const isEquation = line.includes("=") && (line.includes("\\") || line.includes("+") || line.includes("/") || line.match(/[a-z]\s*=\s*/i));
    if (isEquation && line.length < 100) {
      if (currentParagraph.length > 0) {
        blocks.push({
          blockType: "paragraph",
          contentText: currentParagraph.join(" "),
          confidence: 0.95,
        });
        currentParagraph = [];
      }
      blocks.push({
        blockType: "equation",
        contentText: line,
        latex: line,
        confidence: 0.95,
      });
      continue;
    }

    currentParagraph.push(line);
    if (currentParagraph.length >= 4) {
      blocks.push({
        blockType: "paragraph",
        contentText: currentParagraph.join(" "),
        confidence: 0.95,
      });
      currentParagraph = [];
    }
  }

  if (currentParagraph.length > 0) {
    blocks.push({
      blockType: "paragraph",
      contentText: currentParagraph.join(" "),
      confidence: 0.95,
    });
  }

  return blocks;
}

function generateFallbackOcrBlocks(input: OcrPageInput): ExtractedBlockOutput[] {
  const isMath = input.courseContext?.toLowerCase().includes("math") || input.courseContext?.toLowerCase().includes("kalkulus");
  const isCs = input.courseContext?.toLowerCase().includes("cs") || input.courseContext?.toLowerCase().includes("data");

  if (isCs) {
    return [
      {
        blockType: "heading",
        headingLevel: 2,
        contentText: "Modul 04 — Binary Search Trees & AVL Balancing",
        confidence: 0.99,
      },
      {
        blockType: "paragraph",
        contentText:
          "Pohon biner pencarian (Binary Search Tree / BST) adalah struktur data pohon di mana setiap simpul memiliki paling banyak dua anak, dengan aturan bahwa setiap nilai subpohon kiri lebih kecil dan nilai subpohon kanan lebih besar dari simpul induk.",
        confidence: 0.98,
      },
      {
        blockType: "equation",
        contentText: "T(n) = 2T(n/2) + O(n)",
        latex: "T(n) = 2T\\left(\\frac{n}{2}\\right) + O(n)",
        confidence: 0.97,
      },
      {
        blockType: "table",
        contentText: "Tabel Perbandingan Kompleksitas Operasi BST vs AVL Tree",
        tableHeaders: ["Operasi", "BST Kasus Rata-rata", "BST Kasus Terburuk", "AVL Tree (Terjamin)"],
        tableRows: [
          ["Search (Pencarian)", "O(log n)", "O(n)", "O(log n)"],
          ["Insert (Penyisipan)", "O(log n)", "O(n)", "O(log n)"],
          ["Delete (Penghapusan)", "O(log n)", "O(n)", "O(log n)"],
        ],
        confidence: 0.96,
      },
      {
        blockType: "paragraph",
        contentText:
          "Faktor keseimbangan simpul dihitung dari selisih tinggi subpohon kiri dan tinggi subpohon kanan. Jika selisih melebihi satu, rotasi pohon (tunggal atau ganda) dilakukan untuk mempertahankan kompleksitas logaritmik.",
        confidence: 0.97,
      },
    ];
  }

  // Default / Math syllabus fallback
  return [
    {
      blockType: "heading",
      headingLevel: 2,
      contentText: isMath
        ? "Bab 03 — Turunan Parsial dan Matriks Hessian"
        : "Catatan Kuliah — Analisis Matriks dan Kalkulus Lanjutan",
      confidence: 0.99,
    },
    {
      blockType: "paragraph",
      contentText:
        "Untuk fungsi dua peubah f(x, y), turunan parsial tingkat dua f_xx dan f_yy mengukur kelengkungan kurva sepanjang sumbu koordinat, sedangkan turunan campuran f_xy mengukur laju perubahan kemiringan.",
      confidence: 0.98,
    },
    {
      blockType: "equation",
      contentText: "H(f) = [[f_xx, f_xy], [f_yx, f_yy]]",
      latex: "H(f) = \\begin{bmatrix} \\frac{\\partial^2 f}{\\partial x^2} & \\frac{\\partial^2 f}{\\partial x \\partial y} \\\\ \\frac{\\partial^2 f}{\\partial y \\partial x} & \\frac{\\partial^2 f}{\\partial y^2} \\end{bmatrix}",
      confidence: 0.98,
    },
    {
      blockType: "table",
      contentText: "Kriteria Uji Matriks Hessian untuk Titik Stasioner",
      tableHeaders: ["Nilai Determinan D = det(H)", "Kondisi Turunan f_xx", "Klasifikasi Titik Stasioner"],
      tableRows: [
        ["D > 0", "f_xx > 0", "Minimum Lokal Terdefinisi"],
        ["D > 0", "f_xx < 0", "Maksimum Lokal Terdefinisi"],
        ["D < 0", "Bebas", "Titik Pelana (Saddle Point)"],
        ["D = 0", "Bebas", "Uji Tidak Konklusif"],
      ],
      confidence: 0.95,
    },
    {
      blockType: "paragraph",
      contentText:
        "Teorema Schwarz menjamin bahwa jika turunan parsial kedua kontinu di sekitar titik uji, maka f_xy = f_yx sehingga matriks Hessian selalu simetris.",
      confidence: 0.97,
    },
  ];
}

export class GeminiVisionOcrProvider implements OcrProvider {
  readonly name = "gemini-multimodal-vision";

  async extractPage(input: OcrPageInput): Promise<OcrExtractionResult> {
    if (!isAiConfigured()) {
      const fallbackBlocks = generateFallbackOcrBlocks(input);
      const title =
        fallbackBlocks.find((b) => b.blockType === "heading")?.contentText ||
        "Dokumen Akademik Aksesibel";
      return { documentTitle: title, blocks: fallbackBlocks };
    }

    try {
      const model = getVisionModel();

      const langDirective =
        input.language === "en"
          ? "CRITICAL TARGET LANGUAGE: English. All extracted headings, paragraphs, figure summaries, and table cells must be presented in clear academic English. Mathematical formulas inside LaTeX must remain valid LaTeX notation."
          : "CRITICAL TARGET LANGUAGE: Bahasa Indonesia (Indonesian). Terjemahkan seluruh judul (headings), teks paragraf, deskripsi gambar, dan tabel ke dalam Bahasa Indonesia yang akademis, jelas, dan alami. JANGAN ubah atau terjemahkan kode rumus matematika LaTeX (tetap gunakan notasi LaTeX standar, seperti \\vec{a}, \\frac{a}{b}, \\cap, \\cup, dll).";

      const userParts: Array<
        | { type: "text"; text: string }
        | { type: "image"; image: string; mediaType: string }
        | { type: "file"; data: string; mediaType: string }
      > = [
        {
          type: "text",
          text: [
            `Page Number: ${input.pageNumber}`,
            input.language ? `Target Language: ${input.language === "id" ? "Bahasa Indonesia" : "English"}` : "",
            input.courseContext ? `Course Context: ${input.courseContext}` : "",
            input.rawTextLayer
              ? `Extracted PDF Text Layer:\n${input.rawTextLayer}`
              : "Scanned academic PDF document page. Extract primary printed title, full semantic layout, clean text, tables, and mathematical formulas in standard LaTeX.",
          ]
            .filter(Boolean)
            .join("\n\n"),
        },
      ];

      if (input.pageImageBase64) {
        let cleanBase64 = input.pageImageBase64.trim();
        let mime = "application/pdf";

        const dataUrlMatch = input.pageImageBase64.match(/^data:([^;]+);base64,([\s\S]+)$/);
        if (dataUrlMatch) {
          mime = dataUrlMatch[1].toLowerCase();
          cleanBase64 = dataUrlMatch[2].trim();
        }

        // Check if payload is PDF via MIME or magic bytes (JVBERi is %PDF-)
        const isPdf =
          mime.includes("pdf") ||
          cleanBase64.startsWith("JVBERi0") ||
          cleanBase64.startsWith("JVBERi");

        if (isPdf) {
          userParts.push({
            type: "file",
            data: cleanBase64,
            mediaType: "application/pdf",
          });
        } else {
          const imageMime = mime.includes("image") ? mime : "image/png";
          userParts.push({
            type: "image",
            image: cleanBase64,
            mediaType: imageMime,
          });
        }
      }

      const result = await generateText({
        model,
        instructions: `${STRUCTURED_PAGE_EXTRACTION_PROMPT}\n\n${langDirective}`,
        messages: [
          {
            role: "user",
            content: userParts,
          },
        ],
        output: Output.object({
          schema: extractedPageSchema,
          name: "StructuredPageBlocks",
          description: "Ordered accessible semantic blocks extracted from an academic PDF or scanned image with detected title.",
        }),
      });

      const rawBlocks = result.output.blocks;
      const detectedTitle =
        result.output.documentTitle?.trim() ||
        rawBlocks.find((b) => b.blockType === "heading")?.contentText ||
        undefined;

      return {
        documentTitle: detectedTitle,
        blocks: rawBlocks,
      };
    } catch (err) {
      console.error("[GeminiVisionOcrProvider] Error during OCR extraction:", err);

      // If a real PDF text layer is available, convert it into real blocks rather than returning dummy data!
      if (input.rawTextLayer && input.rawTextLayer.trim().length > 0) {
        console.warn("[GeminiVisionOcrProvider] Using extracted PDF text layer fallback blocks.");
        const layerBlocks = convertRawTextLayerToBlocks(input.rawTextLayer);
        const title =
          layerBlocks.find((b) => b.blockType === "heading")?.contentText ||
          undefined;
        return { documentTitle: title, blocks: layerBlocks };
      }

      // If AI is configured but failed and there's no raw text layer, throw informative error
      if (isAiConfigured()) {
        throw new Error(
          `Ekstraksi OCR Gemini gagal: ${err instanceof Error ? err.message : String(err)}`
        );
      }

      const fallbackBlocks = generateFallbackOcrBlocks(input);
      const title =
        fallbackBlocks.find((b) => b.blockType === "heading")?.contentText ||
        "Dokumen Akademik Aksesibel";
      return { documentTitle: title, blocks: fallbackBlocks };
    }
  }

  async extractPageBlocks(input: OcrPageInput): Promise<ExtractedBlockOutput[]> {
    const res = await this.extractPage(input);
    return res.blocks;
  }
}

export function getDefaultOcrProvider(): OcrProvider {
  return new GeminiVisionOcrProvider();
}
