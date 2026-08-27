import type { ShoppingListItem } from "@prisma/client";
import { parseStringArray } from "@/lib/tags";
import {
  type ShoppingCategory,
  SHOPPING_CATEGORIES,
} from "@/lib/categorize";

export type ShoppingItemDTO = {
  id: string;
  ingredientName: string;
  quantity: number | null;
  unit: string | null;
  category: ShoppingCategory;
  checked: boolean;
  sourceRecipeIds: string[];
};

export function serializeShoppingItem(
  item: ShoppingListItem,
): ShoppingItemDTO {
  const category = (
    SHOPPING_CATEGORIES as readonly string[]
  ).includes(item.category)
    ? (item.category as ShoppingCategory)
    : "other";
  return {
    id: item.id,
    ingredientName: item.ingredientName,
    quantity: item.quantity,
    unit: item.unit,
    category,
    checked: item.checked,
    sourceRecipeIds: parseStringArray(item.sourceRecipeIds),
  };
}

/** Stable identity for carrying `checked` across a regenerate. */
export function itemIdentity(name: string, unit: string | null): string {
  return `${name.toLowerCase().trim()}|${(unit ?? "").toLowerCase().trim()}`;
}
