"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { RECIPE_DRAG_PREFIX } from "@/lib/planner";
import type { RecipeSummaryDTO } from "@/lib/recipe";

export function DraggableRecipeChip({ recipe }: { recipe: RecipeSummaryDTO }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `${RECIPE_DRAG_PREFIX}${recipe.id}`,
      data: { type: "recipe", recipeId: recipe.id, title: recipe.title },
    });

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
      }}
      className="w-full cursor-grab touch-none rounded-xl border border-line bg-surface px-3 py-2 text-left text-sm shadow-sm transition-colors hover:border-terracotta active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <span className="line-clamp-1 font-medium text-ink">{recipe.title}</span>
      <span className="mt-0.5 line-clamp-1 text-xs text-ink-soft">
        {[recipe.cuisine, ...recipe.mealTypes].filter(Boolean).join(" · ") ||
          "Untagged"}
      </span>
    </button>
  );
}
