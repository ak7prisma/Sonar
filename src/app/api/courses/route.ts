import { NextResponse } from "next/server";
import { getAuthenticatedContext, hasAnyRole } from "@/lib/supabase/auth-helpers";
import { isSupabaseConfigured } from "@/lib/env";
import { courseCreateSchema } from "@/lib/validation/schemas";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ configured: false, courses: [] });
  }

  const { supabase, auth } = await getAuthenticatedContext();
  if (!supabase || !auth) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ configured: true, courses: data ?? [] });
}

export async function POST(req: Request) {
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

  if (!hasAnyRole(auth.roles, ["admin"])) {
    return NextResponse.json(
      { error: "Only administrators can create courses." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = courseCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      code: parsed.data.code.toUpperCase(),
      title: parsed.data.title,
      discipline: parsed.data.discipline,
      description: parsed.data.description ?? null,
      created_by: auth.userId,
    })
    .select("*")
    .single();

  if (error || !course) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to create course." },
      { status: 500 }
    );
  }

  await supabase.from("course_members").insert({
    course_id: course.id,
    user_id: auth.userId,
    member_role: "instructor",
  });

  return NextResponse.json({ course }, { status: 201 });
}
