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

  // Robust multi-tier role resolution:
  // 1. Explicit rows in user_roles table
  // 2. User metadata saved during registration (raw_user_meta_data->role)
  // 3. App metadata or email heuristics (admin@sonar.ac.id, faculty.ac.id)
  const metaRole = (
    user.user_metadata?.role ||
    user.app_metadata?.role ||
    ""
  )
    .toString()
    .toLowerCase()
    .trim();

  const isExplicitAdmin =
    metaRole === "admin" ||
    user.email === "admin@sonar.ac.id" ||
    user.email === "hendra.gunawan@faculty.ac.id";

  const isExplicitVolunteer =
    !isExplicitAdmin &&
    (metaRole === "volunteer" ||
      metaRole === "reviewer" ||
      user.email === "volunteer@sonar.ac.id" ||
      user.email === "dewi.sartika@volunteer.sonar.ac.id");

  let roles: AppRole[];
  if (rolesRows && rolesRows.length > 0) {
    roles = rolesRows.map((row) => row.role as AppRole);
  } else if (isExplicitAdmin) {
    roles = ["admin"];
  } else if (isExplicitVolunteer) {
    roles = ["volunteer"];
  } else {
    roles = ["student"];
  }

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
