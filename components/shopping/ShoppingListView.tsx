"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { swrFetcher } from "@/lib/swr";
import { apiSend, ApiError } from "@/lib/api";
import { toast } from "@/components/ui/Toaster";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { WeekNav } from "@/components/planner/WeekNav";
import { formatAmount } from "@/lib/scale";
import {
  currentWeekStartKey,
  isDateKey,
  startOfWeekKey,
} from "@/lib/week";
import {
  SHOPPING_CATEGORIES,
  CATEGORY_LABELS,
  type ShoppingCategory,
} from "@/lib/categorize";
import type { ShoppingItemDTO } from "@/lib/shopping";

type Resp = { weekStart: string; items: ShoppingItemDTO[] };
type GenerateResp = Resp & {
  recipeCount: number;
  plannedMeals: number;
  itemCount: number;
};

export function ShoppingListView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const weekParam = searchParams.get("week");
  const weekStart =
    weekParam && isDateKey(weekParam)
      ? startOfWeekKey(weekParam)
      : currentWeekStartKey();

  const key = `/api/shopping-list?weekStart=${weekStart}`;
  const { data, isLoading, mutate } = useSWR<Resp>(key, swrFetcher, {
    keepPreviousData: true,
  });
  const items = useMemo(() => data?.items ?? [], [data]);

  const [generating, setGenerating] = useState(false);
  const [clearing, setClearing] = useState(false);

  const checkedCount = items.filter((i) => i.checked).length;

  const grouped = useMemo(() => {
    const map = new Map<ShoppingCategory, ShoppingItemDTO[]>();
    for (const item of items) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return SHOPPING_CATEGORIES.filter((c) => map.has(c)).map((c) => ({
      category: c,
      items: map.get(c)!,
    }));
  }, [items]);

  const setWeek = useCallback(
    (wk: string) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (wk === currentWeekStartKey()) params.delete("week");
      else params.set("week", wk);
      const qs = params.toString();
      router.push(qs ? `/shopping-list?${qs}` : "/shopping-list");
    },
    [router, searchParams],
  );

  async function generate() {
    setGenerating(true);
    try {
      const res = await apiSend<GenerateResp>(
        `/api/shopping-list/generate?weekStart=${weekStart}`,
        "POST",
      );
      await mutate({ weekStart: res.weekStart, items: res.items }, false);
      if (res.plannedMeals === 0) {
        toast(
          "Nothing planned for this week yet — add meals in the planner first.",
        );
      } else {
        toast(
          `Built ${res.itemCount} items from ${res.plannedMeals} planned ${
            res.plannedMeals === 1 ? "meal" : "meals"
          }.`,
          "success",
        );
      }
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Couldn't generate the list.",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function clearChecked() {
    setClearing(true);
    try {
      await apiSend(
        `/api/shopping-list?weekStart=${weekStart}&onlyChecked=true`,
        "DELETE",
      );
      await mutate();
      toast("Cleared checked items.", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't clear items.");
    } finally {
      setClearing(false);
    }
  }

  async function toggle(item: ShoppingItemDTO) {
    const next = !item.checked;
    // Optimistic
    mutate(
      (cur) =>
        cur
          ? {
              ...cur,
              items: cur.items.map((i) =>
                i.id === item.id ? { ...i, checked: next } : i,
              ),
            }
          : cur,
      false,
    );
    try {
      await apiSend(`/api/shopping-list/${item.id}`, "PATCH", { checked: next });
    } catch {
      toast("Couldn't update that item.");
      mutate(); // roll back to server truth
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl text-ink">Shopping list</h1>
          <p className="text-sm text-ink-soft">
            {items.length === 0
              ? "Built from the meals you plan for the week."
              : `${checkedCount} of ${items.length} items checked`}
          </p>
        </div>
        <WeekNav weekStart={weekStart} onChange={setWeek} />
      </header>

      <div className="flex flex-wrap gap-2">
        <Button onClick={generate} loading={generating}>
          {items.length ? "Regenerate for this week" : "Generate shopping list"}
        </Button>
        {checkedCount > 0 && (
          <Button variant="secondary" onClick={clearChecked} loading={clearing}>
            Clear {checkedCount} checked
          </Button>
        )}
      </div>

      {isLoading && !data && (
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <EmptyState
          icon="🛒"
          title="No shopping list for this week yet"
          description="Plan some meals, then generate the list — duplicate ingredients get added up and grouped by aisle."
          action={
            <div className="flex gap-2">
              <Button onClick={generate} loading={generating}>
                Generate shopping list
              </Button>
              <Button href="/planner" variant="secondary">
                Open planner
              </Button>
            </div>
          }
        />
      )}

      {items.length > 0 && (
        <div className="space-y-5">
          {grouped.map(({ category, items: groupItems }) => {
            const done = groupItems.filter((i) => i.checked).length;
            return (
              <Card key={category} className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-line bg-surface-muted/60 px-4 py-2.5">
                  <h2 className="text-sm font-semibold text-ink">
                    {CATEGORY_LABELS[category]}
                  </h2>
                  <span className="text-xs text-ink-soft">
                    {done}/{groupItems.length}
                  </span>
                </div>
                <ul className="divide-y divide-line">
                  {groupItems.map((item) => {
                    const amount = formatAmount(item.quantity, item.unit);
                    const fromCount = item.sourceRecipeIds.length;
                    return (
                      <li key={item.id}>
                        <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-surface-muted/40">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => toggle(item)}
                            className="h-5 w-5 shrink-0 accent-terracotta"
                          />
                          <span className="flex-1">
                            <span
                              className={
                                item.checked
                                  ? "text-ink-soft line-through"
                                  : "text-ink"
                              }
                            >
                              {item.ingredientName}
                            </span>
                            {fromCount > 1 && (
                              <span className="ml-2 text-xs text-ink-soft">
                                · {fromCount} recipes
                              </span>
                            )}
                          </span>
                          {amount && (
                            <span className="shrink-0 text-sm font-medium text-ink-soft">
                              {amount}
                            </span>
                          )}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
