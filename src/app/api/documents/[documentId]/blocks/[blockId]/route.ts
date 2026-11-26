import { NextResponse } from "next/server";
import { getAuthenticatedContext, hasAnyRole } from "@/lib/supabase/auth-helpers";
import { isSupabaseConfigured } from "@/lib/env";
import { blockUpdateSchema } from "@/lib/validation/schemas";
import { latexToMathMl } from "@/features/math-ocr/latex-to-mathml";
import { narrateLatexEquation } from "@/features/math-ocr/math-narration";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ documentId: string; blockId: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase credentials are not configured yet." },
      { status: 503 }
    );
  }

  const { supabase, auth } = await getAuthenticatedContext();
  if (!supabase || !auth) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (!hasAnyRole(auth.roles, ["volunteer", "admin"])) {
    return NextResponse.json(
      { error: "Volunteer or administrator role is required." },
      { status: 403 }
    );
  }

  const { documentId, blockId } = await context.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = blockUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data: existingBlock, error: findErr } = await supabase
    .from("document_blocks")
    .select("*")
    .eq("id", blockId)
    .eq("document_id", documentId)
    .maybeSingle();

  if (findErr || !existingBlock) {
    return NextResponse.json(
      { error: "Block not found or access denied." },
      { status: 404 }
    );
  }

  let nextHtml = existingBlock.content_html;
  let nextSpoken = parsed.data.spokenText ?? parsed.data.contentText;

  if (existingBlock.block_type === "equation" && parsed.data.latex) {
    const mml = latexToMathMl(parsed.data.latex);
    const narration = narrateLatexEquation(parsed.data.latex);
    nextHtml = mml.mathml;
    nextSpoken = parsed.data.spokenText ?? narration.narrationEn;

    await supabase
      .from("document_equations")
      .update({
        latex: parsed.data.latex,
        mathml: mml.mathml,
        narration_en: narration.narrationEn,
        narration_id: narration.narrationId,
        is_supported: mml.valid && narration.supported,
      })
      .eq("block_id", blockId);
  }

  const { data: updated, error: updateErr } = await supabase
    .from("document_blocks")
    .update({
      content_text: parsed.data.contentText,
      content_html: nextHtml,
      spoken_text: nextSpoken,
      is_verified: parsed.data.markVerified,
      needs_review: !parsed.data.markVerified,
      confidence_score: parsed.data.markVerified ? 1 : existingBlock.confidence_score,
    })
    .eq("id", blockId)
    .select("*")
    .single();

  if (updateErr || !updated) {
    return NextResponse.json(
      { error: updateErr?.message ?? "Unable to update document block." },
      { status: 500 }
    );
  }

  await supabase.from("audit_logs").insert({
    actor_id: auth.userId,
    action: "document_block.reviewed",
    entity_type: "document_block",
    entity_id: blockId,
    metadata: {
      documentId,
      markVerified: parsed.data.markVerified,
      reviewNote: parsed.data.reviewNote ?? null,
    },
  });

  return NextResponse.json({ block: updated });
}
