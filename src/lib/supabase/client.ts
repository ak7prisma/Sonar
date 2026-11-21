import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getPublicEnv, getSupabasePublicKey, isSupabaseConfigured } from "@/lib/env";

export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const env = getPublicEnv();
  const key = getSupabasePublicKey();

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !key) {
    return null;
  }

  return createBrowserClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, key);
}
