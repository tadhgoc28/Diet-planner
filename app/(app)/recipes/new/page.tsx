import type { Metadata } from "next";
import { RecipeForm } from "@/components/recipes/RecipeForm";

export const metadata: Metadata = { title: "New recipe · MealBoard" };

export default function NewRecipePage() {
  return <RecipeForm />;
}
