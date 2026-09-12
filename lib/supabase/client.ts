/**
 * The browser Supabase client.
 *
 * Client components use this for auth only: sign in, sign up, sign out and the
 * Google redirect. Reads and writes go through server components and server
 * actions instead, so data access stays on the server where it can be checked.
 *
 * Cached in a module level variable because every call to createBrowserClient
 * spins up another auth listener, and more than one of those in a page produces
 * duplicate token refreshes.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

let cached: SupabaseClient | null = null;

/** Null when the project has no credentials. Callers fall back to local mode. */
export function getBrowserSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!cached) {
    cached = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return cached;
}
