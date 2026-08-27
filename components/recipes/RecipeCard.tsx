import Link from "next/link";
import Image from "next/image";
import { Tag } from "@/components/ui/Tag";
import { totalTime } from "@/lib/scale";
import { cn } from "@/lib/cn";
import type { RecipeSummaryDTO } from "@/lib/recipe";

export function RecipeCard({
  recipe,
  featured = false,
}: {
  recipe: RecipeSummaryDTO;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className={cn(
        "group block overflow-hidden rounded-[var(--radius-tile)] border border-line bg-[color:var(--color-surface)] transition-shadow hover:shadow-[var(--shadow-card)]",
        featured && "sm:col-span-2 sm:grid sm:grid-cols-2",
      )}
    >
      <div
        className={cn(
          "relative w-full bg-surface-muted",
          featured ? "aspect-[16/10] sm:h-full sm:aspect-auto" : "aspect-[4/3]",
        )}
      >
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt=""
            fill
            sizes={
              featured
                ? "(max-width: 640px) 100vw, 480px"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
            }
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl opacity-40">
            🍽️
          </div>
        )}
      </div>

      <div className={cn("p-4", featured && "sm:flex sm:flex-col sm:justify-center sm:p-6")}>
        <h3
          className={cn(
            "font-display font-semibold leading-snug text-ink",
            featured ? "text-2xl tracking-[-0.02em]" : "text-lg",
          )}
        >
          {recipe.title}
        </h3>

        {recipe.description && (
          <p
            className={cn(
              "mt-1 text-sm text-ink-soft",
              featured ? "line-clamp-3" : "line-clamp-2",
            )}
          >
            {recipe.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {recipe.cuisine && <Tag kind="cuisine">{recipe.cuisine}</Tag>}
          {recipe.diet && <Tag kind="diet">{recipe.diet}</Tag>}
          {recipe.mealTypes.map((m) => (
            <Tag key={m} kind="meal">
              {m}
            </Tag>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
          <span>⏱ {totalTime(recipe.prepTimeMinutes, recipe.cookTimeMinutes)}</span>
          <span aria-hidden>·</span>
          <span>{recipe.servings} servings</span>
          <span aria-hidden>·</span>
          <span>{recipe.ingredientCount} ingredients</span>
        </div>
      </div>
    </Link>
  );
}
