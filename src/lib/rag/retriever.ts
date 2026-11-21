import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateQueryEmbedding } from "@/lib/rag/embeddings";
import { isAiConfigured, isSupabaseConfigured } from "@/lib/env";

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  versionId: string;
  pageNumber: number;
  sectionHeading: string | null;
  blockIds: string[];
  content: string;
  similarity: number;
  hybridScore: number;
}

export async function retrieveDocumentChunks(options: {
  documentId: string;
  query: string;
  matchCount?: number;
  similarityThreshold?: number;
}): Promise<RetrievedChunk[]> {
  if (!isSupabaseConfigured() || !isAiConfigured()) {
    return [];
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const queryEmbedding = await generateQueryEmbedding(options.query);

  const { data, error } = await supabase.rpc("match_document_chunks", {
    p_document_id: options.documentId,
    p_query_embedding: queryEmbedding,
    p_query_text: options.query,
    p_match_count: options.matchCount ?? 6,
    p_similarity_threshold: options.similarityThreshold ?? 0.3,
  });

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to retrieve document chunks.");
  }

  return data.map((row) => ({
    chunkId: row.chunk_id,
    documentId: row.document_id,
    versionId: row.version_id,
    pageNumber: row.page_number,
    sectionHeading: row.section_heading,
    blockIds: row.block_ids ?? [],
    content: row.content,
    similarity: Number(row.similarity),
    hybridScore: Number(row.hybrid_score),
  }));
}
