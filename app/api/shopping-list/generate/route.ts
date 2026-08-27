import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { errorResponse, handleRouteError } from "@/lib/http";
import { serializeStringArray } from "@/lib/tags";
import {
  aggregateIngredients,
  type SourceIngredient,
} from "@/lib/aggregate";
import { serializeShoppingItem, itemIdentity } from "@/lib/shopping";
import {
  addDaysKey,
  dateKeyToUTC,
  isDateKey,
  startOfWeekKey,
} from "@/lib/week";

// POST /api/shopping-list/generate?weekStart=YYYY-MM-DD
// (Re)builds the week's list from every recipe planned that week.
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const raw = new URL(request.url).searchParams.get("weekStart");
    if (!raw || !isDateKey(raw)) {
      return errorResponse("A valid weekStart date is required.", 400);
    }
    const weekStart = startOfWeekKey(raw);
    const weekStartDate = dateKeyToUTC(weekStart);

    const entries = await prisma.plannerEntry.findMany({
      where: {
        userId: user.id,
        date: {
          gte: weekStartDate,
          lt: dateKeyToUTC(addDaysKey(weekStart, 7)),
        },
      },
      include: { recipe: { include: { ingredients: true } } },
    });

    const recipeIds = new Set(entries.map((e) => e.recipeId));

    const sources: SourceIngredient[] = entries.flatMap((entry) =>
      entry.recipe.ingredients.map((ing) => ({
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        recipeId: entry.recipeId,
      })),
    );

    const aggregated = aggregateIngredients(sources);

    // Carry over ticked-off items so regenerating mid-shop doesn't lose progress.
    const previous = await prisma.shoppingListItem.findMany({
      where: { userId: user.id, weekStart: weekStartDate },
      select: { ingredientName: true, unit: true, checked: true },
    });
    const wasChecked = new Set(
      previous
        .filter((p) => p.checked)
        .map((p) => itemIdentity(p.ingredientName, p.unit)),
    );

    await prisma.$transaction([
      prisma.shoppingListItem.deleteMany({
        where: { userId: user.id, weekStart: weekStartDate },
      }),
      prisma.shoppingListItem.createMany({
        data: aggregated.map((item) => ({
          userId: user.id,
          weekStart: weekStartDate,
          ingredientName: item.ingredientName,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          checked: wasChecked.has(
            itemIdentity(item.ingredientName, item.unit),
          ),
          sourceRecipeIds: serializeStringArray(item.sourceRecipeIds),
        })),
      }),
    ]);

    const items = await prisma.shoppingListItem.findMany({
      where: { userId: user.id, weekStart: weekStartDate },
      orderBy: [{ category: "asc" }, { ingredientName: "asc" }],
    });

    return NextResponse.json({
      weekStart,
      recipeCount: recipeIds.size,
      plannedMeals: entries.length,
      itemCount: items.length,
      items: items.map(serializeShoppingItem),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
