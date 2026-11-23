export function mapAuthErrorMessage(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Email atau kata sandi tidak sesuai. Silakan periksa kembali.";
  }
  if (lower.includes("email not confirmed")) {
    return "Alamat email belum diverifikasi. Silakan periksa inbox email Anda untuk verifikasi.";
  }
  if (lower.includes("already registered") || lower.includes("user already exists")) {
    return "Alamat email ini sudah terdaftar. Silakan masuk atau gunakan email lain.";
  }
  if (lower.includes("password should be at least")) {
    return "Kata sandi minimal 8 karakter.";
  }
  if (lower.includes("not enabled") || lower.includes("unsupported provider")) {
    return "Provider login Google belum diaktifkan di dashboard Supabase (Authentication -> Providers).";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Terlalu banyak percobaan. Harap tunggu beberapa saat sebelum mencoba lagi.";
  }
  if (lower.includes("network") || lower.includes("fetch failed")) {
    return "Gagal terhubung ke server autentikasi. Periksa koneksi internet Anda.";
  }
  return msg;
}
