import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/supabase/auth-helpers";
import { isSupabaseConfigured } from "@/lib/env";
import { accessibilityPreferencesSchema } from "@/lib/validation/schemas";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ configured: false, preferences: null });
  }

  const { supabase, auth } = await getAuthenticatedContext();
  if (!supabase || !auth) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("accessibility_preferences")
    .select("*")
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ configured: true, preferences: data });
}

export async function PUT(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      configured: false,
      persistedLocallyOnly: true,
    });
  }

  const { supabase, auth } = await getAuthenticatedContext();
  if (!supabase || !auth) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = accessibilityPreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid accessibility preference values.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("accessibility_preferences")
    .upsert({
      user_id: auth.userId,
      reading_font: parsed.data.readingFont === "atkinson" ? "atkinson" : "inter",
      font_size_px: parsed.data.fontSizePx,
      line_height: parsed.data.lineHeight,
      letter_spacing_em: parsed.data.letterSpacingEm,
      reading_width: parsed.data.readingWidth || "comfortable",
      contrast_mode: parsed.data.contrastMode,
      reading_surface: parsed.data.readingSurface,
      narration_speed: parsed.data.narrationSpeed,
      reduced_motion: parsed.data.motionPreference === "reduce",
      preferred_language: parsed.data.language,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ configured: true, preferences: data });
}
