"use client";

import { Button } from "@/components/ui/Button";
import {
  formatWeekRange,
  currentWeekStartKey,
  addWeeksKey,
} from "@/lib/week";

export function WeekNav({
  weekStart,
  onChange,
}: {
  weekStart: string;
  onChange: (weekStartKey: string) => void;
}) {
  const isCurrent = weekStart === currentWeekStartKey();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex overflow-hidden rounded-full border border-line bg-surface">
        <button
          type="button"
          onClick={() => onChange(addWeeksKey(weekStart, -1))}
          className="px-3 py-1.5 text-ink-soft hover:bg-surface-muted hover:text-ink"
          aria-label="Previous week"
        >
          ←
        </button>
        <span className="border-x border-line px-3 py-1.5 text-sm font-medium text-ink">
          {formatWeekRange(weekStart)}
        </span>
        <button
          type="button"
          onClick={() => onChange(addWeeksKey(weekStart, 1))}
          className="px-3 py-1.5 text-ink-soft hover:bg-surface-muted hover:text-ink"
          aria-label="Next week"
        >
          →
        </button>
      </div>
      {!isCurrent && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(currentWeekStartKey())}
        >
          This week
        </Button>
      )}
    </div>
  );
}
