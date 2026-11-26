import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getAuthenticatedContext } from "@/lib/supabase/auth-helpers";
import { isAiConfigured, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { getDefaultOcrProvider, type ExtractedBlockOutput } from "@/features/ocr/ocr-provider";
import { extractPdfTextPages } from "@/features/pdf-processing/text-extractor";
import { latexToMathMl } from "@/features/math-ocr/latex-to-mathml";
import { narrateLatexEquation, narrateMixedText } from "@/features/math-ocr/math-narration";
import { normalizeMarkdownText } from "@/lib/math/math-markdown-parser";
import {
  FALLBACK_COURSES,
  registerScannedDocument,
  type DocumentBlockRow,
  type DocumentRow,
} from "@/lib/data/workspace";

export const maxDuration = 60;

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
        const lowerName = file.name.toLowerCase();
        if (!lowerName.endsWith(".pdf") && file.type !== "application/pdf" && file.type !== "application/x-pdf") {
          return NextResponse.json(
            { error: "Hanya berkas dokumen berformat PDF (.pdf) yang diperbolehkan untuk pemindaian OCR." },
            { status: 400 }
          );
        }
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        imageBase64 = `data:application/pdf;base64,${buffer.toString("base64")}`;
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
        { error: "Berkas dokumen PDF diperlukan untuk menjalankan pemindaian OCR." },
        { status: 400 }
      );
    }

    // Pastikan berkas adalah PDF atau sampel demonstrasi
    const isPdfPayload =
      imageBase64.startsWith("data:application/pdf") ||
      imageBase64.startsWith("data:application/x-pdf") ||
      imageBase64.startsWith("data:application/octet-stream") ||
      imageBase64.startsWith("data:image/") ||
      imageBase64.includes("JVBERi");

    if (!isPdfPayload) {
      return NextResponse.json(
        { error: "Format tidak didukung. Fitur OCR hanya menerima berkas dokumen berformat PDF (.pdf)." },
        { status: 400 }
      );
    }

    // Try extracting real text layer from PDF if available
    let rawTextLayer: string | undefined = undefined;
    let cleanBase64 = imageBase64;
    const match = imageBase64.match(/^data:([^;]+);base64,([\s\S]+)$/);
    if (match) {
      cleanBase64 = match[2].trim();
    }

    try {
      if (cleanBase64.startsWith("JVBERi") || imageBase64.includes("pdf")) {
        const buffer = Buffer.from(cleanBase64, "base64");
        const pages = await extractPdfTextPages(new Uint8Array(buffer));
        const combined = pages
          .map((p) => (p.rawText ? `[Halaman ${p.pageNumber}]\n${p.rawText}` : ""))
          .filter(Boolean)
          .join("\n\n");
        if (combined.trim().length > 0) {
          rawTextLayer = combined;
        }
      }
    } catch (pdfErr) {
      console.warn("[OCR Scan Route] PDF text layer extraction skipped:", pdfErr);
    }

    // Call OCR Provider
    const ocrProvider = getDefaultOcrProvider();
    const ocrResult = await ocrProvider.extractPage({
      pageNumber: 1,
      pageImageBase64: imageBase64,
      rawTextLayer,
      courseContext: `Course: ${courseId}, Document: ${documentTitle}`,
      language,
    });

    const rawBlocks = ocrResult.blocks;

    // Detect actual document title from PDF content:
    // 1. Direct page title extracted from PDF by vision model
    // 2. Or first prominent heading block in the document content
    // 3. Or first line of text layer if structured like a heading
    let detectedPdfTitle = ocrResult.documentTitle?.trim() || "";

    if (!detectedPdfTitle || detectedPdfTitle.toLowerCase().endsWith(".pdf")) {
      const firstHeading = rawBlocks.find(
        (b) => b.blockType === "heading" && b.contentText.trim().length > 0
      )?.contentText?.trim();
      if (firstHeading) {
        detectedPdfTitle = firstHeading.replace(/^#+\s*/, "").trim();
      }
    }

    // Determine resolvedDocumentTitle:
    // If user explicitly typed a custom title (that is not empty, default, or raw filename with .pdf), respect it.
    // Otherwise, use the real title extracted from inside the PDF content!
    const rawPassedTitle = documentTitle.trim();
    const isGenericOrFilename =
      !rawPassedTitle ||
      rawPassedTitle === "Hasil Pindai Dokumen OCR" ||
      rawPassedTitle.toLowerCase().endsWith(".pdf");

    const resolvedDocumentTitle =
      (!isGenericOrFilename && rawPassedTitle.length > 0)
        ? rawPassedTitle
        : (detectedPdfTitle || rawPassedTitle.replace(/\.pdf$/i, "") || "Hasil Pindai Dokumen OCR");

    // Enrich blocks with MathML and Speech Narration
    const enrichedBlocks: ExtractedBlockOutput[] = rawBlocks.map((block) => {
      const normalizedText = normalizeMarkdownText(block.contentText);
      const targetLatex =
        block.latex?.trim() ||
        (block.blockType === "equation"
          ? normalizedText.replace(/^[•\-\*]\s*/, "").replace(/^\$+|\$+$/g, "").trim()
          : undefined);

      if (block.blockType === "equation" && targetLatex) {
        const mathMlResult = latexToMathMl(targetLatex);
        const narration = narrateLatexEquation(targetLatex);
        const spoken = language === "en" ? narration.narrationEn : narration.narrationId;
        return {
          ...block,
          contentText: normalizedText,
          latex: targetLatex,
          mathMl: mathMlResult.mathml ?? undefined,
          spokenText: spoken,
        };
      }
      return {
        ...block,
        contentText: normalizedText,
        spokenText: narrateMixedText(normalizedText, language),
      };
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

    // Generate dedicated document ID for this OCR scan
    const docId = `doc-ocr-${nanoid(10)}`;
    const now = new Date().toISOString();

    const course =
      FALLBACK_COURSES.find((c) => c.id.toLowerCase() === courseId.toLowerCase()) ??
      FALLBACK_COURSES[0];

    const documentRecord: DocumentRow = {
      id: docId,
      course_id: course.id,
      uploaded_by: "usr-student-001",
      title: resolvedDocumentTitle,
      original_filename: `${(documentTitle || resolvedDocumentTitle).replace(/[^\w\s-]/g, "") || "Document"}.pdf`,
      storage_path: `scans/${courseId}/${docId}.pdf`,
      file_hash: nanoid(32),
      file_size_bytes: Math.round(cleanBase64.length * 0.75),
      page_count: 1,
      current_version_id: `ver-${docId}`,
      processing_status: "completed",
      review_status: "verified",
      overall_confidence: overallConfidence,
      language,
      created_at: now,
      updated_at: now,
    };

    const docBlocks: DocumentBlockRow[] = enrichedBlocks.map((b, idx) => ({
      id: `blk-${docId}-${idx + 1}`,
      document_id: docId,
      version_id: `ver-${docId}`,
      section_id: null,
      page_number: 1,
      reading_order: idx + 1,
      block_type: b.blockType,
      heading_level: b.headingLevel ?? null,
      content_text: b.contentText,
      content_html: `<p>${b.contentText}</p>`,
      spoken_text: b.spokenText ?? b.contentText,
      ai_generated: true,
      confidence_score: b.confidence ?? 0.95,
      needs_review: false,
      is_verified: true,
      metadata: {
        latex: b.latex,
        mathMl: b.mathMl,
        tableHeaders: b.tableHeaders,
        tableRows: b.tableRows,
        figureSummary: b.figureSummary,
      },
      created_at: now,
      updated_at: now,
    }));

    // Register into memory store so AccessibleReaderStudio can open it immediately
    registerScannedDocument({
      document: documentRecord,
      course,
      blocks: docBlocks,
      tables: [],
      equations: [],
      figures: [],
      signedPdfUrl: imageBase64.startsWith("data:application/pdf") ? imageBase64 : null,
    });

    let savedDocumentId: string | null = null;

    // Persist as a readable document in Supabase if database is available
    if (isSupabaseConfigured()) {
      try {
        const { supabase, auth } = await getAuthenticatedContext();
        const dbClient = isSupabaseAdminConfigured()
          ? (createAdminSupabaseClient() ?? supabase)
          : supabase;

        if (dbClient) {
          const isCourseUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseId);
          let targetCourseId: string | undefined = isCourseUuid ? courseId : undefined;

          if (!targetCourseId) {
            const { data: dbCourse } = await dbClient.from("courses").select("id").limit(1).maybeSingle();
            if (dbCourse?.id) {
              targetCourseId = dbCourse.id;
            }
          }

          let uploaderId = auth?.userId;
          if (!uploaderId) {
            const { data: dbProfile } = await dbClient.from("profiles").select("id").limit(1).maybeSingle();
            if (dbProfile?.id) {
              uploaderId = dbProfile.id;
            }
          }

          if (targetCourseId && uploaderId) {
            const { data: createdDoc } = await dbClient
              .from("documents")
              .insert({
                course_id: targetCourseId,
                uploaded_by: uploaderId,
                title: resolvedDocumentTitle,
                original_filename: `${(documentTitle || resolvedDocumentTitle).replace(/[^\w\s-]/g, "") || "Document"}.pdf`,
                storage_path: `scans/${targetCourseId}/${docId}.pdf`,
                file_hash: nanoid(32),
                file_size_bytes: Math.round(cleanBase64.length * 0.75),
                language,
                processing_status: "completed",
                review_status: "verified",
                overall_confidence: overallConfidence,
              })
              .select("id")
              .maybeSingle();

            if (createdDoc?.id) {
              savedDocumentId = createdDoc.id;

              const { data: createdVersion } = await dbClient
                .from("document_versions")
                .insert({
                  document_id: createdDoc.id,
                  version_number: 1,
                  source_storage_path: `scans/${targetCourseId}/${docId}.pdf`,
                  change_summary: "AI OCR Real Extraction",
                  created_by: uploaderId,
                })
                .select("id")
                .maybeSingle();

              if (createdVersion) {
                await dbClient
                  .from("documents")
                  .update({ current_version_id: createdVersion.id })
                  .eq("id", createdDoc.id);

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
      } catch (dbErr) {
        console.warn("[OCR Scan Route] Supabase persistence skipped:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      documentId: savedDocumentId ?? docId,
      documentTitle: resolvedDocumentTitle,
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
