import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOwnedRecipeDTO } from "@/lib/recipe-server";
import { RecipeForm } from "@/components/recipes/RecipeForm";

export const metadata: Metadata = { title: "Edit recipe · MealBoard" };

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getOwnedRecipeDTO(id);
  if (!recipe) notFound();

  return <RecipeForm recipe={recipe} />;
}
