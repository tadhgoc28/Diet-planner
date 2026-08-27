import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleRouteError } from "@/lib/http";
import { recipeInputSchema } from "@/lib/validation";
import { serializeStringArray } from "@/lib/tags";
import { serializeRecipe, serializeRecipeSummary } from "@/lib/recipe";

// GET /api/recipes — the signed-in user's recipes, newest first (card fields).
export async function GET() {
  try {
    const user = await requireUser();
    const recipes = await prisma.recipe.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { ingredients: true } } },
    });
    return NextResponse.json({ recipes: recipes.map(serializeRecipeSummary) });
  } catch (err) {
    return handleRouteError(err);
  }
}

// POST /api/recipes — create a recipe with its ingredients and steps.
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const json = await request.json().catch(() => null);
    const data = recipeInputSchema.parse(json);

    const recipe = await prisma.recipe.create({
      data: {
        userId: user.id,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        prepTimeMinutes: data.prepTimeMinutes,
        cookTimeMinutes: data.cookTimeMinutes,
        servings: data.servings,
        cuisine: data.cuisine,
        diet: data.diet,
        mealTypes: serializeStringArray(data.mealTypes),
        ingredients: {
          create: data.ingredients.map((i, idx) => ({
            name: i.name,
            quantity: i.quantity,
            unit: i.unit,
            order: idx,
          })),
        },
        steps: {
          create: data.steps.map((s, idx) => ({
            stepNumber: idx + 1,
            text: s.text,
          })),
        },
      },
      include: { ingredients: true, steps: true },
    });

    return NextResponse.json({ recipe: serializeRecipe(recipe) }, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
