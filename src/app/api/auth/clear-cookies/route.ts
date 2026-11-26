import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  allCookies.forEach((cookie) => {
    cookieStore.delete(cookie.name);
  });

  const requestUrl = new URL(request.url);
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
