import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Recipes · MealBoard" };

export default function RecipesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-ink">Recipes</h1>
        <p className="text-sm text-ink-soft">Your cookbook lives here.</p>
      </div>
      <EmptyState
        icon="📖"
        title="Recipe management is coming next"
        description="Phase 2 adds the recipe grid, search, detail view and the add/edit form."
      />
    </div>
  );
}
