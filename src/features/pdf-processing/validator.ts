import { createHash } from "node:crypto";

export const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
export const ALLOWED_PDF_MIME_TYPES = new Set([
  "application/pdf",
  "application/x-pdf",
]);

export interface PdfValidationSuccess {
  valid: true;
  fileHash: string;
  sizeBytes: number;
}

export interface PdfValidationFailure {
  valid: false;
  error: string;
}

export type PdfValidationResult = PdfValidationSuccess | PdfValidationFailure;

/**
 * Validates an uploaded file at the server boundary:
 * - Non-empty size <= 50MB
 * - `.pdf` extension & allowed MIME type
 * - `%PDF-` magic header signature (never trust client file extension alone)
 * - Computes deterministic SHA-256 hash for course duplicate detection
 */
export function validatePdfBuffer(options: {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}): PdfValidationResult {
  const { buffer, filename, mimeType } = options;

  if (!buffer || buffer.byteLength === 0) {
    return { valid: false, error: "Uploaded file is empty." };
  }

  if (buffer.byteLength > MAX_PDF_SIZE_BYTES) {
    return {
      valid: false,
      error: "PDF exceeds the 50 MB maximum allowed file size.",
    };
  }

  const lowerName = filename.toLowerCase();
  if (!lowerName.endsWith(".pdf")) {
    return {
      valid: false,
      error: "Only PDF (.pdf) course material files are supported.",
    };
  }

  if (mimeType && !ALLOWED_PDF_MIME_TYPES.has(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported MIME type "${mimeType}". Upload a valid PDF document.`,
    };
  }

  const header = buffer.subarray(0, 5).toString("ascii");
  if (header !== "%PDF-") {
    return {
      valid: false,
      error: "File header does not match a valid PDF (%PDF-) signature.",
    };
  }

  const fileHash = createHash("sha256").update(buffer).digest("hex");

  return {
    valid: true,
    fileHash,
    sizeBytes: buffer.byteLength,
  };
}
