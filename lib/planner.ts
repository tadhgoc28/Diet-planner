import type { PlannerEntry, Recipe } from "@prisma/client";
import { parseStringArray, type MealSlot, type MealType } from "@/lib/tags";
import { utcToDateKey } from "@/lib/week";

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

export function serializePlannerEntry(
  entry: PlannerEntry & { recipe: Recipe },
): PlannerEntryDTO {
  return {
    id: entry.id,
    date: utcToDateKey(entry.date),
    mealSlot: entry.mealSlot as MealSlot,
    recipe: {
      id: entry.recipe.id,
      title: entry.recipe.title,
      imageUrl: entry.recipe.imageUrl,
      cuisine: entry.recipe.cuisine,
      mealTypes: parseStringArray(entry.recipe.mealTypes) as MealType[],
    },
  };
}

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
