"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { ServingsAdjuster } from "./ServingsAdjuster";
import { DeleteRecipeButton } from "./DeleteRecipeButton";
import { scaleQuantity, formatAmount, totalTime } from "@/lib/scale";
import type { RecipeDTO } from "@/lib/recipe";

export function RecipeDetailView({ recipe }: { recipe: RecipeDTO }) {
  const [servings, setServings] = useState(recipe.servings);
  const scaled = servings !== recipe.servings;

  return (
    <article className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Button href="/recipes" variant="ghost" size="sm">
            ← All recipes
          </Button>
          <h1 className="text-3xl text-ink">{recipe.title}</h1>
          {recipe.description && (
            <p className="max-w-2xl text-ink-soft">{recipe.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button href={`/recipes/${recipe.id}/edit`} variant="secondary" size="sm">
            Edit
          </Button>
          <DeleteRecipeButton recipeId={recipe.id} recipeTitle={recipe.title} />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {recipe.cuisine && <Tag kind="cuisine">{recipe.cuisine}</Tag>}
        {recipe.diet && <Tag kind="diet">{recipe.diet}</Tag>}
        {recipe.mealTypes.map((m) => (
          <Tag key={m} kind="meal">
            {m}
          </Tag>
        ))}
      </div>

      {recipe.imageUrl && (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-card)] bg-surface-muted">
          <Image
            src={recipe.imageUrl}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 900px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-ink-soft">Prep</p>
          <p className="text-lg text-ink">{recipe.prepTimeMinutes || 0} min</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-ink-soft">Cook</p>
          <p className="text-lg text-ink">{recipe.cookTimeMinutes || 0} min</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-ink-soft">Total</p>
          <p className="text-lg text-ink">
            {totalTime(recipe.prepTimeMinutes, recipe.cookTimeMinutes)}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        {/* Ingredients */}
        <Card className="h-fit space-y-4 p-5">
          <div className="space-y-3">
            <h2 className="text-lg text-ink">Ingredients</h2>
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
              const qty = scaleQuantity(
                ing.quantity,
                recipe.servings,
                servings,
              );
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
        </Card>

        {/* Steps */}
        <Card className="space-y-4 p-5">
          <h2 className="text-lg text-ink">Method</h2>
          <ol className="space-y-4">
            {recipe.steps.map((step) => (
              <li key={step.id} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-terracotta-soft text-sm font-semibold text-terracotta-dark">
                  {step.stepNumber}
                </span>
                <p className="pt-0.5 text-ink">{step.text}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </article>
  );
}
