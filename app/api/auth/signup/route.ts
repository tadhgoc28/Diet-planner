import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSessionToken } from "@/lib/auth";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { signupSchema } from "@/lib/validation";
import { errorResponse, handleRouteError } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    const parsed = signupSchema.safeParse(json);
    if (!parsed.success) {
      return handleRouteError(parsed.error);
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const passwordHash = await hashPassword(password);

    let user;
    try {
      user = await prisma.user.create({
        data: { name, email: normalizedEmail, passwordHash },
        select: { id: true, name: true, email: true },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        return errorResponse("Please fix the highlighted fields.", 422, {
          email: "An account with this email already exists",
        });
      }
      throw err;
    }

    const token = await signSessionToken(user.id);
    const res = NextResponse.json({ user }, { status: 201 });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  } catch (err) {
    return handleRouteError(err);
  }
}
