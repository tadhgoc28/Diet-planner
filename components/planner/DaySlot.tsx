"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/cn";
import { slotId } from "@/lib/planner";
import { MEAL_SLOT_LABELS } from "@/lib/tags";
import type { MealSlot } from "@/lib/tags";
import type { PlannerEntryDTO } from "@/lib/planner";

export function DaySlot({
  dateKey,
  mealSlot,
  entry,
  onOpen,
  showSlotLabel,
}: {
  dateKey: string;
  mealSlot: MealSlot;
  entry?: PlannerEntryDTO;
  onOpen: () => void;
  showSlotLabel?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: slotId(dateKey, mealSlot),
    data: { type: "slot", dateKey, mealSlot },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-xl border p-1.5 transition-colors",
        isOver
          ? "border-terracotta bg-terracotta-soft/60"
          : "border-transparent",
      )}
    >
      {showSlotLabel && (
        <p className="px-1 pb-1 text-[11px] font-medium uppercase tracking-wide text-ink-soft">
          {MEAL_SLOT_LABELS[mealSlot]}
        </p>
      )}

      {entry ? (
        <button
          type="button"
          onClick={onOpen}
          className="w-full overflow-hidden rounded-lg border border-line bg-surface text-left shadow-sm transition-shadow hover:shadow"
        >
          {entry.recipe.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.recipe.imageUrl}
              alt=""
              className="h-14 w-full object-cover"
            />
          )}
          <span className="block px-2 py-1.5">
            <span className="line-clamp-2 text-xs font-medium text-ink">
              {entry.recipe.title}
            </span>
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full items-center justify-center rounded-lg border border-dashed border-line py-3 text-xs text-ink-soft/70 transition-colors hover:border-terracotta hover:text-terracotta-dark"
        >
          + add meal
        </button>
      )}
    </div>
  );
}
