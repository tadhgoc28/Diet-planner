/**
 * Client-side fetch helper. Throws ApiError (carrying any per-field messages)
 * on non-2xx responses so forms can show inline errors and toasts.
 */

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export async function apiFetch<T = unknown>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError("Network error — check your connection and try again.", 0);
  }

  const isJson = res.headers
    .get("content-type")
    ?.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError(
      body?.error ?? `Request failed (${res.status})`,
      res.status,
      body?.fieldErrors,
    );
  }

  return body as T;
}

/** Convenience wrapper for JSON POST/PATCH/DELETE bodies. */
export function apiSend<T = unknown>(
  input: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown,
): Promise<T> {
  return apiFetch<T>(input, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
