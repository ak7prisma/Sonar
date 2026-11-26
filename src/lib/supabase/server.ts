import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getPublicEnv, getSupabasePublicKey, isSupabaseConfigured } from "@/lib/env";

export async function createServerSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const env = getPublicEnv();
  const key = getSupabasePublicKey();

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !key) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot mutate cookies during render; proxy.ts handles token refresh.
        }
      },
    },
  });
}
