import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const role = url.searchParams.get("role");

  if (role !== "student" && role !== "volunteer" && role !== "admin") {
    return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set("sonar_role", role, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  const target =
    role === "admin"
      ? "/admin"
      : role === "volunteer"
      ? "/dashboard"
      : "/dashboard";

  return NextResponse.redirect(new URL(target, req.url));
}
