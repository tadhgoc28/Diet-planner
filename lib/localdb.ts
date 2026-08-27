/**
 * The whole "database" — a single JSON blob in the browser's localStorage.
 * There is no server: recipes, planner entries and shopping-list items all
 * live here, per browser. lib/api.ts reads and writes through these helpers.
 */
import type { RecipeDTO } from "@/lib/recipe";
import type { StoredPlannerEntry } from "@/lib/planner";
import type { StoredShoppingItem } from "@/lib/shopping";
import type { MealType } from "@/lib/tags";
import { SEED_RECIPES } from "@/lib/seed-recipes";

export const STORAGE_KEY = "mealboard.v1";

export type LocalDB = {
  v: 1;
  recipes: RecipeDTO[];
  planner: StoredPlannerEntry[];
  shopping: StoredShoppingItem[];
};

function emptyDB(): LocalDB {
  return { v: 1, recipes: [], planner: [], shopping: [] };
}

export function newId(): string {
  // crypto.randomUUID is available in every browser we target and in Node 19+.
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Build the starter dataset (6 sample recipes, nothing planned). */
export function seededDB(): LocalDB {
  const now = new Date().toISOString();
  const recipes: RecipeDTO[] = SEED_RECIPES.map((r) => ({
    id: newId(),
    title: r.title,
    description: r.description,
    imageUrl: r.imageUrl,
    prepTimeMinutes: r.prepTimeMinutes,
    cookTimeMinutes: r.cookTimeMinutes,
    servings: r.servings,
    cuisine: r.cuisine,
    diet: r.diet ?? null,
    mealTypes: r.mealTypes as MealType[],
    createdAt: now,
    updatedAt: now,
    ingredients: r.ingredients.map((ing, i) => ({
      id: newId(),
      name: ing.name,
      quantity: ing.quantity ?? null,
      unit: ing.unit ?? null,
      order: i,
    })),
    steps: r.steps.map((text, i) => ({
      id: newId(),
      stepNumber: i + 1,
      text,
    })),
  }));
  return { v: 1, recipes, planner: [], shopping: [] };
}

function coerce(parsed: unknown): LocalDB {
  if (!parsed || typeof parsed !== "object") return emptyDB();
  const db = parsed as Partial<LocalDB>;
  return {
    v: 1,
    recipes: Array.isArray(db.recipes) ? db.recipes : [],
    planner: Array.isArray(db.planner) ? db.planner : [],
    shopping: Array.isArray(db.shopping) ? db.shopping : [],
  };
}

/**
 * Read the DB. On the server (SSR/prerender) there's no localStorage, so we
 * return an empty DB — client components re-read after they mount.
 * On a browser with no saved data, seed and persist the samples.
 */
export function loadDB(): LocalDB {
  if (typeof window === "undefined") return emptyDB();
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return emptyDB();
  }
  if (!raw) {
    const seeded = seededDB();
    saveDB(seeded);
    return seeded;
  }
  try {
    return coerce(JSON.parse(raw));
  } catch {
    const seeded = seededDB();
    saveDB(seeded);
    return seeded;
  }
}

export function saveDB(db: LocalDB): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Quota or private-mode failure — nothing we can do; the in-memory result
    // of the current operation is still returned to the caller.
  }
}

/** Wipe stored data and reseed the samples. Used by the "reset" control. */
export function resetToSamples(): void {
  if (typeof window === "undefined") return;
  saveDB(seededDB());
}
