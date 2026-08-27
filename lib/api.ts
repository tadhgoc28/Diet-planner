/**
 * In-browser data router.
 *
 * The UI still "calls an API" the same way it always did — apiFetch("/api/…")
 * and apiSend("/api/…", "POST", body) — but there is no network and no server.
 * Every call is handled synchronously against localStorage (lib/localdb.ts).
 * Keeping this shape means the components and their SWR hooks didn't change
 * when the backend was removed.
 */
import { z } from "zod";
import { loadDB, saveDB, newId, type LocalDB } from "@/lib/localdb";
import {
  fieldErrors,
  recipeInputSchema,
  plannerEntryInputSchema,
  shoppingItemPatchSchema,
} from "@/lib/validation";
import {
  toSummary,
  type RecipeDTO,
  type IngredientDTO,
  type StepDTO,
} from "@/lib/recipe";
import type { PlannerEntryDTO } from "@/lib/planner";
import { itemIdentity, type StoredShoppingItem } from "@/lib/shopping";
import { aggregateIngredients, type SourceIngredient } from "@/lib/aggregate";
import { addDaysKey, isDateKey, startOfWeekKey } from "@/lib/week";
import type { MealType } from "@/lib/tags";

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export async function apiFetch<T = unknown>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  const method = ((init?.method ?? "GET").toUpperCase() as Method) ?? "GET";
  const url = new URL(input, "http://local");
  const body =
    typeof init?.body === "string" && init.body.length
      ? JSON.parse(init.body)
      : undefined;

  try {
    return route(method, url, body) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof z.ZodError) {
      throw new ApiError(
        "Please fix the highlighted fields.",
        422,
        fieldErrors(err),
      );
    }
    console.error("Local data error:", err);
    throw new ApiError("Something went wrong. Please try again.", 500);
  }
}

export function apiSend<T = unknown>(
  input: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown,
): Promise<T> {
  return apiFetch<T>(input, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

// --------------------------------------------------------------------------
// Routing
// --------------------------------------------------------------------------

function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError(
      "Please fix the highlighted fields.",
      422,
      fieldErrors(result.error),
    );
  }
  return result.data;
}

function route(method: Method, url: URL, body: unknown): unknown {
  const segments = url.pathname.replace(/^\/+|\/+$/g, "").split("/");
  // segments[0] === "api"
  const [, resource, a, b] = segments;

  if (resource === "recipes") {
    if (!a) {
      if (method === "GET") return listRecipes();
      if (method === "POST") return createRecipe(body);
    } else {
      if (method === "GET") return getRecipe(a);
      if (method === "PATCH") return updateRecipe(a, body);
      if (method === "DELETE") return deleteRecipe(a);
    }
  }

  if (resource === "planner") {
    if (!a) {
      if (method === "GET") return listPlanner(url.searchParams);
      if (method === "POST") return upsertPlanner(body);
    } else if (method === "DELETE") {
      return deletePlanner(a);
    }
  }

  if (resource === "shopping-list") {
    if (!a) {
      if (method === "GET") return listShopping(url.searchParams);
      if (method === "DELETE") return clearShopping(url.searchParams);
    } else if (a === "generate" && method === "POST") {
      return generateShopping(url.searchParams);
    } else if (b === undefined && method === "PATCH") {
      return patchShopping(a, body);
    }
  }

  throw new ApiError(`No route for ${method} ${url.pathname}`, 404);
}

// --------------------------------------------------------------------------
// Recipes
// --------------------------------------------------------------------------

function buildIngredients(
  input: { name: string; quantity: number | null; unit: string | null }[],
): IngredientDTO[] {
  return input.map((i, idx) => ({
    id: newId(),
    name: i.name,
    quantity: i.quantity ?? null,
    unit: i.unit ?? null,
    order: idx,
  }));
}

function buildSteps(input: { text: string }[]): StepDTO[] {
  return input.map((s, idx) => ({
    id: newId(),
    stepNumber: idx + 1,
    text: s.text,
  }));
}

function listRecipes() {
  const db = loadDB();
  const recipes = [...db.recipes]
    .sort((x, y) => y.updatedAt.localeCompare(x.updatedAt))
    .map(toSummary);
  return { recipes };
}

function getRecipe(id: string) {
  const db = loadDB();
  const recipe = db.recipes.find((r) => r.id === id);
  if (!recipe) throw new ApiError("Recipe not found.", 404);
  return { recipe };
}

function createRecipe(body: unknown) {
  const data = parse(recipeInputSchema, body);
  const db = loadDB();
  const now = new Date().toISOString();
  const recipe: RecipeDTO = {
    id: newId(),
    title: data.title,
    description: data.description ?? "",
    imageUrl: data.imageUrl ?? null,
    prepTimeMinutes: data.prepTimeMinutes,
    cookTimeMinutes: data.cookTimeMinutes,
    servings: data.servings,
    cuisine: data.cuisine ?? null,
    diet: data.diet ?? null,
    mealTypes: (data.mealTypes ?? []) as MealType[],
    createdAt: now,
    updatedAt: now,
    ingredients: buildIngredients(data.ingredients),
    steps: buildSteps(data.steps),
  };
  db.recipes.push(recipe);
  saveDB(db);
  return { recipe };
}

function updateRecipe(id: string, body: unknown) {
  const data = parse(recipeInputSchema, body);
  const db = loadDB();
  const existing = db.recipes.find((r) => r.id === id);
  if (!existing) throw new ApiError("Recipe not found.", 404);

  const updated: RecipeDTO = {
    ...existing,
    title: data.title,
    description: data.description ?? "",
    imageUrl: data.imageUrl ?? null,
    prepTimeMinutes: data.prepTimeMinutes,
    cookTimeMinutes: data.cookTimeMinutes,
    servings: data.servings,
    cuisine: data.cuisine ?? null,
    diet: data.diet ?? null,
    mealTypes: (data.mealTypes ?? []) as MealType[],
    updatedAt: new Date().toISOString(),
    ingredients: buildIngredients(data.ingredients),
    steps: buildSteps(data.steps),
  };
  db.recipes = db.recipes.map((r) => (r.id === id ? updated : r));
  saveDB(db);
  return { recipe: updated };
}

function deleteRecipe(id: string) {
  const db = loadDB();
  if (!db.recipes.some((r) => r.id === id)) {
    throw new ApiError("Recipe not found.", 404);
  }
  db.recipes = db.recipes.filter((r) => r.id !== id);
  // Cascade: drop any planned meals that referenced it.
  db.planner = db.planner.filter((e) => e.recipeId !== id);
  saveDB(db);
  return { ok: true };
}

// --------------------------------------------------------------------------
// Planner
// --------------------------------------------------------------------------

function requireWeekStart(params: URLSearchParams): string {
  const raw = params.get("weekStart");
  if (!raw || !isDateKey(raw)) {
    throw new ApiError("A valid weekStart date is required.", 400);
  }
  return startOfWeekKey(raw);
}

function plannerDTO(db: LocalDB, entryRecipeId: string): PlannerEntryDTO["recipe"] | null {
  const r = db.recipes.find((x) => x.id === entryRecipeId);
  if (!r) return null;
  return {
    id: r.id,
    title: r.title,
    imageUrl: r.imageUrl,
    cuisine: r.cuisine,
    mealTypes: r.mealTypes,
  };
}

function listPlanner(params: URLSearchParams) {
  const weekStart = requireWeekStart(params);
  const end = addDaysKey(weekStart, 7);
  const db = loadDB();
  const entries: PlannerEntryDTO[] = db.planner
    .filter((e) => e.date >= weekStart && e.date < end)
    .map((e) => {
      const recipe = plannerDTO(db, e.recipeId);
      return recipe
        ? { id: e.id, date: e.date, mealSlot: e.mealSlot, recipe }
        : null;
    })
    .filter((e): e is PlannerEntryDTO => e !== null)
    .sort((x, y) => x.date.localeCompare(y.date));
  return { weekStart, entries };
}

function upsertPlanner(body: unknown) {
  const { recipeId, date, mealSlot } = parse(plannerEntryInputSchema, body);
  const db = loadDB();
  if (!db.recipes.some((r) => r.id === recipeId)) {
    throw new ApiError("Recipe not found.", 404);
  }
  const existing = db.planner.find(
    (e) => e.date === date && e.mealSlot === mealSlot,
  );
  let entryId: string;
  if (existing) {
    existing.recipeId = recipeId;
    entryId = existing.id;
  } else {
    entryId = newId();
    db.planner.push({ id: entryId, recipeId, date, mealSlot });
  }
  saveDB(db);
  const recipe = plannerDTO(db, recipeId)!;
  return { entry: { id: entryId, date, mealSlot, recipe } };
}

function deletePlanner(id: string) {
  const db = loadDB();
  if (!db.planner.some((e) => e.id === id)) {
    throw new ApiError("Planned meal not found.", 404);
  }
  db.planner = db.planner.filter((e) => e.id !== id);
  saveDB(db);
  return { ok: true };
}

// --------------------------------------------------------------------------
// Shopping list
// --------------------------------------------------------------------------

function stripWeek(item: StoredShoppingItem) {
  const { weekStart: _weekStart, ...dto } = item;
  void _weekStart;
  return dto;
}

function sortItems(items: StoredShoppingItem[]) {
  return [...items].sort(
    (a, b) =>
      a.category.localeCompare(b.category) ||
      a.ingredientName.localeCompare(b.ingredientName),
  );
}

function listShopping(params: URLSearchParams) {
  const weekStart = requireWeekStart(params);
  const db = loadDB();
  const items = sortItems(
    db.shopping.filter((i) => i.weekStart === weekStart),
  ).map(stripWeek);
  return { weekStart, items };
}

function clearShopping(params: URLSearchParams) {
  const weekStart = requireWeekStart(params);
  const onlyChecked = params.get("onlyChecked") === "true";
  const db = loadDB();
  const before = db.shopping.length;
  db.shopping = db.shopping.filter((i) => {
    if (i.weekStart !== weekStart) return true;
    if (onlyChecked && !i.checked) return true;
    return false;
  });
  saveDB(db);
  return { deleted: before - db.shopping.length };
}

function patchShopping(id: string, body: unknown) {
  const { checked } = parse(shoppingItemPatchSchema, body);
  const db = loadDB();
  const item = db.shopping.find((i) => i.id === id);
  if (!item) throw new ApiError("Item not found.", 404);
  item.checked = checked;
  saveDB(db);
  return { id, checked };
}

function generateShopping(params: URLSearchParams) {
  const weekStart = requireWeekStart(params);
  const end = addDaysKey(weekStart, 7);
  const db = loadDB();

  const entries = db.planner.filter(
    (e) => e.date >= weekStart && e.date < end,
  );
  const recipeIds = new Set(entries.map((e) => e.recipeId));

  const sources: SourceIngredient[] = entries.flatMap((entry) => {
    const recipe = db.recipes.find((r) => r.id === entry.recipeId);
    if (!recipe) return [];
    return recipe.ingredients.map((ing) => ({
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
      recipeId: entry.recipeId,
    }));
  });

  const aggregated = aggregateIngredients(sources);

  // Carry over ticked items so regenerating mid-shop doesn't lose progress.
  const wasChecked = new Set(
    db.shopping
      .filter((i) => i.weekStart === weekStart && i.checked)
      .map((i) => itemIdentity(i.ingredientName, i.unit)),
  );

  db.shopping = db.shopping.filter((i) => i.weekStart !== weekStart);
  const fresh: StoredShoppingItem[] = aggregated.map((item) => ({
    id: newId(),
    ingredientName: item.ingredientName,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    checked: wasChecked.has(itemIdentity(item.ingredientName, item.unit)),
    sourceRecipeIds: item.sourceRecipeIds,
    weekStart,
  }));
  db.shopping.push(...fresh);
  saveDB(db);

  return {
    weekStart,
    recipeCount: recipeIds.size,
    plannedMeals: entries.length,
    itemCount: fresh.length,
    items: sortItems(fresh).map(stripWeek),
  };
}
