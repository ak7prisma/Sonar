import "server-only";

import { embed, embedMany } from "ai";
import { getEmbeddingModel } from "@/lib/ai/provider";

const VECTOR_DIMENSIONS = 768;

export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const model = getEmbeddingModel();
  const result = await embed({
    model,
    value: query.trim(),
    providerOptions: {
      google: {
        outputDimensionality: VECTOR_DIMENSIONS,
        taskType: "RETRIEVAL_QUERY",
      },
    },
  });
  return result.embedding;
}

export async function generateDocumentEmbeddings(
  texts: string[]
): Promise<number[][]> {
  if (texts.length === 0) return [];
  const model = getEmbeddingModel();
  const result = await embedMany({
    model,
    values: texts,
    maxParallelCalls: 4,
    providerOptions: {
      google: {
        outputDimensionality: VECTOR_DIMENSIONS,
        taskType: "RETRIEVAL_DOCUMENT",
      },
    },
  });
  return result.embeddings;
}
