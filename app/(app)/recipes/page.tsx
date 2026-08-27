import type { Metadata } from "next";
import { RecipeListView } from "@/components/recipes/RecipeListView";

export const metadata: Metadata = { title: "Recipes · MealBoard" };

export default function RecipesPage() {
  return <RecipeListView />;
}
