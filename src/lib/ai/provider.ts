import "server-only";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { EmbeddingModel, LanguageModel } from "ai";
import { getServerEnv, isAiConfigured } from "@/lib/env";
import {
  DEFAULT_FALLBACK_MODELS,
  isRateLimitOrQuotaError,
  resolveFallbackChain,
} from "./fallback-resolver";

export { DEFAULT_FALLBACK_MODELS, isRateLimitOrQuotaError, resolveFallbackChain };
export type AiModelCapability = "chat" | "vision" | "embedding";

function createGoogleProvider() {
  const env = getServerEnv();
  if (!env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error(
      "AI provider credentials are missing. Configure GOOGLE_GENERATIVE_AI_API_KEY in .env.local."
    );
  }
  return createGoogleGenerativeAI({
    apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
  });
}

export function getChatFallbackChain(): string[] {
  const env = getServerEnv();
  return resolveFallbackChain(env.AI_CHAT_MODEL, env.AI_FALLBACK_CHAT_MODELS);
}

export function getVisionFallbackChain(): string[] {
  const env = getServerEnv();
  return resolveFallbackChain(env.AI_VISION_MODEL, env.AI_FALLBACK_VISION_MODELS);
}

export function createFallbackLanguageModel(
  modelNames: string[],
  googleProvider: ReturnType<typeof createGoogleProvider>
): LanguageModel {
  const models = modelNames.map((name) => googleProvider(name));
  const primary = models[0];

  return new Proxy(primary, {
    get(target, prop, receiver) {
      if (prop === "doGenerate") {
        return async (options: unknown) => {
          let lastError: unknown;
          for (let i = 0; i < models.length; i++) {
            const current = models[i] as unknown as { doGenerate: (opts: unknown) => Promise<unknown> };
            const name = modelNames[i];
            const hasMoreFallbacks = i < models.length - 1;
            const rawOpts = (options && typeof options === "object" ? options : {}) as Record<string, unknown>;

            try {
              if (hasMoreFallbacks) {
                const timeoutController = new AbortController();
                const timeoutId = setTimeout(() => {
                  timeoutController.abort(new Error(`Model "${name}" call timed out after 5500ms`));
                }, 5500);

                const existingSignal = rawOpts.abortSignal as AbortSignal | undefined;
                const combinedSignal = existingSignal
                  ? AbortSignal.any([existingSignal, timeoutController.signal])
                  : timeoutController.signal;

                try {
                  const res = await current.doGenerate({
                    ...rawOpts,
                    abortSignal: combinedSignal,
                  });
                  clearTimeout(timeoutId);
                  return res;
                } finally {
                  clearTimeout(timeoutId);
                }
              }

              return await current.doGenerate(options);
            } catch (err) {
              lastError = err;
              if (i < models.length - 1 && isRateLimitOrQuotaError(err)) {
                console.warn(
                  `[AI Model Fallback] Model "${name}" failed with rate limit / capacity error (${(err as Error).message}). Switching to fallback model "${modelNames[i + 1]}"...`
                );
                continue;
              }
              throw err;
            }
          }
          throw lastError;
        };
      }

      if (prop === "doStream") {
        return async (options: unknown) => {
          let lastError: unknown;
          for (let i = 0; i < models.length; i++) {
            const current = models[i] as unknown as { doStream: (opts: unknown) => Promise<unknown> };
            const name = modelNames[i];
            const hasMoreFallbacks = i < models.length - 1;
            const rawOpts = (options && typeof options === "object" ? options : {}) as Record<string, unknown>;

            try {
              if (hasMoreFallbacks) {
                const timeoutController = new AbortController();
                const timeoutId = setTimeout(() => {
                  timeoutController.abort(new Error(`Model "${name}" stream timed out after 5500ms`));
                }, 5500);

                const existingSignal = rawOpts.abortSignal as AbortSignal | undefined;
                const combinedSignal = existingSignal
                  ? AbortSignal.any([existingSignal, timeoutController.signal])
                  : timeoutController.signal;

                try {
                  const res = await current.doStream({
                    ...rawOpts,
                    abortSignal: combinedSignal,
                  });
                  clearTimeout(timeoutId);
                  return res;
                } finally {
                  clearTimeout(timeoutId);
                }
              }

              return await current.doStream(options);
            } catch (err) {
              lastError = err;
              if (i < models.length - 1 && isRateLimitOrQuotaError(err)) {
                console.warn(
                  `[AI Model Fallback] Model "${name}" failed with rate limit / capacity error (${(err as Error).message}). Switching to fallback model "${modelNames[i + 1]}"...`
                );
                continue;
              }
              throw err;
            }
          }
          throw lastError;
        };
      }

      return Reflect.get(target, prop, receiver);
    },
  });
}

export function getChatModel(): LanguageModel {
  const google = createGoogleProvider();
  const chain = getChatFallbackChain();
  return createFallbackLanguageModel(chain, google);
}

export function getVisionModel(): LanguageModel {
  const google = createGoogleProvider();
  const chain = getVisionFallbackChain();
  return createFallbackLanguageModel(chain, google);
}

export function getEmbeddingModel(): EmbeddingModel {
  const env = getServerEnv();
  const google = createGoogleProvider();
  return google.embeddingModel(env.AI_EMBEDDING_MODEL);
}

export function getAiStatus() {
  const env = getServerEnv();
  return {
    configured: isAiConfigured(),
    provider: env.AI_PROVIDER,
    chatModel: env.AI_CHAT_MODEL,
    chatFallbacks: getChatFallbackChain(),
    visionModel: env.AI_VISION_MODEL,
    visionFallbacks: getVisionFallbackChain(),
    embeddingModel: env.AI_EMBEDDING_MODEL,
  };
}
