import { NextResponse } from "next/server";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { getAuthenticatedContext } from "@/lib/supabase/auth-helpers";
import { isAiConfigured, isSupabaseConfigured } from "@/lib/env";
import { getChatModel } from "@/lib/ai/provider";
import { buildGroundedAssistantInstructions } from "@/lib/ai/prompts";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { retrieveDocumentChunks } from "@/lib/rag/retriever";
import { buildGroundedContext } from "@/lib/rag/context-builder";
import { chatRequestSchema } from "@/lib/validation/schemas";

export const maxDuration = 45;

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

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.",
      },
      { status: 503 }
    );
  }

  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        error:
          "Gemini API key is not configured yet. Set GOOGLE_GENERATIVE_AI_API_KEY in .env.local to enable grounded document Q&A.",
      },
      { status: 503 }
    );
  }

  const { supabase, auth } = await getAuthenticatedContext();
  if (!supabase || !auth) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const rate = checkRateLimit({
    key: `ai-chat:${auth.userId}`,
    limit: 30,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before sending another question." },
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

  const { documentId, language } = parsed.data;
  const uiMessages = parsed.data.messages as UIMessage[];

  // Verify user authorization to read the target document (RLS enforces course/share scope)
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("id, title, course_id")
    .eq("id", documentId)
    .maybeSingle();

  if (docError || !doc) {
    return NextResponse.json(
      { error: "Document not found or access denied." },
      { status: 403 }
    );
  }

  const { data: course } = await supabase
    .from("courses")
    .select("code, title")
    .eq("id", doc.course_id)
    .maybeSingle();

  const latestQuery = extractLatestUserText(uiMessages);
  const retrievedChunks = latestQuery
    ? await retrieveDocumentChunks({
        documentId: doc.id,
        query: latestQuery,
        matchCount: 6,
      })
    : [];

  const { contextXml } = buildGroundedContext(retrievedChunks);
  const instructions = buildGroundedAssistantInstructions({
    documentTitle: doc.title,
    courseCode: course?.code,
    courseTitle: course?.title,
    language,
    contextXml,
  });

  const modelMessages = await convertToModelMessages(uiMessages);

  const result = streamText({
    model: getChatModel(),
    instructions,
    messages: modelMessages,
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse();
}
