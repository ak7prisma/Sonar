import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getAuthenticatedContext } from "@/lib/supabase/auth-helpers";
import { isAiConfigured, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { getDefaultOcrProvider, type ExtractedBlockOutput } from "@/features/ocr/ocr-provider";
import { latexToMathMl } from "@/features/math-ocr/latex-to-mathml";
import { narrateLatexEquation } from "@/features/math-ocr/math-narration";

export async function POST(req: Request) {
  try {
    const rate = checkRateLimit({
      key: "ocr-scanner-global",
      limit: 30,
      windowMs: 60_000,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan OCR. Silakan coba kembali dalam 1 menit." },
        { status: 429 }
      );
    }

    let imageBase64 = "";
    let courseId = "cs-201";
    let language: "id" | "en" = "id";
    let documentTitle = "Hasil Pindai Dokumen OCR";

    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("image");
      courseId = String(formData.get("courseId") ?? "cs-201");
      language = (String(formData.get("language") ?? "id") as "id" | "en");
      documentTitle = String(formData.get("title") ?? "Hasil Pindai Dokumen OCR");

      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        imageBase64 = `data:${file.type};base64,${buffer.toString("base64")}`;
      } else {
        const rawBase64 = formData.get("imageBase64");
        if (typeof rawBase64 === "string") {
          imageBase64 = rawBase64;
        }
      }
    } else {
      const json = await req.json();
      imageBase64 = json.imageBase64 ?? "";
      courseId = json.courseId ?? "cs-201";
      language = json.language ?? "id";
      documentTitle = json.title ?? "Hasil Pindai Dokumen OCR";
    }

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Gambar atau foto dokumen diperlukan untuk menjalankan pemindaian OCR." },
        { status: 400 }
      );
    }

    // Call OCR Provider
    const ocrProvider = getDefaultOcrProvider();
    const rawBlocks = await ocrProvider.extractPageBlocks({
      pageNumber: 1,
      pageImageBase64: imageBase64,
      courseContext: `Course: ${courseId}, Document: ${documentTitle}`,
    });

    // Enrich blocks with MathML and Speech Narration
    const enrichedBlocks: ExtractedBlockOutput[] = rawBlocks.map((block) => {
      if (block.blockType === "equation" && block.latex) {
        const mathMlResult = latexToMathMl(block.latex);
        const narration = narrateLatexEquation(block.latex);
        const spoken = language === "en" ? narration.narrationEn : narration.narrationId;
        return {
          ...block,
          mathMl: mathMlResult.mathml ?? undefined,
          spokenText: spoken,
        };
      }
      return block;
    });

    // Calculate confidence and stats
    const totalConfidence = enrichedBlocks.reduce((acc, b) => acc + (b.confidence || 0.95), 0);
    const overallConfidence = enrichedBlocks.length > 0 ? totalConfidence / enrichedBlocks.length : 0.98;

    const stats = {
      totalBlocks: enrichedBlocks.length,
      headingsCount: enrichedBlocks.filter((b) => b.blockType === "heading").length,
      paragraphsCount: enrichedBlocks.filter((b) => b.blockType === "paragraph").length,
      equationsCount: enrichedBlocks.filter((b) => b.blockType === "equation").length,
      tablesCount: enrichedBlocks.filter((b) => b.blockType === "table").length,
      figuresCount: enrichedBlocks.filter((b) => b.blockType === "figure").length,
    };

    let savedDocumentId: string | null = null;

    // Persist as a readable document in Supabase if user is signed in
    if (isSupabaseConfigured()) {
      const { supabase, auth } = await getAuthenticatedContext();
      if (supabase && auth) {
        const dbClient = isSupabaseAdminConfigured()
          ? (createAdminSupabaseClient() ?? supabase)
          : supabase;

        const docId = `doc-ocr-${nanoid(8)}`;
        const storagePath = `scans/${courseId}/${docId}.png`;

        const { data: createdDoc } = await dbClient
          .from("documents")
          .insert({
            course_id: courseId,
            uploaded_by: auth.userId,
            title: documentTitle,
            original_filename: `Scan_${new Date().toISOString().slice(0, 10)}.png`,
            storage_path: storagePath,
            file_hash: nanoid(32),
            file_size_bytes: Math.round(imageBase64.length * 0.75),
            language,
            processing_status: "completed",
            review_status: "verified",
            overall_confidence: overallConfidence,
          })
          .select("id")
          .maybeSingle();

        if (createdDoc) {
          savedDocumentId = createdDoc.id;

          const { data: createdVersion } = await dbClient
            .from("document_versions")
            .insert({
              document_id: createdDoc.id,
              version_number: 1,
              source_storage_path: storagePath,
              change_summary: "AI OCR Initial Extraction",
              created_by: auth.userId,
            })
            .select("id")
            .maybeSingle();

          if (createdVersion) {
            await dbClient
              .from("documents")
              .update({ current_version_id: createdVersion.id })
              .eq("id", createdDoc.id);

            // Insert document blocks
            const blockRows = enrichedBlocks.map((b, idx) => ({
              document_id: createdDoc.id,
              version_id: createdVersion.id,
              page_number: 1,
              reading_order: idx + 1,
              block_type: b.blockType,
              content_text: b.contentText,
              spoken_text: b.spokenText ?? b.contentText,
              heading_level: b.headingLevel ?? null,
              confidence_score: b.confidence ?? 0.95,
              needs_review: false,
              metadata: {
                latex: b.latex,
                mathMl: b.mathMl,
                tableHeaders: b.tableHeaders,
                tableRows: b.tableRows,
                figureSummary: b.figureSummary,
              },
            }));

            await dbClient.from("document_blocks").insert(blockRows);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      documentId: savedDocumentId ?? "doc-cs-01",
      documentTitle,
      courseId,
      language,
      confidence: Math.round(overallConfidence * 100),
      isAiLive: isAiConfigured(),
      blocks: enrichedBlocks,
      stats,
    });
  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : "Terjadi kesalahan saat memproses OCR dokumen.";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
