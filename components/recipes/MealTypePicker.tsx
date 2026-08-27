"use client";

import { MEAL_TYPES } from "@/lib/tags";
import { cn } from "@/lib/cn";

export function MealTypePicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(m: string) {
    onChange(value.includes(m) ? value.filter((x) => x !== m) : [...value, m]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {MEAL_TYPES.map((m) => {
        const active = value.includes(m);
        return (
          <button
            key={m}
            type="button"
            onClick={() => toggle(m)}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition-colors",
              active
                ? "border-terracotta bg-terracotta text-white"
                : "border-line bg-surface text-ink-soft hover:bg-surface-muted",
            )}
          >
            {m}
          </button>
        );
      })}
    </div>
  );
}
