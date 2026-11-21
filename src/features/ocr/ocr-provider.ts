import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";
import { getVisionModel } from "@/lib/ai/provider";
import { STRUCTURED_PAGE_EXTRACTION_PROMPT } from "@/lib/ai/prompts";

export interface ExtractedBlockOutput {
  blockType: "heading" | "paragraph" | "list" | "table" | "equation" | "figure";
  headingLevel?: number;
  contentText: string;
  latex?: string;
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
  rawTextLayer: string;
  pageImageBase64?: string;
  courseContext?: string;
}

export interface OcrProvider {
  readonly name: string;
  extractPageBlocks(input: OcrPageInput): Promise<ExtractedBlockOutput[]>;
}

const extractedPageSchema = z.object({
  blocks: z.array(
    z.object({
      blockType: z.enum([
        "heading",
        "paragraph",
        "list",
        "table",
        "equation",
        "figure",
      ]),
      headingLevel: z.number().int().min(1).max(6).optional(),
      contentText: z.string(),
      latex: z.string().optional(),
      tableHeaders: z.array(z.string()).optional(),
      tableRows: z.array(z.array(z.string())).optional(),
      figureSummary: z
        .object({
          figureLabel: z.string(),
          figureType: z.string(),
          summary: z.string(),
          axesAndUnits: z.string().optional(),
          trends: z.string().optional(),
          keyPoints: z.array(z.string()).optional(),
          uncertaintyNotes: z.string().optional(),
        })
        .optional(),
      confidence: z.number().min(0).max(1),
    })
  ),
});

export class GeminiVisionOcrProvider implements OcrProvider {
  readonly name = "gemini-multimodal-vision";

  async extractPageBlocks(input: OcrPageInput): Promise<ExtractedBlockOutput[]> {
    const model = getVisionModel();

    const userParts: Array<
      | { type: "text"; text: string }
      | { type: "image"; image: string; mediaType: string }
    > = [
      {
        type: "text",
        text: [
          `Page Number: ${input.pageNumber}`,
          input.courseContext ? `Course Context: ${input.courseContext}` : "",
          input.rawTextLayer
            ? `Extracted PDF Text Layer:\n${input.rawTextLayer}`
            : "No native PDF text layer detected (likely scanned page).",
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
    ];

    if (input.pageImageBase64) {
      userParts.push({
        type: "image",
        image: input.pageImageBase64,
        mediaType: "image/png",
      });
    }

    const result = await generateText({
      model,
      instructions: STRUCTURED_PAGE_EXTRACTION_PROMPT,
      messages: [
        {
          role: "user",
          content: userParts,
        },
      ],
      output: Output.object({
        schema: extractedPageSchema,
        name: "StructuredPageBlocks",
        description: "Ordered accessible semantic blocks extracted from an academic PDF page.",
      }),
    });

    return result.output.blocks;
  }
}

export function getDefaultOcrProvider(): OcrProvider {
  return new GeminiVisionOcrProvider();
}
