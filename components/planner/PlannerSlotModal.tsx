"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { MEAL_SLOT_LABELS } from "@/lib/tags";
import { formatDayLabel } from "@/lib/week";
import type { RecipeSummaryDTO } from "@/lib/recipe";
import type { PlannerEntryDTO } from "@/lib/planner";
import type { MealSlot } from "@/lib/tags";

export function PlannerSlotModal({
  open,
  onClose,
  dateKey,
  mealSlot,
  entry,
  recipes,
  onPlan,
  onRemove,
}: {
  open: boolean;
  onClose: () => void;
  dateKey: string;
  mealSlot: MealSlot;
  entry?: PlannerEntryDTO;
  recipes: RecipeSummaryDTO[];
  onPlan: (recipeId: string) => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const [selected, setSelected] = useState(entry?.recipe.id ?? "");
  const [busy, setBusy] = useState<"plan" | "remove" | null>(null);

  // Keep the select in sync when the modal is opened for a different slot.
  const [lastKey, setLastKey] = useState(`${dateKey}:${mealSlot}`);
  if (open && lastKey !== `${dateKey}:${mealSlot}`) {
    setLastKey(`${dateKey}:${mealSlot}`);
    setSelected(entry?.recipe.id ?? "");
  }

  const { weekday, day, month } = formatDayLabel(dateKey);

  async function plan() {
    if (!selected) return;
    setBusy("plan");
    try {
      await onPlan(selected);
      onClose();
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setBusy("remove");
    try {
      await onRemove();
      onClose();
    } finally {
      setBusy(null);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !busy && onClose()}
      title={`${MEAL_SLOT_LABELS[mealSlot]} · ${weekday} ${day} ${month}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={Boolean(busy)}>
            Cancel
          </Button>
          <Button onClick={plan} loading={busy === "plan"} disabled={!selected}>
            {entry ? "Swap recipe" : "Add to plan"}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {recipes.length === 0 ? (
          <p>You don’t have any recipes to plan yet.</p>
        ) : (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-ink">
              {entry ? "Replace with" : "Recipe"}
            </span>
            <Select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Choose a recipe…</option>
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </Select>
          </label>
        )}

        {entry && (
          <button
            type="button"
            onClick={remove}
            disabled={Boolean(busy)}
            className="text-sm font-medium text-danger underline disabled:opacity-50"
          >
            {busy === "remove" ? "Removing…" : "Remove from plan"}
          </button>
        )}
      </div>
    </Modal>
  );
}
