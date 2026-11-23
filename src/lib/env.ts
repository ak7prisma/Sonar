import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),
  AI_PROVIDER: z.enum(["google"]).default("google"),
  AI_CHAT_MODEL: z.string().min(1).default("gemini-3-flash-preview"),
  AI_VISION_MODEL: z.string().min(1).default("gemini-3-flash-preview"),
  AI_EMBEDDING_MODEL: z.string().min(1).default("gemini-embedding-2"),
  INNGEST_EVENT_KEY: z.string().min(1).optional(),
  INNGEST_SIGNING_KEY: z.string().min(1).optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
});

function sanitizeEmptyToUndefined(raw: Record<string, string | undefined>) {
  const cleaned: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(raw)) {
    cleaned[key] = value && value.trim().length > 0 ? value.trim() : undefined;
  }
  return cleaned;
}

export function getPublicEnv() {
  const parsed = publicEnvSchema.safeParse(
    sanitizeEmptyToUndefined({
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  );

  if (!parsed.success) {
    return {};
  }

  return parsed.data;
}

export function getServerEnv() {
  const parsed = serverEnvSchema.safeParse(
    sanitizeEmptyToUndefined(process.env as Record<string, string | undefined>)
  );

  if (!parsed.success) {
    return {
      AI_PROVIDER: "google" as const,
      AI_CHAT_MODEL: "gemini-3-flash-preview",
      AI_VISION_MODEL: "gemini-3-flash-preview",
      AI_EMBEDDING_MODEL: "gemini-embedding-2",
    };
  }

  return parsed.data;
}

export function getSupabasePublicKey(): string | undefined {
  const env = getPublicEnv();
  return env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function isSupabaseConfigured(): boolean {
  const env = getPublicEnv();
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && getSupabasePublicKey());
}

export function isSupabaseAdminConfigured(): boolean {
  const env = getServerEnv();
  return Boolean(isSupabaseConfigured() && env.SUPABASE_SERVICE_ROLE_KEY);
}

export function isAiConfigured(): boolean {
  const env = getServerEnv();
  return Boolean(env.GOOGLE_GENERATIVE_AI_API_KEY);
}

export function isInngestConfigured(): boolean {
  const env = getServerEnv();
  return Boolean(env.INNGEST_EVENT_KEY && env.INNGEST_SIGNING_KEY);
}

export function getAppUrl(): string {
  const env = getPublicEnv();
  return env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
