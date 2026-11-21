import "server-only";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { EmbeddingModel, LanguageModel } from "ai";
import { getServerEnv, isAiConfigured } from "@/lib/env";

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

export function getChatModel(): LanguageModel {
  const env = getServerEnv();
  const google = createGoogleProvider();
  return google(env.AI_CHAT_MODEL);
}

export function getVisionModel(): LanguageModel {
  const env = getServerEnv();
  const google = createGoogleProvider();
  return google(env.AI_VISION_MODEL);
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
    visionModel: env.AI_VISION_MODEL,
    embeddingModel: env.AI_EMBEDDING_MODEL,
  };
}
