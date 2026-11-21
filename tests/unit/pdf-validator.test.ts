import { describe, expect, it } from "vitest";
import { validatePdfBuffer } from "@/features/pdf-processing/validator";

describe("SONAR Server PDF Upload Validator", () => {
  it("accepts a valid PDF buffer and computes SHA-256 hash", () => {
    const samplePdf = Buffer.from("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF");
    const res = validatePdfBuffer({
      buffer: samplePdf,
      filename: "lecture-notes.pdf",
      mimeType: "application/pdf",
    });

    expect(res.valid).toBe(true);
    if (res.valid) {
      expect(res.fileHash).toHaveLength(64);
      expect(res.sizeBytes).toBe(samplePdf.byteLength);
    }
  });

  it("rejects disguised non-PDF files without %PDF- magic header", () => {
    const spoofed = Buffer.from("<script>alert(1)</script>");
    const res = validatePdfBuffer({
      buffer: spoofed,
      filename: "evil.pdf",
      mimeType: "application/pdf",
    });

    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toContain("%PDF-");
    }
  });

  it("rejects empty files and non-pdf extensions", () => {
    const empty = validatePdfBuffer({
      buffer: Buffer.alloc(0),
      filename: "empty.pdf",
      mimeType: "application/pdf",
    });
    expect(empty.valid).toBe(false);

    const wrongExt = validatePdfBuffer({
      buffer: Buffer.from("%PDF-1.7"),
      filename: "notes.docx",
      mimeType: "application/pdf",
    });
    expect(wrongExt.valid).toBe(false);
  });
});
