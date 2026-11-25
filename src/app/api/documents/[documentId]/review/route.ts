import { NextResponse } from "next/server";
import { getAuthenticatedContext, hasAnyRole } from "@/lib/supabase/auth-helpers";
import { isSupabaseConfigured } from "@/lib/env";
import { reviewSubmitSchema } from "@/lib/validation/schemas";

export async function POST(
  req: Request,
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

  if (!hasAnyRole(auth.roles, ["volunteer", "reviewer", "admin"])) {
    return NextResponse.json(
      { error: "Volunteer, reviewer, or administrator role is required." },
      { status: 403 }
    );
  }

  const { documentId } = await context.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = reviewSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data: doc, error: docErr } = await supabase
    .from("documents")
    .select("id, current_version_id")
    .eq("id", documentId)
    .maybeSingle();

  if (docErr || !doc || !doc.current_version_id) {
    return NextResponse.json(
      { error: "Document not found or lacks an active version." },
      { status: 404 }
    );
  }

  const { error: reviewErr } = await supabase.from("document_reviews").insert({
    document_id: documentId,
    version_id: doc.current_version_id,
    reviewer_id: auth.userId,
    status: parsed.data.status,
    notes: parsed.data.notes ?? null,
    completed_at:
      parsed.data.status === "verified" ? new Date().toISOString() : null,
  });

  if (reviewErr) {
    return NextResponse.json({ error: reviewErr.message }, { status: 500 });
  }

  await supabase
    .from("documents")
    .update({ review_status: parsed.data.status })
    .eq("id", documentId);

  return NextResponse.json({
    documentId,
    reviewStatus: parsed.data.status,
  });
}
