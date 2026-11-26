import { NextResponse } from "next/server";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { getAuthenticatedContext } from "@/lib/supabase/auth-helpers";
import { isAiConfigured, isSupabaseConfigured } from "@/lib/env";
import { getChatModel } from "@/lib/ai/provider";
import { buildGroundedAssistantInstructions } from "@/lib/ai/prompts";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import {
  rankChunksByQuery,
  retrieveDocumentChunks,
  type RetrievedChunk,
} from "@/lib/rag/retriever";
import { buildGroundedContext } from "@/lib/rag/context-builder";
import { buildSemanticChunks, type ChunkableBlock } from "@/lib/rag/chunker";
import { chatRequestSchema } from "@/lib/validation/schemas";
import { getScannedDocument } from "@/lib/data/workspace";

export const maxDuration = 60;

function extractLatestUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "user" && Array.isArray(msg.parts)) {
      const text = msg.parts
        .filter((part): part is { type: "text"; text: string } => part.type === "text")
        .map((part) => part.text)
        .join(" ")
        .trim();
      if (text) return text;
    }
  }
  return "";
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    route: "/api/ai/chat",
    timestamp: new Date().toISOString(),
    isAiConfigured: isAiConfigured(),
  });
}

export async function POST(req: Request) {
  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        error:
          "Gemini API key is not configured yet. Set GOOGLE_GENERATIVE_AI_API_KEY in .env.local to enable grounded document Q&A.",
      },
      { status: 503 }
    );
  }

  // Rate limiting per IP or session
  const rate = checkRateLimit({
    key: "ai-chat-global",
    limit: 60,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a moment before sending another question." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid chat request.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { documentId, documentTitle: passedTitle, language, blocks: passedBlocks } =
    parsed.data;
  const uiMessages = parsed.data.messages as UIMessage[];
  const latestQuery = extractLatestUserText(uiMessages);

  let docTitle = passedTitle || "Materi Bacaan";
  let courseCode: string | undefined = undefined;
  let courseTitle: string | undefined = undefined;
  let retrievedChunks: RetrievedChunk[] = [];

  // Resolution Strategy 1: Explicit blocks provided directly by the client (scanner or reader)
  if (passedBlocks && passedBlocks.length > 0) {
    const chunkable: ChunkableBlock[] = passedBlocks.map((b, idx) => ({
      id: b.id || `blk-${idx + 1}`,
      pageNumber: b.pageNumber || 1,
      readingOrder: b.readingOrder || idx + 1,
      blockType: (b.blockType as ChunkableBlock["blockType"]) || "paragraph",
      sectionHeading: b.sectionHeading ?? null,
      contentText: b.contentText || "",
      spokenText: b.spokenText ?? null,
    }));

    const semanticChunks = buildSemanticChunks(chunkable, { maxChars: 1200 });
    retrievedChunks = rankChunksByQuery(semanticChunks, latestQuery, documentId, 8);
  } else {
    // Resolution Strategy 2: In-memory scanned document store (e.g. OCR result in session)
    const scanned = getScannedDocument(documentId);
    if (scanned) {
      docTitle = scanned.document.title;
      courseCode = scanned.course.code;
      courseTitle = scanned.course.title;

      const chunkable: ChunkableBlock[] = scanned.blocks.map((b) => ({
        id: b.id,
        pageNumber: b.page_number,
        readingOrder: b.reading_order,
        blockType: b.block_type,
        sectionHeading: b.section_id,
        contentText: b.content_text,
        spokenText: b.spoken_text,
      }));

      const semanticChunks = buildSemanticChunks(chunkable, { maxChars: 1200 });
      retrievedChunks = rankChunksByQuery(semanticChunks, latestQuery, documentId, 8);
    } else if (isSupabaseConfigured()) {
      // Resolution Strategy 3: Supabase database chunks & RAG
      try {
        const { supabase } = await getAuthenticatedContext();
        if (supabase) {
          const { data: doc } = await supabase
            .from("documents")
            .select("id, title, course_id")
            .eq("id", documentId)
            .maybeSingle();

          if (doc) {
            docTitle = doc.title;
            const { data: course } = await supabase
              .from("courses")
              .select("code, title")
              .eq("id", doc.course_id)
              .maybeSingle();

            if (course) {
              courseCode = course.code;
              courseTitle = course.title;
            }

            retrievedChunks = latestQuery
              ? await retrieveDocumentChunks({
                  documentId: doc.id,
                  query: latestQuery,
                  matchCount: 8,
                })
              : [];
          }
        }
      } catch (err) {
        console.warn("[AI Chat Route] Supabase chunk retrieval warning:", err);
      }
    }
  }

  const { contextXml } = buildGroundedContext(retrievedChunks);

  const baseInstructions = buildGroundedAssistantInstructions({
    documentTitle: docTitle,
    courseCode,
    courseTitle,
    language,
    contextXml,
  });

  const interactiveInstructions = [
    baseInstructions,
    "",
    "ROLE AS AN ACCESSIBLE STUDY COMPANION & DISCUSSION PARTNER:",
    "- Engage naturally with the student in thoughtful academic discussion strictly about this document's text and concepts.",
    "- If the student asks for practice questions, quizzes, or step-by-step mathematical derivations, generate them strictly adhering to the definitions and theorems in the text.",
    "- Render all inline mathematical formulas in LaTeX delimited by \\( ... \\) and standalone display equations with \\[ ... \\].",
    "- Speak politely and encouragingly in " + (language === "id" ? "Bahasa Indonesia" : "English") + ".",
    "- Always ground your statements and cite references using the format [Page X · Topic].",
    `- SCOPE: Support all questions about this document ("${docTitle}"), including summarizing its contents, explaining steps, and discussing the continuation of concepts in this subject. Only refuse completely unrelated chitchat or off-topic queries.`,
  ].join("\n");

  const modelMessages = await convertToModelMessages(uiMessages);

  const result = streamText({
    model: getChatModel(),
    instructions: interactiveInstructions,
    messages: modelMessages,
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse();
}
