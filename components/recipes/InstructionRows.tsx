"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";

export type StepRow = { key: string; text: string };

export function makeStepRow(text = ""): StepRow {
  return { key: crypto.randomUUID(), text };
}

function SortableStep({
  row,
  index,
  error,
  onChange,
  onRemove,
  removable,
}: {
  row: StepRow;
  index: number;
  error?: string;
  onChange: (text: string) => void;
  onRemove: () => void;
  removable: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.key });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex gap-2 rounded-xl border border-line bg-surface p-2 ${
        isDragging ? "opacity-60 shadow-lg" : ""
      }`}
    >
      <button
        type="button"
        className="mt-1 cursor-grab touch-none rounded-md px-1.5 py-1 text-ink-soft hover:bg-surface-muted active:cursor-grabbing"
        aria-label={`Reorder step ${index + 1}`}
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <div className="flex-1 space-y-1">
        <div className="flex items-start gap-2">
          <span className="mt-2.5 text-sm font-semibold text-terracotta">
            {index + 1}.
          </span>
          <Textarea
            aria-label={`Step ${index + 1}`}
            placeholder="Describe this step…"
            value={row.text}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={Boolean(error)}
            className="min-h-16"
          />
          <button
            type="button"
            onClick={onRemove}
            disabled={!removable}
            aria-label={`Remove step ${index + 1}`}
            className="mt-1.5 rounded-lg px-2 py-2 text-ink-soft hover:bg-surface-muted hover:text-danger disabled:opacity-30"
          >
            ✕
          </button>
        </div>
        {error && <p className="text-xs font-medium text-danger">{error}</p>}
      </div>
    </div>
  );
}

export function InstructionRows({
  rows,
  errors,
  onChange,
  onAdd,
  onRemove,
  onReorder,
}: {
  rows: StepRow[];
  errors: Record<string, string>;
  onChange: (index: number, text: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onReorder: (rows: StepRow[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = rows.findIndex((r) => r.key === active.id);
    const newIndex = rows.findIndex((r) => r.key === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(rows, oldIndex, newIndex));
  }

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={rows.map((r) => r.key)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {rows.map((row, i) => (
              <SortableStep
                key={row.key}
                row={row}
                index={i}
                error={errors[`steps.${i}.text`]}
                onChange={(text) => onChange(i, text)}
                onRemove={() => onRemove(i)}
                removable={rows.length > 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button type="button" variant="secondary" size="sm" onClick={onAdd}>
        + Add step
      </Button>
    </div>
  );
}
