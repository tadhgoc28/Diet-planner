"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { swrFetcher } from "@/lib/swr";
import { apiSend, ApiError } from "@/lib/api";
import { toast } from "@/components/ui/Toaster";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { WeekNav } from "./WeekNav";
import { WeekGrid } from "./WeekGrid";
import { RecipePicker } from "./RecipePicker";
import { PlannerSlotModal } from "./PlannerSlotModal";
import { slotId, parseSlotId, type PlannerEntryDTO } from "@/lib/planner";
import {
  currentWeekStartKey,
  isDateKey,
  startOfWeekKey,
} from "@/lib/week";
import type { RecipeSummaryDTO } from "@/lib/recipe";
import type { MealSlot } from "@/lib/tags";

type PlannerResp = { weekStart: string; entries: PlannerEntryDTO[] };
type RecipesResp = { recipes: RecipeSummaryDTO[] };

export function PlannerBoard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const weekParam = searchParams.get("week");
  const weekStart =
    weekParam && isDateKey(weekParam)
      ? startOfWeekKey(weekParam)
      : currentWeekStartKey();

  const plannerKey = `/api/planner?weekStart=${weekStart}`;
  const {
    data: plannerData,
    isLoading: plannerLoading,
    mutate,
  } = useSWR<PlannerResp>(plannerKey, swrFetcher, {
    keepPreviousData: true,
  });
  const { data: recipesData, isLoading: recipesLoading } = useSWR<RecipesResp>(
    "/api/recipes",
    swrFetcher,
  );
  const recipes = useMemo(() => recipesData?.recipes ?? [], [recipesData]);

  const entriesBySlot = useMemo(() => {
    const map: Record<string, PlannerEntryDTO> = {};
    for (const e of plannerData?.entries ?? []) {
      map[slotId(e.date, e.mealSlot)] = e;
    }
    return map;
  }, [plannerData]);

  const plannedCount = plannerData?.entries.length ?? 0;

  const setWeek = useCallback(
    (key: string) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (key === currentWeekStartKey()) params.delete("week");
      else params.set("week", key);
      const qs = params.toString();
      router.push(qs ? `/planner?${qs}` : "/planner");
    },
    [router, searchParams],
  );

  const planMeal = useCallback(
    async (recipeId: string, dateKey: string, mealSlot: MealSlot) => {
      try {
        await apiSend("/api/planner", "POST", {
          recipeId,
          date: dateKey,
          mealSlot,
        });
        await mutate();
      } catch (err) {
        toast(
          err instanceof ApiError ? err.message : "Couldn't update the plan.",
        );
        throw err;
      }
    },
    [mutate],
  );

  const removeMeal = useCallback(
    async (entryId: string) => {
      try {
        await apiSend(`/api/planner/${entryId}`, "DELETE");
        await mutate();
      } catch (err) {
        toast(
          err instanceof ApiError ? err.message : "Couldn't remove that meal.",
        );
        throw err;
      }
    },
    [mutate],
  );

  // --- modal -----------------------------------------------------------------
  const [modal, setModal] = useState<{
    dateKey: string;
    mealSlot: MealSlot;
  } | null>(null);
  const modalEntry = modal
    ? entriesBySlot[slotId(modal.dateKey, modal.mealSlot)]
    : undefined;

  // --- drag and drop -------------------------------------------------------
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 6 },
    }),
  );
  const [activeTitle, setActiveTitle] = useState<string | null>(null);

  function onDragStart(e: DragStartEvent) {
    setActiveTitle((e.active.data.current?.title as string) ?? null);
  }
  function onDragEnd(e: DragEndEvent) {
    setActiveTitle(null);
    const { active, over } = e;
    if (!over || active.data.current?.type !== "recipe") return;
    const slot = parseSlotId(String(over.id));
    if (!slot) return;
    void planMeal(
      active.data.current.recipeId as string,
      slot.dateKey,
      slot.mealSlot as MealSlot,
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl text-ink">Weekly planner</h1>
          <p className="text-sm text-ink-soft">
            {plannedCount === 0
              ? "Nothing planned this week yet."
              : `${plannedCount} ${plannedCount === 1 ? "meal" : "meals"} planned this week`}
          </p>
        </div>
        <WeekNav weekStart={weekStart} onChange={setWeek} />
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="grid gap-5 lg:grid-cols-[16rem_1fr]">
          <Card className="p-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)]">
            <RecipePicker recipes={recipes} isLoading={recipesLoading} />
          </Card>

          <div>
            {plannerLoading && !plannerData ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-72 w-full" />
              </div>
            ) : (
              <WeekGrid
                weekStart={weekStart}
                entriesBySlot={entriesBySlot}
                onOpenSlot={(dateKey, mealSlot) =>
                  setModal({ dateKey, mealSlot })
                }
              />
            )}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTitle ? (
            <div className="max-w-[12rem] rounded-xl border border-terracotta bg-surface px-3 py-2 text-sm font-medium text-ink shadow-lg">
              {activeTitle}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {modal && (
        <PlannerSlotModal
          open
          onClose={() => setModal(null)}
          dateKey={modal.dateKey}
          mealSlot={modal.mealSlot}
          entry={modalEntry}
          recipes={recipes}
          onPlan={(recipeId) =>
            planMeal(recipeId, modal.dateKey, modal.mealSlot)
          }
          onRemove={() =>
            modalEntry ? removeMeal(modalEntry.id) : Promise.resolve()
          }
        />
      )}
    </div>
  );
}
