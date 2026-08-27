import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Shopping list · MealBoard" };

export default function ShoppingListPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-ink">Shopping list</h1>
        <p className="text-sm text-ink-soft">Built from your week&rsquo;s plan.</p>
      </div>
      <EmptyState
        icon="🛒"
        title="The shopping list generator is coming in phase 4"
        description="One button pulls every ingredient from the week's planned recipes, adds up duplicates and groups them by aisle."
      />
    </div>
  );
}
