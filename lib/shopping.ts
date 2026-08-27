import type { ShoppingCategory } from "@/lib/categorize";

export type ShoppingItemDTO = {
  id: string;
  ingredientName: string;
  quantity: number | null;
  unit: string | null;
  category: ShoppingCategory;
  checked: boolean;
  sourceRecipeIds: string[];
};

/** What's stored in the browser (adds the week it belongs to). */
export type StoredShoppingItem = ShoppingItemDTO & {
  weekStart: string; // YYYY-MM-DD (Monday)
};

/** Stable identity for carrying `checked` across a regenerate. */
export function itemIdentity(name: string, unit: string | null): string {
  return `${name.toLowerCase().trim()}|${(unit ?? "").toLowerCase().trim()}`;
}
