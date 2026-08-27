"use client";

import { Fragment } from "react";
import { cn } from "@/lib/cn";
import { MEAL_SLOTS, MEAL_SLOT_LABELS, type MealSlot } from "@/lib/tags";
import { slotId, type PlannerEntryDTO } from "@/lib/planner";
import { formatDayLabel, isTodayKey, weekDayKeys } from "@/lib/week";
import { DaySlot } from "./DaySlot";

function DayHeader({ dateKey }: { dateKey: string }) {
  const { weekday, day, month } = formatDayLabel(dateKey);
  const today = isTodayKey(dateKey);
  return (
    <div className="px-1 pb-1 text-center">
      <div className="text-xs font-medium text-ink-soft">{weekday}</div>
      <div
        className={cn(
          "mx-auto mt-0.5 grid h-7 w-7 place-items-center rounded-full text-sm font-semibold",
          today ? "bg-terracotta text-white" : "text-ink",
        )}
      >
        {day}
      </div>
      <div className="mt-0.5 text-[10px] uppercase text-ink-soft/70">{month}</div>
    </div>
  );
}

export function WeekGrid({
  weekStart,
  entriesBySlot,
  onOpenSlot,
}: {
  weekStart: string;
  entriesBySlot: Record<string, PlannerEntryDTO>;
  onOpenSlot: (dateKey: string, mealSlot: MealSlot) => void;
}) {
  const dayKeys = weekDayKeys(weekStart);

  return (
    <div className="scrollbar-slim overflow-x-auto pb-2">
      <div
        className="grid min-w-[60rem] gap-1"
        style={{ gridTemplateColumns: "4.5rem repeat(7, minmax(9rem, 1fr))" }}
      >
        {/* Header row */}
        <div aria-hidden />
        {dayKeys.map((k) => (
          <DayHeader key={k} dateKey={k} />
        ))}

        {/* One row per meal slot */}
        {MEAL_SLOTS.map((slot) => (
          <Fragment key={slot}>
            <div className="flex items-start justify-end pr-2 pt-3 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
              {MEAL_SLOT_LABELS[slot]}
            </div>
            {dayKeys.map((k) => (
              <DaySlot
                key={`${k}:${slot}`}
                dateKey={k}
                mealSlot={slot}
                entry={entriesBySlot[slotId(k, slot)]}
                onOpen={() => onOpenSlot(k, slot)}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
