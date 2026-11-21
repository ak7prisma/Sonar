import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";
import { getVisionModel } from "@/lib/ai/provider";
import type { LayeredFigureDescription } from "@/types/database";

const figureDescriptionSchema = z.object({
  figureType: z.string(),
  summary: z.string(),
  axesAndUnits: z.string().optional(),
  trends: z.string().optional(),
  keyPoints: z.array(z.string()).default([]),
  uncertaintyNotes: z.string().optional(),
});

/**
 * Generates layered, course-grounded descriptions for charts, diagrams, and figures
 * using a multimodal vision model without fabricating unseen values.
 */
export async function describeAcademicFigure(options: {
  imageBase64: string;
  mediaType?: "image/png" | "image/jpeg" | "image/webp";
  courseTitle: string;
  discipline: string;
  sectionHeading?: string;
  language: "en" | "id";
}): Promise<LayeredFigureDescription> {
  const model = getVisionModel();
  const targetLang =
    options.language === "id" ? "Indonesian (Bahasa Indonesia)" : "English";

  const result = await generateText({
    model,
    instructions: [
      `Describe this academic visual in ${targetLang} for a blind university student.`,
      "Provide layered detail: (1) figure type, (2) concise summary, (3) axes/units/labels, (4) main trends/relationships, (5) key data points, (6) explicit uncertainty notes if any numbers or labels are illegible.",
      "Never fabricate exact values that cannot be read clearly.",
    ].join(" "),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Course: ${options.courseTitle} (${options.discipline})${
              options.sectionHeading ? ` | Section: ${options.sectionHeading}` : ""
            }`,
          },
          {
            type: "image",
            image: options.imageBase64,
            mediaType: options.mediaType ?? "image/png",
          },
        ],
      },
    ],
    output: Output.object({
      schema: figureDescriptionSchema,
      name: "LayeredFigureDescription",
    }),
  });

  return result.output;
}
