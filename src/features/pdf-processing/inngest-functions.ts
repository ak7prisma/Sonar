import "server-only";

import { inngest, type DocumentUploadedEventData } from "@/features/pdf-processing/inngest-client";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { extractPdfTextPages } from "@/features/pdf-processing/text-extractor";
import { getDefaultOcrProvider } from "@/features/ocr/ocr-provider";
import { latexToMathMl } from "@/features/math-ocr/latex-to-mathml";
import { narrateLatexEquation } from "@/features/math-ocr/math-narration";
import { buildSemanticChunks } from "@/lib/rag/chunker";
import { generateDocumentEmbeddings } from "@/lib/rag/embeddings";
import { isAiConfigured, isSupabaseAdminConfigured } from "@/lib/env";
import type { Database, JobStage, ProcessingStatus } from "@/types/database";

async function updateJobProgress(
  jobId: string,
  documentId: string,
  status: ProcessingStatus,
  stage: JobStage,
  progressPercent: number,
  logMessage: string
) {
  const admin = createAdminSupabaseClient();
  if (!admin) return;

  const { data: current } = await admin
    .from("processing_jobs")
    .select("logs")
    .eq("id", jobId)
    .maybeSingle();

  const existingLogs = Array.isArray(current?.logs) ? current.logs : [];
  const nextLogs = [
    ...existingLogs,
    { timestamp: new Date().toISOString(), stage, status, message: logMessage },
  ];

  await Promise.all([
    admin
      .from("processing_jobs")
      .update({
        status,
        current_stage: stage,
        progress_percent: progressPercent,
        logs: nextLogs,
        ...(status === "extracting" ? { started_at: new Date().toISOString() } : {}),
        ...(status === "completed" || status === "failed"
          ? { completed_at: new Date().toISOString() }
          : {}),
      })
      .eq("id", jobId),
    admin
      .from("documents")
      .update({ processing_status: status })
      .eq("id", documentId),
  ]);
}

export const processUploadedPdf = inngest.createFunction(
  {
    id: "process-uploaded-pdf",
    retries: 3,
    triggers: [{ event: "sonar/document.uploaded" }],
  },
  async ({ event, step }) => {
    const payload = event.data as DocumentUploadedEventData;

    if (!isSupabaseAdminConfigured()) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY is required by background processing workers."
      );
    }

    const admin = createAdminSupabaseClient();
    if (!admin) {
      throw new Error("Unable to initialize admin Supabase client.");
    }

    // Step 1: Download source PDF from private bucket and extract native text layers
    const extractedPages = await step.run("extract-pdf-pages", async () => {
      await updateJobProgress(
        payload.jobId,
        payload.documentId,
        "extracting",
        "extract_text",
        15,
        "Downloading PDF and inspecting native text layers."
      );

      const { data: blob, error } = await admin.storage
        .from("course-documents")
        .download(payload.storagePath);

      if (error || !blob) {
        throw new Error(error?.message ?? "Failed to download PDF from storage.");
      }

      const bytes = new Uint8Array(await blob.arrayBuffer());
      const pages = await extractPdfTextPages(bytes);

      await admin
        .from("documents")
        .update({ page_count: pages.length })
        .eq("id", payload.documentId);

      await admin.from("document_pages").insert(
        pages.map((p) => ({
          document_id: payload.documentId,
          version_id: payload.versionId,
          page_number: p.pageNumber,
          has_text_layer: p.hasTextLayer,
          ocr_applied: !p.hasTextLayer,
          raw_text: p.rawText,
          confidence_score: p.hasTextLayer ? 0.92 : 0.65,
        }))
      );

      return pages;
    });

    // Step 2: Run semantic extraction, OCR fallback, table reconstruction, math & figure enrichment
    const blockIdsForEmbedding = await step.run(
      "structure-and-enrich-blocks",
      async () => {
        await updateJobProgress(
          payload.jobId,
          payload.documentId,
          "structuring",
          "structure",
          45,
          "Structuring headings, tables, equations, and figure descriptions."
        );

        const ocrProvider = getDefaultOcrProvider();
        const aiReady = isAiConfigured();
        let readingOrder = 0;
        const createdBlocks: Array<{
          id: string;
          pageNumber: number;
          readingOrder: number;
          blockType: "heading" | "paragraph" | "list" | "table" | "equation" | "figure";
          contentText: string;
          spokenText: string | null;
        }> = [];
        const confidences: number[] = [];

        for (const page of extractedPages) {
          const blocksForPage = aiReady
            ? await ocrProvider.extractPageBlocks({
                pageNumber: page.pageNumber,
                rawTextLayer: page.rawText,
              })
            : [
                {
                  blockType: "paragraph" as const,
                  contentText:
                    page.rawText ||
                    `Page ${page.pageNumber} contains scanned imagery requiring GOOGLE_GENERATIVE_AI_API_KEY for multimodal OCR.`,
                  confidence: page.hasTextLayer ? 0.9 : 0.35,
                },
              ];

          for (const item of blocksForPage) {
            let spokenText: string | null = item.contentText;
            let contentHtml: string | null = null;
            let confidence = item.confidence;
            let needsReview = confidence < 0.85;

            let equationPayload:
              | {
                  latex: string;
                  mathml: string | null;
                  narrationEn: string;
                  narrationId: string;
                  isSupported: boolean;
                  unsupportedReason: string | null;
                }
              | undefined;

            if (item.blockType === "equation" && item.latex) {
              const mml = latexToMathMl(item.latex);
              const narration = narrateLatexEquation(item.latex);
              contentHtml = mml.mathml;
              spokenText =
                payload.language === "id"
                  ? narration.narrationId
                  : narration.narrationEn;
              confidence = Math.max(
                0.2,
                confidence - (mml.valid ? 0 : 0.35) - narration.confidencePenalty
              );
              needsReview = !mml.valid || !narration.supported || confidence < 0.85;
              equationPayload = {
                latex: item.latex,
                mathml: mml.mathml,
                narrationEn: narration.narrationEn,
                narrationId: narration.narrationId,
                isSupported: narration.supported && mml.valid,
                unsupportedReason: !mml.valid
                  ? mml.error ?? "Invalid LaTeX syntax"
                  : narration.unsupportedConstructs.join(", ") || null,
              };
            }

            if (item.blockType === "figure") {
              confidence = Math.min(confidence, 0.78);
              needsReview = true;
            }

            confidences.push(confidence);

            const { data: insertedBlock, error: blockErr } = await admin
              .from("document_blocks")
              .insert({
                document_id: payload.documentId,
                version_id: payload.versionId,
                page_number: page.pageNumber,
                reading_order: readingOrder++,
                block_type: item.blockType,
                heading_level: item.headingLevel ?? null,
                content_text: item.contentText,
                content_html: contentHtml,
                spoken_text: spokenText,
                ai_generated: true,
                confidence_score: Number(confidence.toFixed(3)),
                needs_review: needsReview,
                is_verified: false,
              })
              .select("id")
              .single();

            if (blockErr || !insertedBlock) {
              throw new Error(blockErr?.message ?? "Failed to persist document block.");
            }

            createdBlocks.push({
              id: insertedBlock.id,
              pageNumber: page.pageNumber,
              readingOrder: readingOrder - 1,
              blockType: item.blockType,
              contentText: item.contentText,
              spokenText,
            });

            if (
              item.blockType === "table" &&
              item.tableHeaders &&
              item.tableRows
            ) {
              await admin.from("document_tables").insert({
                block_id: insertedBlock.id,
                document_id: payload.documentId,
                caption: item.contentText,
                headers: item.tableHeaders,
                rows: item.tableRows,
                row_count: item.tableRows.length,
                column_count: item.tableHeaders.length,
              });
            }

            if (equationPayload) {
              await admin.from("document_equations").insert({
                block_id: insertedBlock.id,
                document_id: payload.documentId,
                latex: equationPayload.latex,
                mathml: equationPayload.mathml,
                narration_en: equationPayload.narrationEn,
                narration_id: equationPayload.narrationId,
                is_supported: equationPayload.isSupported,
                unsupported_reason: equationPayload.unsupportedReason,
              });
            }

            if (item.blockType === "figure" && item.figureSummary) {
              await admin.from("document_figures").insert({
                block_id: insertedBlock.id,
                document_id: payload.documentId,
                figure_label: item.figureSummary.figureLabel,
                figure_type: item.figureSummary.figureType,
                summary: item.figureSummary.summary,
                axes_and_units: item.figureSummary.axesAndUnits ?? null,
                trends: item.figureSummary.trends ?? null,
                key_points: item.figureSummary.keyPoints ?? [],
                uncertainty_notes: item.figureSummary.uncertaintyNotes ?? null,
              });
            }
          }
        }

        const avgConfidence =
          confidences.length > 0
            ? Number(
                (
                  confidences.reduce((a, b) => a + b, 0) / confidences.length
                ).toFixed(3)
              )
            : 0.5;

        await admin
          .from("documents")
          .update({ overall_confidence: avgConfidence })
          .eq("id", payload.documentId);

        return createdBlocks;
      }
    );

    // Step 3: Semantic Chunking & pgvector Embedding Generation
    await step.run("embed-rag-chunks", async () => {
      await updateJobProgress(
        payload.jobId,
        payload.documentId,
        "embedding",
        "embed_rag",
        80,
        "Chunking semantic blocks and generating pgvector embeddings."
      );

      const chunks = buildSemanticChunks(blockIdsForEmbedding);
      if (chunks.length === 0) return;

      const embeddings = isAiConfigured()
        ? await generateDocumentEmbeddings(chunks.map((c) => c.content))
        : chunks.map(() => null);

      const rows: Database["public"]["Tables"]["document_chunks"]["Insert"][] =
        chunks.map((chunk, idx) => ({
          document_id: payload.documentId,
          version_id: payload.versionId,
          chunk_index: chunk.chunkIndex,
          page_number: chunk.pageNumber,
          section_heading: chunk.sectionHeading,
          block_ids: chunk.blockIds,
          content: chunk.content,
          token_count: chunk.tokenCount,
          embedding: embeddings[idx],
        }));

      await admin.from("document_chunks").insert(rows);
    });

    // Step 4: Finalize status, audit log, and accessible notification
    await step.run("finalize-document-job", async () => {
      await updateJobProgress(
        payload.jobId,
        payload.documentId,
        "completed",
        "finalize",
        100,
        "Accessible document conversion completed. Ready for reading and volunteer verification."
      );

      await Promise.all([
        admin.from("notifications").insert({
          user_id: payload.uploadedBy,
          type: "processing_completed",
          title: "Document ready to read",
          message:
            "Your uploaded PDF has been converted into an accessible structured document.",
          href: `/reader/${payload.documentId}`,
        }),
        admin.from("audit_logs").insert({
          actor_id: payload.uploadedBy,
          action: "document.processing_completed",
          entity_type: "document",
          entity_id: payload.documentId,
          metadata: {
            versionId: payload.versionId,
            jobId: payload.jobId,
            blocksCreated: blockIdsForEmbedding.length,
          },
        }),
      ]);
    });

    return {
      documentId: payload.documentId,
      blocksCreated: blockIdsForEmbedding.length,
    };
  }
);

export const inngestFunctions = [processUploadedPdf];
