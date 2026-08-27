import { z } from "zod";
import { CUISINES, DIETS, MEAL_SLOTS, MEAL_TYPES } from "@/lib/tags";
import { isDateKey } from "@/lib/week";

/**
 * Shared input schemas. Forms validate against these for inline errors, and the
 * in-browser data router (lib/api.ts) validates again before writing.
 */

/* ------------------------------------------------------------------ recipes */

/** "" or a valid member of `values`, normalized to string | null. */
const optionalChoice = (values: readonly string[]) =>
  z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || values.includes(v), "Not a valid option");

export const ingredientInputSchema = z.object({
  name: z.string().trim().min(1, "Add a name").max(120),
  quantity: z
    .number()
    .positive("Must be greater than 0")
    .max(1_000_000)
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  unit: z
    .string()
    .trim()
    .max(30)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
});

export const stepInputSchema = z.object({
  text: z.string().trim().min(1, "Write the step").max(2000),
});

export const recipeInputSchema = z.object({
  title: z.string().trim().min(1, "Give your recipe a title").max(160),
  description: z.string().trim().max(2000).optional().default(""),
  imageUrl: z
    .union([z.literal(""), z.url("Enter a valid image URL")])
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  prepTimeMinutes: z.number().int().min(0).max(100_000),
  cookTimeMinutes: z.number().int().min(0).max(100_000),
  servings: z.number().int().min(1, "At least 1 serving").max(100),
  cuisine: optionalChoice(CUISINES),
  diet: optionalChoice(DIETS),
  mealTypes: z.array(z.enum(MEAL_TYPES)).max(4).optional().default([]),
  ingredients: z
    .array(ingredientInputSchema)
    .min(1, "Add at least one ingredient")
    .max(100),
  steps: z.array(stepInputSchema).min(1, "Add at least one step").max(60),
});
export type RecipeInput = z.infer<typeof recipeInputSchema>;

/* ------------------------------------------------------------------ planner */

export const dateKeySchema = z
  .string()
  .refine(isDateKey, "Expected a YYYY-MM-DD date");

export const plannerEntryInputSchema = z.object({
  recipeId: z.string().min(1, "Pick a recipe"),
  date: dateKeySchema,
  mealSlot: z.enum(MEAL_SLOTS),
});
export type PlannerEntryInput = z.infer<typeof plannerEntryInputSchema>;

/* ------------------------------------------------------------ shopping list */

export const shoppingItemPatchSchema = z.object({
  checked: z.boolean(),
});

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
