import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { errorResponse, handleRouteError } from "@/lib/http";
import { serializeShoppingItem } from "@/lib/shopping";
import { dateKeyToUTC, isDateKey, startOfWeekKey } from "@/lib/week";

function readWeekStart(request: Request): string | null {
  const raw = new URL(request.url).searchParams.get("weekStart");
  return raw && isDateKey(raw) ? startOfWeekKey(raw) : null;
}

// GET /api/shopping-list?weekStart=YYYY-MM-DD
export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const weekStart = readWeekStart(request);
    if (!weekStart) {
      return errorResponse("A valid weekStart date is required.", 400);
    }

    const items = await prisma.shoppingListItem.findMany({
      where: { userId: user.id, weekStart: dateKeyToUTC(weekStart) },
      orderBy: [{ category: "asc" }, { ingredientName: "asc" }],
    });

    return NextResponse.json({
      weekStart,
      items: items.map(serializeShoppingItem),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

// DELETE /api/shopping-list?weekStart=YYYY-MM-DD[&onlyChecked=true]
// Clears the week's checked items (or all of them without onlyChecked).
export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    const weekStart = readWeekStart(request);
    if (!weekStart) {
      return errorResponse("A valid weekStart date is required.", 400);
    }
    const onlyChecked =
      new URL(request.url).searchParams.get("onlyChecked") === "true";

    const { count } = await prisma.shoppingListItem.deleteMany({
      where: {
        userId: user.id,
        weekStart: dateKeyToUTC(weekStart),
        ...(onlyChecked ? { checked: true } : {}),
      },
    });

    return NextResponse.json({ deleted: count });
  } catch (err) {
    return handleRouteError(err);
  }
}
