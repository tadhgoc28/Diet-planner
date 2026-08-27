import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { serializeRecipe, type RecipeDTO } from "@/lib/recipe";

/**
 * Load a recipe owned by the current user, serialized for the client.
 * Returns null when there's no session or the recipe isn't theirs — callers
 * turn that into notFound(). (The (app) layout already guards the session.)
 *
 * Wrapped in React `cache` so a page and its `generateMetadata` share one query.
 */
export const getOwnedRecipeDTO = cache(
  async (id: string): Promise<RecipeDTO | null> => {
    const user = await getCurrentUser();
    if (!user) return null;

    const recipe = await prisma.recipe.findFirst({
      where: { id, userId: user.id },
      include: { ingredients: true, steps: true },
    });
    return recipe ? serializeRecipe(recipe) : null;
  },
);
