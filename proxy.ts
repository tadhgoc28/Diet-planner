import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Route-protection *UX* only. This does a cheap cookie-presence check to bounce
 * users between the auth pages and the app. It is NOT the security boundary —
 * every Route Handler and the (app) layout independently verify the session
 * with getCurrentUser().
 *
 * (In Next.js 16 the `middleware` file convention was renamed to `proxy`.)
 */

const PROTECTED = ["/recipes", "/planner", "/shopping-list"];
const AUTH_PAGES = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p);

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/recipes";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/recipes/:path*", "/planner/:path*", "/shopping-list/:path*", "/login", "/signup"],
};
