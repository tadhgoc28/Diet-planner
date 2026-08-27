/**
 * Controlled vocabularies for recipe tags plus helpers for the JSON-string
 * columns SQLite forces on us (Recipe.mealTypes, ShoppingListItem.sourceRecipeIds).
 */

export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

// Planner slots are the subset of meal types a day is divided into.
export const MEAL_SLOTS = ["breakfast", "lunch", "dinner"] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

export const CUISINES = [
  "American",
  "British",
  "Chinese",
  "French",
  "Greek",
  "Indian",
  "Italian",
  "Japanese",
  "Mexican",
  "Middle Eastern",
  "Thai",
  "Other",
] as const;
export type Cuisine = (typeof CUISINES)[number];

export const DIETS = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Gluten-free",
  "Dairy-free",
  "Low-carb",
  "High-protein",
] as const;
export type Diet = (typeof DIETS)[number];

/** Parse a JSON-string array column into a string[]; tolerant of bad data. */
export function parseStringArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

/** Serialize a string[] for storage in a JSON-string column. */
export function serializeStringArray(values: string[]): string {
  return JSON.stringify([...new Set(values)]);
}

export function isMealType(value: string): value is MealType {
  return (MEAL_TYPES as readonly string[]).includes(value);
}

export function isMealSlot(value: string): value is MealSlot {
  return (MEAL_SLOTS as readonly string[]).includes(value);
}

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};
