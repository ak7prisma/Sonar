"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { loginSchema, registerSchema } from "@/lib/validation/schemas";

export interface AuthActionResult {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
}

export async function loginAction(input: {
  email: string;
  password: string;
  redirectTo?: string;
}): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: "Periksa kembali data yang dimasukkan.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (error) {
        return { error: error.message };
      }

      const safeRedirect =
        input.redirectTo && input.redirectTo.startsWith("/")
          ? input.redirectTo
          : "/dashboard";
      redirect(safeRedirect);
    }
  }

  // Graceful fallback for local development: set default student session
  const cookieStore = await cookies();
  cookieStore.set("sonar_role", "student", { path: "/", httpOnly: true, sameSite: "lax" });
  const safeRedirect =
    input.redirectTo && input.redirectTo.startsWith("/")
      ? input.redirectTo
      : "/dashboard";
  redirect(safeRedirect);
}

export async function loginAsDemoRole(role: "student" | "volunteer" | "admin", redirectTo?: string) {
  const cookieStore = await cookies();
  cookieStore.set("sonar_role", role, { path: "/", httpOnly: true, sameSite: "lax" });
  
  let target = "/dashboard";
  if (redirectTo && redirectTo.startsWith("/")) {
    target = redirectTo;
  } else if (role === "volunteer") {
    target = "/review";
  } else if (role === "admin") {
    target = "/admin";
  }

  redirect(target);
}

export async function registerAction(input: {
  email: string;
  password: string;
  fullName: string;
  studyProgram?: string;
}): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: "Periksa kembali data yang dimasukkan.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: {
            full_name: parsed.data.fullName,
            study_program: parsed.data.studyProgram ?? null,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.session) {
        redirect("/dashboard");
      }

      return {
        message:
          "Pendaftaran berhasil dikirim. Silakan periksa inbox email Anda untuk verifikasi.",
      };
    }
  }

  const cookieStore = await cookies();
  cookieStore.set("sonar_role", "student", { path: "/", httpOnly: true, sameSite: "lax" });
  redirect("/dashboard");
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("sonar_role");
  
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    await supabase?.auth.signOut();
  }
  redirect("/login");
}
