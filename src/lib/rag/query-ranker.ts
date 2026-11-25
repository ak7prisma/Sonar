import type { SemanticChunk } from "@/lib/rag/chunker";

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

const QUERY_STOPWORDS = new Set([
  "apa",
  "apakah",
  "bagaimana",
  "mengapa",
  "siapa",
  "kapan",
  "dimana",
  "yang",
  "dan",
  "atau",
  "dari",
  "untuk",
  "dengan",
  "pada",
  "dalam",
  "ini",
  "itu",
  "tentang",
  "jelaskan",
  "sebutkan",
  "tolong",
  "buat",
  "the",
  "and",
  "for",
  "what",
  "how",
  "why",
  "explain",
  "this",
  "that",
  "is",
  "are",
]);

/**
 * Deterministically ranks document semantic chunks against a user's question,
 * returning the top grounded chunks for prompt context without requiring database RPC.
 */
export function rankChunksByQuery(
  chunks: SemanticChunk[],
  query: string,
  documentId: string,
  matchCount = 6
): RetrievedChunk[] {
  if (chunks.length === 0) return [];
  if (chunks.length <= matchCount) {
    return chunks.map((c, i) => ({
      chunkId: `chunk-${documentId}-${c.chunkIndex ?? i + 1}`,
      documentId,
      versionId: `v-${documentId}`,
      pageNumber: c.pageNumber,
      sectionHeading: c.sectionHeading,
      blockIds: c.blockIds,
      content: c.content,
      similarity: 0.95 - i * 0.02,
      hybridScore: 0.95 - i * 0.02,
    }));
  }

  const terms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !QUERY_STOPWORDS.has(t));

  const scored = chunks.map((chunk, index) => {
    let score = 0;
    const lowerContent = chunk.content.toLowerCase();
    const lowerHeading = (chunk.sectionHeading || "").toLowerCase();

    for (const term of terms) {
      if (lowerHeading.includes(term)) score += 3.0;
      const count = (lowerContent.match(new RegExp(`\\b${term}\\b`, "g")) || []).length;
      score += Math.min(count, 4) * 1.0;
      if (count === 0 && lowerContent.includes(term)) score += 0.5;
    }

    const normalizedScore =
      terms.length > 0 ? Math.min(1.0, score / (terms.length * 2.5)) : 0.5;

    return {
      chunkId: `chunk-${documentId}-${chunk.chunkIndex ?? index + 1}`,
      documentId,
      versionId: `v-${documentId}`,
      pageNumber: chunk.pageNumber,
      sectionHeading: chunk.sectionHeading,
      blockIds: chunk.blockIds,
      content: chunk.content,
      similarity: Number(normalizedScore.toFixed(3)),
      hybridScore: Number(normalizedScore.toFixed(3)),
    };
  });

  scored.sort((a, b) => b.hybridScore - a.hybridScore);
  return scored.slice(0, matchCount);
}
