"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { ServingsAdjuster } from "./ServingsAdjuster";
import { DeleteRecipeButton } from "./DeleteRecipeButton";
import { scaleQuantity, formatAmount, totalTime } from "@/lib/scale";
import { cn } from "@/lib/cn";
import type { RecipeDTO } from "@/lib/recipe";

function StatTile({
  label,
  value,
  tint = "surface",
}: {
  label: string;
  value: string;
  tint?: "surface" | "butter" | "pine" | "accent";
}) {
  const tints = {
    surface: "border-line bg-[color:var(--color-surface)] text-ink",
    butter:
      "border-[color:var(--color-butter)]/25 bg-[color:var(--color-butter-soft)] text-ink",
    pine: "border-transparent bg-sage text-white",
    accent:
      "border-[color:var(--color-terracotta)]/25 bg-terracotta-soft text-ink",
  }[tint];
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-[var(--radius-tile)] border p-4",
        tints,
      )}
    >
      <p
        className={cn(
          "text-xs uppercase tracking-wide",
          tint === "pine" ? "text-white/70" : "text-ink-soft",
        )}
      >
        {label}
      </p>
      <p className="mt-4 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}

export function RecipeDetailView({ recipe }: { recipe: RecipeDTO }) {
  const [servings, setServings] = useState(recipe.servings);
  const scaled = servings !== recipe.servings;

  return (
    <article className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Button href="/recipes" variant="ghost" size="sm">
            ← All recipes
          </Button>
          <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-ink">
            {recipe.title}
          </h1>
          {recipe.description && (
            <p className="max-w-2xl text-ink-soft">{recipe.description}</p>
          )}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {recipe.cuisine && <Tag kind="cuisine">{recipe.cuisine}</Tag>}
            {recipe.diet && <Tag kind="diet">{recipe.diet}</Tag>}
            {recipe.mealTypes.map((m) => (
              <Tag key={m} kind="meal">
                {m}
              </Tag>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            href={`/recipes/${recipe.id}/edit`}
            variant="secondary"
            size="sm"
          >
            Edit
          </Button>
          <DeleteRecipeButton recipeId={recipe.id} recipeTitle={recipe.title} />
        </div>
      </div>

      {/* Image + stats bento */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {recipe.imageUrl && (
          <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-[var(--radius-tile)] border border-line bg-surface-muted md:row-span-2 md:aspect-auto md:min-h-[15rem]">
            <Image
              src={recipe.imageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover"
              priority
            />
          </div>
        )}
        <StatTile label="Prep" value={`${recipe.prepTimeMinutes || 0} min`} />
        <StatTile label="Cook" value={`${recipe.cookTimeMinutes || 0} min`} />
        <StatTile
          label="Total"
          value={totalTime(recipe.prepTimeMinutes, recipe.cookTimeMinutes)}
          tint="butter"
        />
        <StatTile label="Serves" value={String(recipe.servings)} tint="pine" />
      </div>

      {/* Ingredients + method bento */}
      <div className="grid gap-3 lg:grid-cols-[21rem_1fr]">
        <section className="h-fit space-y-4 rounded-[var(--radius-tile)] border border-line bg-[color:var(--color-surface)] p-5">
          <div className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink">
              Ingredients
            </h2>
            <ServingsAdjuster
              value={servings}
              base={recipe.servings}
              onChange={setServings}
            />
            {scaled && (
              <p className="text-xs text-ink-soft">
                Quantities scaled from {recipe.servings} servings.
              </p>
            )}
          </div>
          <ul className="divide-y divide-line">
            {recipe.ingredients.map((ing) => {
              const qty = scaleQuantity(ing.quantity, recipe.servings, servings);
              const amount = formatAmount(qty, ing.unit);
              return (
                <li
                  key={ing.id}
                  className="flex justify-between gap-3 py-2 text-sm"
                >
                  <span className="text-ink">{ing.name}</span>
                  {amount && (
                    <span className="shrink-0 font-medium text-ink-soft">
                      {amount}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="space-y-4 rounded-[var(--radius-tile)] border border-line bg-[color:var(--color-surface)] p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold text-ink">Method</h2>
          <ol className="space-y-4">
            {recipe.steps.map((step) => (
              <li key={step.id} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-[color:var(--color-surface)]">
                  {step.stepNumber}
                </span>
                <p className="pt-0.5 text-ink">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
