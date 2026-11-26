import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Rute unggah & pemrosesan AI dikecualikan agar body tidak di-buffer/terpotong oleh proxy;
    // rute tersebut sudah memverifikasi sesi sendiri via getAuthenticatedContext().
    "/((?!_next/static|_next/image|favicon.ico|brand/.*|api/ocr/scan|api/documents/upload|api/documents/translate|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
