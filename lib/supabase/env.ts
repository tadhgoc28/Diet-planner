/**
 * Supabase credentials, read once and checked in one place.
 *
 * Both values are NEXT_PUBLIC on purpose. The browser has to hold them to run
 * the Google redirect and to refresh its own session, and they are safe there:
 * the anon key grants nothing on its own, every table is behind row level
 * security, and the anon role has been revoked from all five tables. The key
 * that must never appear in this project is the service role key, which
 * bypasses every policy. Nothing here needs it.
 *
 * The references below are written out in full rather than destructured from
 * `process.env`, because Next replaces the literal text `process.env.NEXT_PUBLIC_*`
 * at build time. A destructured copy would come back undefined in the browser.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * False when the project has no credentials, which is a supported state, not an
 * error: MealBoard still runs entirely in the browser for anyone without an
 * account, exactly as it did before. Every Supabase entry point checks this and
 * hands back null rather than throwing, and the callers fall back to localStorage.
 */
export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}
