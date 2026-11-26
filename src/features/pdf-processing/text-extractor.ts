import "server-only";

export interface ExtractedPdfPage {
  pageNumber: number;
  rawText: string;
  hasTextLayer: boolean;
}

/**
 * Extracts per-page text layers from a PDF buffer using pdfjs-dist legacy build
 * (safe inside Node.js serverless / worker runtimes without a browser canvas).
 * Pages with minimal or empty text layers are flagged for multimodal OCR/Vision.
 */
export async function extractPdfTextPages(
  pdfBytes: Uint8Array
): Promise<ExtractedPdfPage[]> {
  // Pre-register pdf.worker.mjs on globalThis so Next.js/Vercel NFT bundles it
  // and pdfjs-dist runs in-thread without dynamic worker path resolution errors.
  const g = globalThis as Record<string, unknown>;
  if (!g.pdfjsWorker) {
    g.pdfjsWorker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
  }

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjs.getDocument({
    data: pdfBytes,
    useWorkerFetch: false,
    disableFontFace: true,
  });

  const doc = await loadingTask.promise;
  const pages: ExtractedPdfPage[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const strings = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .filter(Boolean);
      const rawText = strings.join(" ").replace(/\s+/g, " ").trim();
      pages.push({
        pageNumber,
        rawText,
        hasTextLayer: rawText.length >= 25,
      });
    }
  } finally {
    await loadingTask.destroy();
  }

  return pages;
}
