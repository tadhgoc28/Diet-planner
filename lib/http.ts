import "server-only";

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { UnauthorizedError } from "@/lib/auth";
import { fieldErrors } from "@/lib/validation";

/**
 * Standard error envelope for Route Handlers:
 *   { error: string, fieldErrors?: Record<string, string> }
 * Clients (see lib/api.ts) unpack this into ApiError.
 */
export function errorResponse(
  message: string,
  status: number,
  fields?: Record<string, string>,
) {
  return NextResponse.json(
    fields ? { error: message, fieldErrors: fields } : { error: message },
    { status },
  );
}

/**
 * Map thrown errors to responses. Keeps every handler's catch block a one-liner.
 */
export function handleRouteError(err: unknown) {
  if (err instanceof UnauthorizedError) {
    return errorResponse("You need to sign in to do that.", 401);
  }
  if (err instanceof ZodError) {
    return errorResponse("Please fix the highlighted fields.", 422, fieldErrors(err));
  }
  console.error("Unhandled route error:", err);
  return errorResponse("Something went wrong. Please try again.", 500);
}
