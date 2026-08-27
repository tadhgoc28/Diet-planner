import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { errorResponse, handleRouteError } from "@/lib/http";
import { recipeInputSchema } from "@/lib/validation";
import { serializeStringArray } from "@/lib/tags";
import { serializeRecipe } from "@/lib/recipe";

/** Load a recipe (with relations) that belongs to the given user, or null. */
async function findOwnedRecipe(id: string, userId: string) {
  return prisma.recipe.findFirst({
    where: { id, userId },
    include: { ingredients: true, steps: true },
  });
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const recipe = await findOwnedRecipe(id, user.id);
    if (!recipe) return errorResponse("Recipe not found.", 404);
    return NextResponse.json({ recipe: serializeRecipe(recipe) });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;

    const existing = await prisma.recipe.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });
    if (!existing) return errorResponse("Recipe not found.", 404);

    const json = await request.json().catch(() => null);
    const data = recipeInputSchema.parse(json);

    // Replace the child rows wholesale — simpler and safe inside one update.
    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
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
          deleteMany: {},
          create: data.ingredients.map((i, idx) => ({
            name: i.name,
            quantity: i.quantity,
            unit: i.unit,
            order: idx,
          })),
        },
        steps: {
          deleteMany: {},
          create: data.steps.map((s, idx) => ({
            stepNumber: idx + 1,
            text: s.text,
          })),
        },
      },
      include: { ingredients: true, steps: true },
    });

    return NextResponse.json({ recipe: serializeRecipe(recipe) });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;

    const { count } = await prisma.recipe.deleteMany({
      where: { id, userId: user.id },
    });
    if (count === 0) return errorResponse("Recipe not found.", 404);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
