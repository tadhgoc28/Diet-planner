import type { MealSlot, MealType } from "@/lib/tags";

/** Minimal recipe fields the planner cards need. */
export type PlannerRecipeDTO = {
  id: string;
  title: string;
  imageUrl: string | null;
  cuisine: string | null;
  mealTypes: MealType[];
};

export type PlannerEntryDTO = {
  id: string;
  date: string; // YYYY-MM-DD
  mealSlot: MealSlot;
  recipe: PlannerRecipeDTO;
};

/** What's stored in the browser for a planned meal. */
export type StoredPlannerEntry = {
  id: string;
  recipeId: string;
  date: string; // YYYY-MM-DD
  mealSlot: MealSlot;
};

/** Key a slot uniquely within a week grid / dnd context. */
export function slotId(dateKey: string, mealSlot: string): string {
  return `slot:${dateKey}:${mealSlot}`;
}

export function parseSlotId(
  id: string,
): { dateKey: string; mealSlot: string } | null {
  const m = /^slot:(\d{4}-\d{2}-\d{2}):(breakfast|lunch|dinner)$/.exec(id);
  return m ? { dateKey: m[1], mealSlot: m[2] } : null;
}

export const RECIPE_DRAG_PREFIX = "recipe:";
