import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export function RecipeLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-10 w-2/3" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Skeleton className="col-span-2 aspect-[16/10] rounded-[var(--radius-tile)] md:row-span-2 md:aspect-auto" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-[var(--radius-tile)]" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-[var(--radius-tile)]" />
    </div>
  );
}

export function RecipeMissing() {
  return (
    <EmptyState
      icon="🕵️"
      title="That recipe isn’t here"
      description="It may have been deleted, or the link points somewhere that doesn’t exist in this browser."
      action={<Button href="/recipes">Back to recipes</Button>}
    />
  );
}
