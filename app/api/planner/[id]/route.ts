import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { errorResponse, handleRouteError } from "@/lib/http";

// DELETE /api/planner/:id — remove one planned meal.
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;

    const { count } = await prisma.plannerEntry.deleteMany({
      where: { id, userId: user.id },
    });
    if (count === 0) return errorResponse("Planned meal not found.", 404);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
