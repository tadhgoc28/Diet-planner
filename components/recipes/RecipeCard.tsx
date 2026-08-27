import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { totalTime } from "@/lib/scale";
import type { RecipeSummaryDTO } from "@/lib/recipe";

export function RecipeCard({ recipe }: { recipe: RecipeSummaryDTO }) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-lg">
        <div className="relative aspect-[4/3] w-full bg-surface-muted">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl opacity-40">
              🍽️
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-display text-lg leading-snug text-ink">
            {recipe.title}
          </h3>

          {recipe.description && (
            <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
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

          <div className="mt-3 flex items-center gap-3 text-xs text-ink-soft">
            <span>⏱ {totalTime(recipe.prepTimeMinutes, recipe.cookTimeMinutes)}</span>
            <span>·</span>
            <span>{recipe.servings} servings</span>
            <span>·</span>
            <span>{recipe.ingredientCount} ingredients</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
