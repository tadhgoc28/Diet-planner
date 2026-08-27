import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { errorResponse, handleRouteError } from "@/lib/http";
import { plannerEntryInputSchema } from "@/lib/validation";
import { serializePlannerEntry } from "@/lib/planner";
import {
  dateKeyToUTC,
  isDateKey,
  startOfWeekKey,
  addDaysKey,
} from "@/lib/week";

// GET /api/planner?weekStart=YYYY-MM-DD — entries for that Mon–Sun window.
export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const raw = new URL(request.url).searchParams.get("weekStart");
    if (!raw || !isDateKey(raw)) {
      return errorResponse("A valid weekStart date is required.", 400);
    }

    const weekStart = startOfWeekKey(raw);
    const entries = await prisma.plannerEntry.findMany({
      where: {
        userId: user.id,
        date: {
          gte: dateKeyToUTC(weekStart),
          lt: dateKeyToUTC(addDaysKey(weekStart, 7)),
        },
      },
      include: { recipe: true },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({
      weekStart,
      entries: entries.map(serializePlannerEntry),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

// POST /api/planner — place (or replace) a recipe in a day + slot.
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const json = await request.json().catch(() => null);
    const { recipeId, date, mealSlot } = plannerEntryInputSchema.parse(json);

    const recipe = await prisma.recipe.findFirst({
      where: { id: recipeId, userId: user.id },
      select: { id: true },
    });
    if (!recipe) return errorResponse("Recipe not found.", 404);

    const when = dateKeyToUTC(date);
    const entry = await prisma.plannerEntry.upsert({
      where: {
        userId_date_mealSlot: { userId: user.id, date: when, mealSlot },
      },
      create: { userId: user.id, recipeId, date: when, mealSlot },
      update: { recipeId },
      include: { recipe: true },
    });

    return NextResponse.json({ entry: serializePlannerEntry(entry) }, {
      status: 201,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
