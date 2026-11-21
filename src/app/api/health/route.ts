import { NextResponse } from "next/server";
import { getAiStatus } from "@/lib/ai/provider";
import {
  isInngestConfigured,
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "sonar-platform",
    timestamp: new Date().toISOString(),
    integrations: {
      supabasePublic: isSupabaseConfigured(),
      supabaseAdmin: isSupabaseAdminConfigured(),
      ai: getAiStatus(),
      inngest: isInngestConfigured(),
    },
  });
}
