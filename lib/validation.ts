import { z } from "zod";

/**
 * Shared request-body schemas. Used by Route Handlers to validate input and by
 * client forms to surface inline errors before submitting.
 */

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(80),
  email: z.email("Enter a valid email address").max(200),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(200, "Password is too long"),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.email("Enter a valid email address").max(200),
  password: z.string().min(1, "Enter your password").max(200),
});
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Flatten a ZodError into { field: message } for the first error per field,
 * matching the shape our forms consume.
 */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
