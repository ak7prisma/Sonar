"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedContext } from "@/lib/supabase/auth-helpers";

export async function toggleCourseEnrollmentAction(courseId: string): Promise<{
  success: boolean;
  enrolled?: boolean;
  message?: string;
  error?: string;
}> {
  const { supabase, auth } = await getAuthenticatedContext();

  if (!supabase || !auth) {
    return {
      success: false,
      error: "Silakan masuk (login) terlebih dahulu untuk bergabung ke mata kuliah.",
    };
  }

  // Check existing membership in course_members table
  const { data: existing } = await supabase
    .from("course_members")
    .select("id")
    .eq("course_id", courseId)
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (existing) {
    // Unenroll
    const { error } = await supabase
      .from("course_members")
      .delete()
      .eq("id", existing.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/courses");
    revalidatePath(`/courses/${courseId}`);
    return {
      success: true,
      enrolled: false,
      message: "Anda telah membatalkan keikutsertaan dari mata kuliah ini.",
    };
  }

  // Enroll
  const role = auth.roles.includes("admin")
    ? "instructor"
    : auth.roles.includes("reviewer")
    ? "reviewer"
    : "student";

  const { error } = await supabase.from("course_members").insert({
    course_id: courseId,
    user_id: auth.userId,
    member_role: role,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
  return {
    success: true,
    enrolled: true,
    message: "Berhasil terdaftar ke mata kuliah di Supabase!",
  };
}
