export type PdfValidationResult =
  | { ok: true }
  | { ok: false; message: string };

const MAX_PDF_BYTES = 25 * 1024 * 1024;
const ALLOWED_MIMES = new Set(["application/pdf", "application/x-pdf", ""]);

export async function validatePdfFile(file: File): Promise<PdfValidationResult> {
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return {
      ok: false,
      message: `Format berkas "${file.name}" tidak didukung. Hanya berkas dokumen PDF (.pdf) yang diperbolehkan.`,
    };
  }

  if (file.type && !ALLOWED_MIMES.has(file.type.toLowerCase())) {
    return {
      ok: false,
      message: `Tipe berkas (${file.type}) tidak valid. Hanya dokumen PDF (.pdf) yang diperbolehkan.`,
    };
  }

  if (file.size === 0) {
    return {
      ok: false,
      message:
        "Berkas yang dipilih kosong (0 byte). Harap pilih file PDF perkuliahan yang valid.",
    };
  }

  if (file.size > MAX_PDF_BYTES) {
    return {
      ok: false,
      message: "Ukuran file melebihi batas maksimal 25 MB.",
    };
  }

  try {
    const headerSlice = file.slice(0, 5);
    const buffer = await headerSlice.arrayBuffer();
    const header = new TextDecoder("ascii").decode(buffer);
    if (!header.startsWith("%PDF-")) {
      return {
        ok: false,
        message: `Berkas "${file.name}" bukan dokumen PDF asli yang valid (header %PDF- tidak ditemukan).`,
      };
    }
  } catch {
    // Abaikan apabila lingkungan runtime tidak mendukung pembacaan slice
  }

  return { ok: true };
}
