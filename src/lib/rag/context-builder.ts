import { sanitizeRagSourceText } from "@/lib/accessibility/sanitize";
import type { RetrievedChunk } from "@/lib/rag/retriever";

export interface SourceCitation {
  citationLabel: string;
  chunkId: string;
  pageNumber: number;
  sectionHeading: string | null;
  blockIds: string[];
  excerpt: string;
}

export function buildGroundedContext(chunks: RetrievedChunk[]): {
  contextXml: string;
  citations: SourceCitation[];
} {
  if (chunks.length === 0) {
    return {
      contextXml:
        "<untrusted_document_sources>\n  <empty>No matching document excerpts were retrieved for this query.</empty>\n</untrusted_document_sources>",
      citations: [],
    };
  }

  const citations: SourceCitation[] = [];
  const xmlBlocks = chunks.map((chunk, index) => {
    const handle = chunk.sectionHeading
      ? `Page ${chunk.pageNumber} · ${chunk.sectionHeading}`
      : `Page ${chunk.pageNumber} · Excerpt ${index + 1}`;

    const cleanText = sanitizeRagSourceText(chunk.content);

    citations.push({
      citationLabel: handle,
      chunkId: chunk.chunkId,
      pageNumber: chunk.pageNumber,
      sectionHeading: chunk.sectionHeading,
      blockIds: chunk.blockIds,
      excerpt: cleanText.slice(0, 220),
    });

    return [
      `  <untrusted_document_source citation="${handle}" page="${chunk.pageNumber}" block_ids="${chunk.blockIds.join(",")}">`,
      cleanText,
      "  </untrusted_document_source>",
    ].join("\n");
  });

  return {
    contextXml: [
      "<untrusted_document_sources>",
      ...xmlBlocks,
      "</untrusted_document_sources>",
    ].join("\n"),
    citations,
  };
}
