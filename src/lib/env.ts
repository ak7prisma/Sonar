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
  AI_CHAT_MODEL: z.string().min(1).default("gemini-3.1-flash-lite"),
  AI_VISION_MODEL: z.string().min(1).default("gemini-3.1-flash-lite"),
  AI_EMBEDDING_MODEL: z.string().min(1).default("gemini-embedding-001"),
  AI_FALLBACK_CHAT_MODELS: z
    .string()
    .default(
      "gemini-3.1-flash-lite-preview,gemini-3.5-flash-lite,gemini-3.6-flash,gemini-3.8-flash"
    ),
  AI_FALLBACK_VISION_MODELS: z
    .string()
    .default("gemini-3.5-flash-lite,gemini-3.8-flash,gemini-3.6-flash"),
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
  // Seamlessly resolve Google API Key across Vercel and local env naming conventions
  const googleApiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  const rawServer = {
    ...(process.env as Record<string, string | undefined>),
    GOOGLE_GENERATIVE_AI_API_KEY: googleApiKey,
  };

  const parsed = serverEnvSchema.safeParse(
    sanitizeEmptyToUndefined(rawServer)
  );

  if (!parsed.success) {
    return {
      GOOGLE_GENERATIVE_AI_API_KEY: googleApiKey,
      AI_PROVIDER: "google" as const,
      AI_CHAT_MODEL: "gemini-3.1-flash-lite",
      AI_VISION_MODEL: "gemini-3.1-flash-lite",
      AI_EMBEDDING_MODEL: "gemini-embedding-001",
      AI_FALLBACK_CHAT_MODELS:
        "gemini-3.1-flash-lite-preview,gemini-3.5-flash-lite,gemini-3.6-flash,gemini-3.8-flash",
      AI_FALLBACK_VISION_MODELS:
        "gemini-3.5-flash-lite,gemini-3.8-flash,gemini-3.6-flash",
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
  if (env.NEXT_PUBLIC_APP_URL) {
    return env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    const host = process.env.NEXT_PUBLIC_VERCEL_URL.replace(/\/$/, "");
    return host.startsWith("http") ? host : `https://${host}`;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    const host = process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "");
    return host.startsWith("http") ? host : `https://${host}`;
  }
  if (process.env.VERCEL_URL) {
    const host = process.env.VERCEL_URL.replace(/\/$/, "");
    return host.startsWith("http") ? host : `https://${host}`;
  }
  return "http://localhost:3000";
}
