import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfigured } from "@/lib/supabase/config";
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;
  const protectedRoute =
    /^\/(dashboard|research|portfolio|alerts|settings)(\/|$)/.test(path);
  if (!supabaseConfigured()) {
    if (protectedRoute)
      return NextResponse.redirect(
        new URL(
          `/login?setup=required&next=${encodeURIComponent(path)}`,
          request.url,
        ),
      );
    return response;
  }
  const db = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          values.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  const { data, error } = await db.auth.getClaims();
  if (protectedRoute && (error || !data?.claims)) {
    const target = new URL(
      `/login?next=${encodeURIComponent(path + request.nextUrl.search)}`,
      request.url,
    );
    const redirect = NextResponse.redirect(target);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }
  if (protectedRoute)
    response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/research/:path*",
    "/portfolio/:path*",
    "/alerts/:path*",
    "/settings/:path*",
    "/login",
  ],
};
