"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import { DraggableRecipeChip } from "./DraggableRecipeChip";
import type { RecipeSummaryDTO } from "@/lib/recipe";

export function RecipePicker({
  recipes,
  isLoading,
}: {
  recipes: RecipeSummaryDTO[];
  isLoading: boolean;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter((r) => r.title.toLowerCase().includes(q));
  }, [recipes, query]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-ink">Your recipes</h2>
        <p className="text-xs text-ink-soft">
          Drag onto a slot, or use “+ add meal”.
        </p>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search recipes…"
        className="mb-3 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm placeholder:text-ink-soft/60 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta-soft"
      />

      <div className="scrollbar-slim -mr-1 flex-1 space-y-2 overflow-y-auto pr-1">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}

        {!isLoading && recipes.length === 0 && (
          <p className="rounded-xl border border-dashed border-line p-3 text-xs text-ink-soft">
            No recipes yet.{" "}
            <Link href="/recipes/new" className="text-terracotta-dark underline">
              Add one
            </Link>{" "}
            to start planning.
          </p>
        )}

        {!isLoading && recipes.length > 0 && filtered.length === 0 && (
          <p className="p-3 text-xs text-ink-soft">No matches.</p>
        )}

        {filtered.map((r) => (
          <DraggableRecipeChip key={r.id} recipe={r} />
        ))}
      </div>
    </div>
  );
}
