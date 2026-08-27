"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

export type IngredientRow = {
  key: string;
  name: string;
  quantity: string;
  unit: string;
};

export function makeIngredientRow(
  partial?: Partial<IngredientRow>,
): IngredientRow {
  return {
    key: crypto.randomUUID(),
    name: "",
    quantity: "",
    unit: "",
    ...partial,
  };
}

export function IngredientRows({
  rows,
  errors,
  onChange,
  onAdd,
  onRemove,
}: {
  rows: IngredientRow[];
  errors: Record<string, string>;
  onChange: (index: number, patch: Partial<IngredientRow>) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="hidden gap-2 px-1 text-xs font-medium text-ink-soft sm:grid sm:grid-cols-[5rem_6rem_1fr_2.5rem]">
        <span>Qty</span>
        <span>Unit</span>
        <span>Ingredient</span>
        <span />
      </div>

      {rows.map((row, i) => {
        const nameError = errors[`ingredients.${i}.name`];
        const qtyError = errors[`ingredients.${i}.quantity`];
        return (
          <div key={row.key} className="space-y-1">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-[5rem_6rem_1fr_2.5rem]">
              <Input
                aria-label="Quantity"
                inputMode="decimal"
                placeholder="2"
                value={row.quantity}
                onChange={(e) => onChange(i, { quantity: e.target.value })}
                aria-invalid={Boolean(qtyError)}
              />
              <Input
                aria-label="Unit"
                placeholder="cups"
                value={row.unit}
                onChange={(e) => onChange(i, { unit: e.target.value })}
              />
              <Input
                aria-label="Ingredient name"
                placeholder="plain flour"
                className={cn("col-span-2 sm:col-span-1")}
                value={row.name}
                onChange={(e) => onChange(i, { name: e.target.value })}
                aria-invalid={Boolean(nameError)}
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                disabled={rows.length === 1}
                aria-label={`Remove ingredient ${i + 1}`}
                className="justify-self-start rounded-lg px-2 py-2 text-ink-soft hover:bg-surface-muted hover:text-danger disabled:opacity-30 sm:justify-self-auto"
              >
                ✕
              </button>
            </div>
            {(nameError || qtyError) && (
              <p className="text-xs font-medium text-danger">
                {nameError ?? qtyError}
              </p>
            )}
          </div>
        );
      })}

      <Button type="button" variant="secondary" size="sm" onClick={onAdd}>
        + Add ingredient
      </Button>
    </div>
  );
}
