"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { swrFetcher } from "@/lib/swr";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Field";
import { RecipeCard } from "./RecipeCard";
import { CUISINES, DIETS, MEAL_TYPES } from "@/lib/tags";
import type { RecipeSummaryDTO } from "@/lib/recipe";

type Resp = { recipes: RecipeSummaryDTO[] };

export function RecipeListView() {
  const { data, error, isLoading } = useSWR<Resp>("/api/recipes", swrFetcher);

  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [diet, setDiet] = useState("");
  const [meal, setMeal] = useState("");

  const recipes = useMemo(() => data?.recipes ?? [], [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes.filter((r) => {
      if (q && !`${r.title} ${r.description}`.toLowerCase().includes(q))
        return false;
      if (cuisine && r.cuisine !== cuisine) return false;
      if (diet && r.diet !== diet) return false;
      if (meal && !r.mealTypes.includes(meal as (typeof MEAL_TYPES)[number]))
        return false;
      return true;
    });
  }, [recipes, query, cuisine, diet, meal]);

  const hasFilters = Boolean(query || cuisine || diet || meal);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl text-ink">Recipes</h1>
          <p className="text-sm text-ink-soft">
            {isLoading
              ? "Loading your cookbook…"
              : `${recipes.length} ${recipes.length === 1 ? "recipe" : "recipes"}`}
          </p>
        </div>
        <Button href="/recipes/new">+ New recipe</Button>
      </div>

      {/* Filters */}
      {!isLoading && recipes.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-ink placeholder:text-ink-soft/60 shadow-sm focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta-soft"
          />
          <Select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
            <option value="">Any cuisine</option>
            {CUISINES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select value={diet} onChange={(e) => setDiet(e.target.value)}>
            <option value="">Any diet</option>
            {DIETS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
          <Select value={meal} onChange={(e) => setMeal(e.target.value)}>
            <option value="">Any meal</option>
            {MEAL_TYPES.map((m) => (
              <option key={m} value={m} className="capitalize">
                {m[0].toUpperCase() + m.slice(1)}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* States */}
      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] w-full" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      )}

      {error && !isLoading && (
        <EmptyState
          icon="⚠️"
          title="Couldn't load your recipes"
          description="Please refresh the page to try again."
        />
      )}

      {!isLoading && !error && recipes.length === 0 && (
        <EmptyState
          icon="📖"
          title="Your cookbook is empty"
          description="Add your first recipe and it'll show up here, ready to plan into your week."
          action={<Button href="/recipes/new">Add your first recipe</Button>}
        />
      )}

      {!isLoading && !error && recipes.length > 0 && filtered.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No recipes match those filters"
          description={hasFilters ? "Try clearing the search or filters." : undefined}
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setCuisine("");
                setDiet("");
                setMeal("");
              }}
            >
              Clear filters
            </Button>
          }
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      )}
    </div>
  );
}
