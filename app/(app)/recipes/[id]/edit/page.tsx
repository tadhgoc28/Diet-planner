"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { swrFetcher } from "@/lib/swr";
import { useDocumentTitle } from "@/lib/use-document-title";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { RecipeMissing, RecipeLoading } from "@/components/recipes/RecipeStates";
import type { RecipeDTO } from "@/lib/recipe";

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, isLoading } = useSWR<{ recipe: RecipeDTO }>(
    id ? `/api/recipes/${id}` : null,
    swrFetcher,
  );

  useDocumentTitle(
    data?.recipe ? `Edit ${data.recipe.title} · MealBoard` : null,
  );

  if (isLoading) return <RecipeLoading />;
  if (error || !data?.recipe) return <RecipeMissing />;
  return <RecipeForm recipe={data.recipe} />;
}
