import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/supabase/auth-helpers";
import { isSupabaseConfigured } from "@/lib/env";

export async function GET(
  _req: Request,
  context: { params: Promise<{ documentId: string }> }
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

  const { documentId } = await context.params;

  const { data: doc, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .maybeSingle();

  if (error || !doc) {
    return NextResponse.json(
      { error: "Document not found or access denied." },
      { status: 404 }
    );
  }

  const [
    { data: blocks },
    { data: tables },
    { data: equations },
    { data: figures },
    { data: signed },
  ] = await Promise.all([
    supabase
      .from("document_blocks")
      .select("*")
      .eq("document_id", documentId)
      .order("reading_order", { ascending: true }),
    supabase.from("document_tables").select("*").eq("document_id", documentId),
    supabase.from("document_equations").select("*").eq("document_id", documentId),
    supabase.from("document_figures").select("*").eq("document_id", documentId),
    supabase.storage
      .from("course-documents")
      .createSignedUrl(doc.storage_path, 300),
  ]);

  return NextResponse.json({
    document: doc,
    blocks: blocks ?? [],
    tables: tables ?? [],
    equations: equations ?? [],
    figures: figures ?? [],
    signedPdfUrl: signed?.signedUrl ?? null,
  });
}
