import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getPublicEnv, getServerEnv, isSupabaseAdminConfigured } from "@/lib/env";

export function createAdminSupabaseClient() {
  if (!isSupabaseAdminConfigured()) {
    return null;
  }

  const pub = getPublicEnv();
  const srv = getServerEnv();

  if (!pub.NEXT_PUBLIC_SUPABASE_URL || !srv.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient<Database>(
    pub.NEXT_PUBLIC_SUPABASE_URL,
    srv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
