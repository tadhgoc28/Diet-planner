import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSessionToken } from "@/lib/auth";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { loginSchema } from "@/lib/validation";
import { errorResponse, handleRouteError } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(json);
    if (!parsed.success) {
      return handleRouteError(parsed.error);
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Same message + a hash comparison either way, so we don't leak which
    // emails are registered or create a timing oracle.
    const ok = user
      ? await verifyPassword(password, user.passwordHash)
      : await verifyPassword(password, "$2a$10$invalidinvalidinvalidinvalidin.invalidinvalidinvalidinvalidi");

    if (!user || !ok) {
      return errorResponse("Incorrect email or password.", 401);
    }

    const token = await signSessionToken(user.id);
    const res = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  } catch (err) {
    return handleRouteError(err);
  }
}
