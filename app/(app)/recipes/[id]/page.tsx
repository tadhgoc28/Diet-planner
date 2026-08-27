"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { swrFetcher } from "@/lib/swr";
import { RecipeDetailView } from "@/components/recipes/RecipeDetailView";
import { RecipeMissing, RecipeLoading } from "@/components/recipes/RecipeStates";
import type { RecipeDTO } from "@/lib/recipe";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, isLoading } = useSWR<{ recipe: RecipeDTO }>(
    id ? `/api/recipes/${id}` : null,
    swrFetcher,
  );

  if (isLoading) return <RecipeLoading />;
  if (error || !data?.recipe) return <RecipeMissing />;
  return <RecipeDetailView recipe={data.recipe} />;
}
