"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { toast } from "@/components/ui/Toaster";
import { MealTypePicker } from "./MealTypePicker";
import {
  IngredientRows,
  makeIngredientRow,
  type IngredientRow,
} from "./IngredientRows";
import { InstructionRows, makeStepRow, type StepRow } from "./InstructionRows";
import { apiSend, ApiError } from "@/lib/api";
import { recipeInputSchema } from "@/lib/validation";
import { CUISINES, DIETS } from "@/lib/tags";
import type { RecipeDTO } from "@/lib/recipe";

type Props = { recipe?: RecipeDTO };

function toNumberOrNull(s: string): number | null {
  const t = s.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN; // NaN -> schema rejects with a message
}

export function RecipeForm({ recipe }: Props) {
  const router = useRouter();
  const editing = Boolean(recipe);

  const [title, setTitle] = useState(recipe?.title ?? "");
  const [description, setDescription] = useState(recipe?.description ?? "");
  const [imageUrl, setImageUrl] = useState(recipe?.imageUrl ?? "");
  const [prep, setPrep] = useState(String(recipe?.prepTimeMinutes ?? ""));
  const [cook, setCook] = useState(String(recipe?.cookTimeMinutes ?? ""));
  const [servings, setServings] = useState(String(recipe?.servings ?? "4"));
  const [cuisine, setCuisine] = useState(recipe?.cuisine ?? "");
  const [diet, setDiet] = useState(recipe?.diet ?? "");
  const [mealTypes, setMealTypes] = useState<string[]>(recipe?.mealTypes ?? []);

  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    recipe?.ingredients.length
      ? recipe.ingredients.map((i) =>
          makeIngredientRow({
            key: i.id,
            name: i.name,
            quantity: i.quantity == null ? "" : String(i.quantity),
            unit: i.unit ?? "",
          }),
        )
      : [makeIngredientRow()],
  );
  const [steps, setSteps] = useState<StepRow[]>(
    recipe?.steps.length
      ? recipe.steps.map((s) => ({ key: s.id, text: s.text }))
      : [makeStepRow()],
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function clearError(key: string) {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function buildPayload() {
    return {
      title,
      description,
      imageUrl,
      prepTimeMinutes: toNumberOrNull(prep) ?? 0,
      cookTimeMinutes: toNumberOrNull(cook) ?? 0,
      servings: toNumberOrNull(servings) ?? 0,
      cuisine: cuisine || null,
      diet: diet || null,
      mealTypes,
      ingredients: ingredients.map((r) => ({
        name: r.name,
        quantity: toNumberOrNull(r.quantity),
        unit: r.unit || null,
      })),
      steps: steps.map((r) => ({ text: r.text })),
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const payload = buildPayload();
    const parsed = recipeInputSchema.safeParse(payload);
    if (!parsed.success) {
      const flat: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!flat[key]) flat[key] = issue.message;
      }
      setErrors(flat);
      toast("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = editing
        ? await apiSend<{ recipe: RecipeDTO }>(
            `/api/recipes/${recipe!.id}`,
            "PATCH",
            parsed.data,
          )
        : await apiSend<{ recipe: RecipeDTO }>(
            "/api/recipes",
            "POST",
            parsed.data,
          );
      // Refresh any cached lists / detail views that read this data.
      mutate("/api/recipes");
      mutate(`/api/recipes/${res.recipe.id}`, res, false);
      toast(editing ? "Recipe updated" : "Recipe created", "success");
      router.push(`/recipes/${res.recipe.id}`);
    } catch (err) {
      setSubmitting(false);
      if (err instanceof ApiError) {
        if (err.fieldErrors) setErrors(err.fieldErrors);
        toast(err.message);
      } else {
        toast("Something went wrong. Your changes are still here — try again.");
      }
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-ink">
          {editing ? "Edit recipe" : "New recipe"}
        </h1>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {editing ? "Save changes" : "Create recipe"}
          </Button>
        </div>
      </div>

      {/* Basics */}
      <Card className="space-y-4 p-5">
        <Field label="Title" error={errors.title} required>
          {(p) => (
            <Input
              {...p}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                clearError("title");
              }}
              placeholder="Weeknight Tomato & Basil Pasta"
            />
          )}
        </Field>

        <Field label="Description" error={errors.description}>
          {(p) => (
            <Textarea
              {...p}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short note about the dish…"
            />
          )}
        </Field>

        <Field
          label="Image URL"
          error={errors.imageUrl}
          hint="Paste a link to a photo. Optional."
        >
          {(p) => (
            <Input
              {...p}
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                clearError("imageUrl");
              }}
              placeholder="https://…"
            />
          )}
        </Field>

        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="h-40 w-full rounded-xl object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        )}
      </Card>

      {/* Meta */}
      <Card className="grid gap-4 p-5 sm:grid-cols-3">
        <Field label="Prep time (min)" error={errors.prepTimeMinutes}>
          {(p) => (
            <Input
              {...p}
              inputMode="numeric"
              value={prep}
              onChange={(e) => {
                setPrep(e.target.value);
                clearError("prepTimeMinutes");
              }}
              placeholder="10"
            />
          )}
        </Field>
        <Field label="Cook time (min)" error={errors.cookTimeMinutes}>
          {(p) => (
            <Input
              {...p}
              inputMode="numeric"
              value={cook}
              onChange={(e) => {
                setCook(e.target.value);
                clearError("cookTimeMinutes");
              }}
              placeholder="20"
            />
          )}
        </Field>
        <Field label="Servings" error={errors.servings} required>
          {(p) => (
            <Input
              {...p}
              inputMode="numeric"
              value={servings}
              onChange={(e) => {
                setServings(e.target.value);
                clearError("servings");
              }}
              placeholder="4"
            />
          )}
        </Field>

        <Field label="Cuisine" error={errors.cuisine}>
          {(p) => (
            <Select
              {...p}
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
            >
              <option value="">—</option>
              {CUISINES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Diet" error={errors.diet}>
          {(p) => (
            <Select {...p} value={diet} onChange={(e) => setDiet(e.target.value)}>
              <option value="">—</option>
              {DIETS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <div className="space-y-1.5 sm:col-span-3">
          <span className="block text-sm font-medium text-ink">Meal type</span>
          <MealTypePicker value={mealTypes} onChange={setMealTypes} />
        </div>
      </Card>

      {/* Ingredients */}
      <Card className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg text-ink">Ingredients</h2>
        </div>
        {errors.ingredients && (
          <p className="text-xs font-medium text-danger">{errors.ingredients}</p>
        )}
        <IngredientRows
          rows={ingredients}
          errors={errors}
          onChange={(index, patch) => {
            setIngredients((prev) =>
              prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
            );
            clearError(`ingredients.${index}.name`);
            clearError(`ingredients.${index}.quantity`);
          }}
          onAdd={() =>
            setIngredients((prev) => [...prev, makeIngredientRow()])
          }
          onRemove={(index) =>
            setIngredients((prev) => prev.filter((_, i) => i !== index))
          }
        />
      </Card>

      {/* Instructions */}
      <Card className="space-y-3 p-5">
        <h2 className="text-lg text-ink">Instructions</h2>
        {errors.steps && (
          <p className="text-xs font-medium text-danger">{errors.steps}</p>
        )}
        <InstructionRows
          rows={steps}
          errors={errors}
          onChange={(index, text) => {
            setSteps((prev) =>
              prev.map((r, i) => (i === index ? { ...r, text } : r)),
            );
            clearError(`steps.${index}.text`);
          }}
          onAdd={() => setSteps((prev) => [...prev, makeStepRow()])}
          onRemove={(index) =>
            setSteps((prev) => prev.filter((_, i) => i !== index))
          }
          onReorder={setSteps}
        />
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {editing ? "Save changes" : "Create recipe"}
        </Button>
      </div>
    </form>
  );
}
