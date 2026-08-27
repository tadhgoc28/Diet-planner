import type { Recipe, Ingredient, InstructionStep } from "@prisma/client";
import { parseStringArray, type MealType } from "@/lib/tags";

/** API shapes returned to the client. */
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

export type RecipeSummaryDTO = {
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
  ingredientCount: number;
  updatedAt: string;
};

export type RecipeDTO = Omit<RecipeSummaryDTO, "ingredientCount"> & {
  createdAt: string;
  ingredients: IngredientDTO[];
  steps: StepDTO[];
};

type RecipeWithRelations = Recipe & {
  ingredients: Ingredient[];
  steps: InstructionStep[];
  _count?: { ingredients: number };
};

export function serializeRecipe(r: RecipeWithRelations): RecipeDTO {
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
    mealTypes: parseStringArray(r.mealTypes) as MealType[],
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    ingredients: [...r.ingredients]
      .sort((a, b) => a.order - b.order)
      .map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        order: i.order,
      })),
    steps: [...r.steps]
      .sort((a, b) => a.stepNumber - b.stepNumber)
      .map((s) => ({ id: s.id, stepNumber: s.stepNumber, text: s.text })),
  };
}

export function serializeRecipeSummary(
  r: Recipe & { _count: { ingredients: number } },
): RecipeSummaryDTO {
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
    mealTypes: parseStringArray(r.mealTypes) as MealType[],
    ingredientCount: r._count.ingredients,
    updatedAt: r.updatedAt.toISOString(),
  };
}
