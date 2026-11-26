export const DEFAULT_FALLBACK_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite-preview",
];

export function isRateLimitOrQuotaError(error: unknown): boolean {
  if (!error) return false;

  const err = error as Record<string, unknown>;
  const status = Number(
    err.status ??
      err.statusCode ??
      (err.response as Record<string, unknown> | undefined)?.status
  );

  // HTTP 429 (Too Many Requests / Quota Exceeded), 503 (Overloaded), 504 (Gateway Timeout), 408 (Request Timeout)
  if (status === 429 || status === 503 || status === 504 || status === 408) {
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
    "high demand",
    "spikes in demand",
    "temporarily unavailable",
    "capacity",
    "try again later",
    "exceeded your current quota",
    "503",
    "504",
    "service unavailable",
    "unavailable",
    "not found",
    "is not found",
    "unsupported model",
    "deprecated",
    "no longer available",
    "aborted",
    "timeout",
    "timed out",
    "delay was aborted",
    "etimedout",
    "econnreset",
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
