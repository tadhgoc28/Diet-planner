import { categorize, type ShoppingCategory } from "@/lib/categorize";

/** One ingredient line pulled from a planned recipe. */
export type SourceIngredient = {
  name: string;
  quantity: number | null;
  unit: string | null;
  recipeId: string;
};

export type AggregatedItem = {
  ingredientName: string;
  quantity: number | null;
  unit: string | null;
  category: ShoppingCategory;
  sourceRecipeIds: string[];
};

const norm = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");

/** Conservative singularizer so "eggs"/"egg" and "tomatoes"/"tomato" merge. */
function singularize(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("oes")) return word.slice(0, -2);
  if (word.endsWith("ses") || word.endsWith("shes") || word.endsWith("ches"))
    return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function keyFor(name: string, unit: string | null): string {
  const n = norm(name).split(" ").map(singularize).join(" ");
  const u = norm(unit ?? "");
  return `${n}|${u}`;
}

/**
 * Combine ingredients from every planned recipe:
 *  - same name + same unit → one line, quantities summed
 *  - same name, different units → kept as separate lines (no unit conversion)
 *  - a missing quantity contributes nothing to the sum; if every contribution
 *    for a line is missing, the line has no quantity ("to taste" style)
 * Contributing recipe ids are tracked on each line.
 */
export function aggregateIngredients(
  sources: SourceIngredient[],
): AggregatedItem[] {
  const groups = new Map<
    string,
    {
      displayName: string;
      unit: string | null;
      quantity: number | null;
      hasNumber: boolean;
      recipeIds: Set<string>;
    }
  >();

  for (const src of sources) {
    if (!src.name || !src.name.trim()) continue;
    const key = keyFor(src.name, src.unit);
    let g = groups.get(key);
    if (!g) {
      g = {
        displayName: src.name.trim(),
        unit: src.unit?.trim() || null,
        quantity: null,
        hasNumber: false,
        recipeIds: new Set(),
      };
      groups.set(key, g);
    }
    g.recipeIds.add(src.recipeId);
    if (typeof src.quantity === "number" && Number.isFinite(src.quantity)) {
      g.quantity = (g.quantity ?? 0) + src.quantity;
      g.hasNumber = true;
    }
  }

  return [...groups.values()]
    .map((g) => ({
      ingredientName: g.displayName,
      quantity: g.hasNumber ? Math.round((g.quantity ?? 0) * 100) / 100 : null,
      unit: g.unit,
      category: categorize(g.displayName),
      sourceRecipeIds: [...g.recipeIds],
    }))
    .sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));
}
