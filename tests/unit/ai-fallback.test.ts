import { describe, expect, it, vi } from "vitest";
import {
  isRateLimitOrQuotaError,
  resolveFallbackChain,
} from "@/lib/ai/fallback-resolver";

describe("AI Fallback System", () => {
  describe("isRateLimitOrQuotaError", () => {
    it("detects numeric status 429", () => {
      expect(isRateLimitOrQuotaError({ status: 429 })).toBe(true);
      expect(isRateLimitOrQuotaError({ statusCode: 429 })).toBe(true);
      expect(isRateLimitOrQuotaError({ response: { status: 429 } })).toBe(true);
    });

    it("detects numeric status 503 (service overloaded)", () => {
      expect(isRateLimitOrQuotaError({ status: 503 })).toBe(true);
      expect(isRateLimitOrQuotaError({ statusCode: 503 })).toBe(true);
    });

    it("detects RESOURCE_EXHAUSTED and quota error messages", () => {
      const err1 = new Error("429 RESOURCE_EXHAUSTED: Quota exceeded for quota metric");
      expect(isRateLimitOrQuotaError(err1)).toBe(true);

      const err2 = new Error("Rate limit reached for model gemini-3-flash-preview. Please try again later.");
      expect(isRateLimitOrQuotaError(err2)).toBe(true);

      const err3 = new Error("The model is overloaded. Please try again later.");
      expect(isRateLimitOrQuotaError(err3)).toBe(true);

      const err4 = new Error("This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.");
      expect(isRateLimitOrQuotaError(err4)).toBe(true);
    });

    it("detects deprecated or not-found preview models", () => {
      const err = new Error("models/gemini-3-flash-preview is not found");
      expect(isRateLimitOrQuotaError(err)).toBe(true);

      const errNoLonger = new Error("This model models/gemini-2.5-flash is no longer available to new users.");
      expect(isRateLimitOrQuotaError(errNoLonger)).toBe(true);
    });

    it("returns false for non-quota errors (e.g. invalid syntax, auth error)", () => {
      const authErr = new Error("API_KEY_INVALID: Provided key is not recognized");
      expect(isRateLimitOrQuotaError(authErr)).toBe(false);

      const parseErr = new Error("Failed to parse JSON response");
      expect(isRateLimitOrQuotaError(parseErr)).toBe(false);

      expect(isRateLimitOrQuotaError(null)).toBe(false);
      expect(isRateLimitOrQuotaError(undefined)).toBe(false);
    });
  });

  describe("resolveFallbackChain", () => {
    it("puts primary model first and deduplicates default fallbacks", () => {
      const chain = resolveFallbackChain("gemini-3.8-flash");
      expect(chain[0]).toBe("gemini-3.8-flash");
      expect(chain).toContain("gemini-3.6-flash");
      expect(chain).toContain("gemini-3.5-flash-lite");
      expect(chain).toContain("gemini-3.1-flash-lite");
      expect(new Set(chain).size).toBe(chain.length);
    });

    it("respects custom configured fallbacks from env", () => {
      const chain = resolveFallbackChain(
        "gemini-custom",
        "gemini-custom-fallback-1, gemini-custom-fallback-2"
      );
      expect(chain).toEqual([
        "gemini-custom",
        "gemini-custom-fallback-1",
        "gemini-custom-fallback-2",
      ]);
    });
  });

  describe("Fallback Model Execution", () => {
    it("automatically fails over to secondary model when primary hits rate limit (429)", async () => {
      const primaryMock = {
        modelId: "gemini-3-flash-preview",
        specificationVersion: "v1" as const,
        provider: "google",
        doGenerate: vi.fn().mockRejectedValue(
          new Error("429 RESOURCE_EXHAUSTED: Quota exceeded for model gemini-3-flash-preview")
        ),
        doStream: vi.fn(),
      };

      const fallbackMock = {
        modelId: "gemini-2.5-flash",
        specificationVersion: "v1" as const,
        provider: "google",
        doGenerate: vi.fn().mockResolvedValue({
          text: "Successful response from fallback model",
          finishReason: "stop",
          usage: { promptTokens: 10, completionTokens: 10 },
          rawCall: { rawPrompt: null, rawSettings: {} },
        }),
        doStream: vi.fn(),
      };

      type MockModel = { doGenerate: (options: unknown) => Promise<{ text: string }> };
      const models: MockModel[] = [primaryMock, fallbackMock];

      // Simulated proxy logic
      const proxyModel = new Proxy(primaryMock, {
        get(target, prop, receiver) {
          if (prop === "doGenerate") {
            return async (options: unknown) => {
              for (let i = 0; i < models.length; i++) {
                try {
                  return await (models[i] as unknown as MockModel).doGenerate(options);
                } catch (err) {
                  if (i < models.length - 1 && isRateLimitOrQuotaError(err)) {
                    continue;
                  }
                  throw err;
                }
              }
            };
          }
          return Reflect.get(target, prop, receiver);
        },
      });

      const res = await (proxyModel as unknown as MockModel).doGenerate({});

      expect(primaryMock.doGenerate).toHaveBeenCalledTimes(1);
      expect(fallbackMock.doGenerate).toHaveBeenCalledTimes(1);
      expect(res.text).toBe("Successful response from fallback model");
    });
  });
});
