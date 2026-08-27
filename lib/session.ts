/**
 * Session cookie configuration, shared by the auth route handlers (which set /
 * clear it) and lib/auth.ts (which reads it).
 */
export const SESSION_COOKIE = "mealboard_session";

// 7 days, in seconds.
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
