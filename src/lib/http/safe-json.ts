/**
 * Batas aman body request fungsi serverless Vercel (batas keras 4,5 MB).
 * Berkas di atas 3,8 MB akan diunggah langsung ke Supabase Storage dari browser
 * terlebih dahulu agar tidak terpotong oleh batas payload Vercel.
 */
export const SERVERLESS_UPLOAD_LIMIT_BYTES = Math.floor(3.8 * 1024 * 1024);

/**
 * Membaca body respons sebagai JSON tanpa melempar error ketika body kosong
 * atau bukan JSON (misalnya halaman error 413/504 dari platform hosting).
 */
export async function readJsonSafely<T>(response: Response): Promise<T | null> {
  try {
    const raw = await response.text();
    if (!raw.trim()) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Pesan Bahasa Indonesia yang mudah dipahami untuk status HTTP gagal. */
export function describeHttpFailure(status: number, action: string): string {
  if (status === 413) {
    return `Ukuran berkas terlalu besar untuk ${action} langsung di server (maks. ±4 MB tanpa sesi akun). Masuk ke akun Anda atau kompres PDF lalu coba lagi.`;
  }
  if (status === 504 || status === 408) {
    return `Proses ${action} melebihi batas waktu server. Coba PDF dengan halaman lebih sedikit atau ulangi beberapa saat lagi.`;
  }
  if (status === 429) {
    return `Terlalu banyak permintaan ${action}. Tunggu sekitar 1 menit lalu coba lagi.`;
  }
  if (status === 401 || status === 403) {
    return `Sesi Anda tidak valid untuk ${action}. Silakan masuk kembali.`;
  }
  return `Gagal melakukan ${action} (HTTP ${status}). Periksa koneksi internet atau coba lagi.`;
}
