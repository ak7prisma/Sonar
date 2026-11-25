import "server-only";

import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { AppRole } from "@/types/database";

export interface AuthenticatedContext {
  userId: string;
  email: string;
  fullName: string | null;
  roles: AppRole[];
}

export const getAuthenticatedContext = cache(async function getAuthenticatedContext(): Promise<{
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>> | null;
  auth: AuthenticatedContext | null;
}> {
  if (!isSupabaseConfigured()) {
    return { supabase: null, auth: null };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { supabase: null, auth: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, auth: null };
  }

  const [{ data: profile }, { data: rolesRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id),
  ]);

  const roles: AppRole[] =
    rolesRows && rolesRows.length > 0
      ? rolesRows.map((row) => row.role)
      : ["student"];

  return {
    supabase,
    auth: {
      userId: user.id,
      email: profile?.email ?? user.email ?? "",
      fullName:
        profile?.full_name ??
        (user.user_metadata?.full_name as string) ??
        (user.user_metadata?.name as string) ??
        null,
      roles,
    },
  };
});

export function hasAnyRole(roles: AppRole[], required: AppRole[]): boolean {
  return required.some((r) => roles.includes(r));
}
