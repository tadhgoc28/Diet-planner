import type { MealType } from "@/lib/tags";

/**
 * Recipe shapes used across the app. These are also exactly what's stored in
 * the browser (lib/localdb.ts) — no server serialization step any more.
 */
export type IngredientDTO = {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  order: number;
};

export type StepDTO = {
  id: string;
  stepNumber: number;
  text: string;
};

export type RecipeDTO = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  cuisine: string | null;
  diet: string | null;
  mealTypes: MealType[];
  createdAt: string;
  updatedAt: string;
  ingredients: IngredientDTO[];
  steps: StepDTO[];
};

export type RecipeSummaryDTO = Omit<
  RecipeDTO,
  "ingredients" | "steps" | "createdAt"
> & {
  ingredientCount: number;
};

export function toSummary(r: RecipeDTO): RecipeSummaryDTO {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    imageUrl: r.imageUrl,
    prepTimeMinutes: r.prepTimeMinutes,
    cookTimeMinutes: r.cookTimeMinutes,
    servings: r.servings,
    cuisine: r.cuisine,
    diet: r.diet,
    mealTypes: r.mealTypes,
    ingredientCount: r.ingredients.length,
    updatedAt: r.updatedAt,
  };
}
