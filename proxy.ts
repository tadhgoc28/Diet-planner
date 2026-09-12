/**
 * Session refresh on every request.
 *
 * Supabase access tokens are short lived. Without something refreshing them,
 * a signed in user silently becomes signed out after an hour. This runs before
 * every page render, hands the current cookies to Supabase, and writes any
 * rotated tokens back onto the response.
 *
 * Next 16 renamed Middleware to Proxy. The file is proxy.ts at the project root
 * and the export is `proxy`; the Supabase guides still say middleware.ts, which
 * this version does not read. The behaviour is otherwise identical.
 *
 * Credentials are read straight from process.env here rather than imported from
 * lib/supabase/env. Proxy is deployed separately from the render code and the
 * docs warn against leaning on shared modules from it.
 *
 * Note what this deliberately does NOT do: it never redirects based on auth.
 * MealBoard works signed out, so there is no protected area to bounce people
 * out of, and the authorization checks live next to the data instead.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  // No credentials means local only mode. Nothing to refresh.
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        // Rebuild the response so the rewritten request cookies are carried
        // through to the render, then mirror them onto the outgoing response
        // so the browser stores the rotated tokens.
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // The call itself is the point: it triggers the refresh and the setAll above.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets. Without this, auth cookie handling runs
     * for every CSS file, script and image, which is wasted work and can stop
     * assets loading.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
