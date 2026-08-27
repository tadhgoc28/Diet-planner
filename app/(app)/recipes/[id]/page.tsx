import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOwnedRecipeDTO } from "@/lib/recipe-server";
import { RecipeDetailView } from "@/components/recipes/RecipeDetailView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getOwnedRecipeDTO(id);
  return { title: recipe ? `${recipe.title} · MealBoard` : "Recipe · MealBoard" };
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getOwnedRecipeDTO(id);
  if (!recipe) notFound();

  return <RecipeDetailView recipe={recipe} />;
}
