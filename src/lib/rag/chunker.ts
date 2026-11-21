export interface ChunkableBlock {
  id: string;
  pageNumber: number;
  readingOrder: number;
  blockType: "heading" | "paragraph" | "list" | "table" | "equation" | "figure";
  sectionHeading?: string | null;
  contentText: string;
  spokenText?: string | null;
}

export interface SemanticChunk {
  chunkIndex: number;
  pageNumber: number;
  sectionHeading: string | null;
  blockIds: string[];
  content: string;
  tokenCount: number;
}

/**
 * Estimates tokens conservatively (~4 chars per token) for model-agnostic chunk budgeting.
 */
export function estimateTokenCount(text: string): number {
  return Math.max(1, Math.ceil(text.trim().length / 4));
}

/**
 * Groups ordered semantic document blocks into retrieval chunks while preserving
 * page identity, section heading context, and atomic block IDs for citations.
 */
export function buildSemanticChunks(
  blocks: ChunkableBlock[],
  options: { maxChars?: number; overlapBlocks?: number } = {}
): SemanticChunk[] {
  const maxChars = options.maxChars ?? 1600;
  const overlapBlocks = options.overlapBlocks ?? 1;

  if (blocks.length === 0) return [];

  const sorted = [...blocks].sort((a, b) => a.readingOrder - b.readingOrder);
  const chunks: SemanticChunk[] = [];

  let currentHeading: string | null = null;
  let buffer: Array<{ block: ChunkableBlock; text: string }> = [];
  let bufferLength = 0;

  const flush = () => {
    if (buffer.length === 0) return;
    const content = buffer.map((item) => item.text).join("\n\n").trim();
    if (!content) return;

    chunks.push({
      chunkIndex: chunks.length,
      pageNumber: buffer[0].block.pageNumber,
      sectionHeading: buffer[0].block.sectionHeading ?? currentHeading,
      blockIds: buffer.map((item) => item.block.id),
      content,
      tokenCount: estimateTokenCount(content),
    });
  };

  for (const block of sorted) {
    if (block.blockType === "heading") {
      currentHeading = block.contentText.trim();
    }

    const combinedText = [
      block.contentText.trim(),
      block.spokenText && block.blockType === "equation"
        ? `Spoken equation: ${block.spokenText.trim()}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (!combinedText) continue;

    const sectionChanged =
      block.blockType === "heading" &&
      buffer.length > 0 &&
      bufferLength > Math.floor(maxChars * 0.45);

    const wouldOverflow =
      buffer.length > 0 && bufferLength + combinedText.length + 2 > maxChars;

    if (sectionChanged || wouldOverflow) {
      flush();
      const carryOver =
        !sectionChanged && overlapBlocks > 0 ? buffer.slice(-overlapBlocks) : [];
      buffer = [...carryOver];
      bufferLength = buffer.reduce((sum, item) => sum + item.text.length + 2, 0);
    }

    buffer.push({
      block: {
        ...block,
        sectionHeading: block.sectionHeading ?? currentHeading,
      },
      text: combinedText,
    });
    bufferLength += combinedText.length + 2;
  }

  flush();
  return chunks;
}
