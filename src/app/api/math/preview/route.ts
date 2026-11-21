import { NextResponse } from "next/server";
import { z } from "zod";
import { latexToMathMl } from "@/features/math-ocr/latex-to-mathml";
import { narrateLatexEquation } from "@/features/math-ocr/math-narration";

const previewSchema = z.object({
  latex: z.string().trim().min(1).max(4000),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = previewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Provide a valid LaTeX expression." },
      { status: 400 }
    );
  }

  const mml = latexToMathMl(parsed.data.latex);
  const narration = narrateLatexEquation(parsed.data.latex);

  return NextResponse.json({
    mathml: mml.mathml,
    valid: mml.valid,
    error: mml.error ?? null,
    narrationEn: narration.narrationEn,
    narrationId: narration.narrationId,
    supported: narration.supported,
  });
}
