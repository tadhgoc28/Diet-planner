import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { errorResponse, handleRouteError } from "@/lib/http";
import { shoppingItemPatchSchema } from "@/lib/validation";

// PATCH /api/shopping-list/:id — tick / untick one item.
export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const json = await request.json().catch(() => null);
    const { checked } = shoppingItemPatchSchema.parse(json);

    const { count } = await prisma.shoppingListItem.updateMany({
      where: { id, userId: user.id },
      data: { checked },
    });
    if (count === 0) return errorResponse("Item not found.", 404);

    return NextResponse.json({ id, checked });
  } catch (err) {
    return handleRouteError(err);
  }
}
