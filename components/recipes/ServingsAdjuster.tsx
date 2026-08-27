"use client";

import { cn } from "@/lib/cn";

export function ServingsAdjuster({
  value,
  base,
  onChange,
}: {
  value: number;
  base: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="inline-flex items-center rounded-full border border-line bg-surface">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          className="px-3 py-1.5 text-lg text-ink-soft hover:text-ink disabled:opacity-30"
          disabled={value <= 1}
          aria-label="Fewer servings"
        >
          −
        </button>
        <span className="min-w-10 text-center text-sm font-semibold text-ink">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(100, value + 1))}
          className="px-3 py-1.5 text-lg text-ink-soft hover:text-ink disabled:opacity-30"
          disabled={value >= 100}
          aria-label="More servings"
        >
          +
        </button>
      </div>
      <span className="text-sm text-ink-soft">
        servings
        {value !== base && (
          <button
            type="button"
            onClick={() => onChange(base)}
            className={cn("ml-2 underline hover:text-ink")}
          >
            reset to {base}
          </button>
        )}
      </span>
    </div>
  );
}
