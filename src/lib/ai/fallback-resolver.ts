export const DEFAULT_FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.5-pro",
  "gemini-1.5-pro",
];

export function isRateLimitOrQuotaError(error: unknown): boolean {
  if (!error) return false;

  const err = error as Record<string, unknown>;
  const status = Number(
    err.status ??
      err.statusCode ??
      (err.response as Record<string, unknown> | undefined)?.status
  );

  // HTTP 429 (Too Many Requests / Quota Exceeded) or 503 (Overloaded)
  if (status === 429 || status === 503) {
    return true;
  }

  const message = String(err.message ?? err.toString?.() ?? "").toLowerCase();

  const patterns = [
    "429",
    "resource_exhausted",
    "quota exceeded",
    "rate limit",
    "too many requests",
    "overloaded",
    "model is overloaded",
    "temporarily unavailable",
    "capacity",
    "try again later",
    "exceeded your current quota",
    "503",
    "service unavailable",
    "not found",
    "is not found",
    "unsupported model",
    "deprecated",
  ];

  return patterns.some((p) => message.includes(p));
}

export function resolveFallbackChain(
  primaryModel: string,
  configuredFallbacks?: string | null
): string[] {
  const fallbacks = configuredFallbacks
    ? configuredFallbacks
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean)
    : DEFAULT_FALLBACK_MODELS;

  return Array.from(new Set([primaryModel, ...fallbacks]));
}
