/**
 * The server Supabase client, plus the one function the rest of the app should
 * use to ask "who is this?".
 *
 * Created per request, never cached across requests: the client carries the
 * caller's cookies, so a shared instance would hand one user another user's
 * session.
 */
import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot set cookies. That is fine: proxy.ts has
          // already refreshed the session on this request and written the new
          // cookies onto the response. Swallowing this is the documented
          // pattern, not a workaround.
        }
      },
    },
  });
}

/**
 * The signed in user, or null.
 *
 * Uses getUser() rather than getSession(). getSession() reads the cookie and
 * trusts it; getUser() verifies the token with the auth server. Anything that
 * decides what data to hand back must use the verified one.
 *
 * Wrapped in React's cache() so a layout, a page and three server actions in
 * the same request share a single round trip instead of making five.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
});

/**
 * For server actions that must not run anonymously. Throws rather than
 * redirecting so the caller decides what the user sees.
 *
 * Server functions are reachable by direct POST, not only through your own UI,
 * so every mutation calls this before touching a table. Row level security is
 * the second line of defence, not the only one.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("You need to be signed in to do that.");
  return user;
}
