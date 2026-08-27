import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Planner · MealBoard" };

export default function PlannerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-ink">Weekly planner</h1>
        <p className="text-sm text-ink-soft">Drag recipes onto the week.</p>
      </div>
      <EmptyState
        icon="🗓️"
        title="The planner is coming in phase 3"
        description="A 7-day calendar with breakfast, lunch and dinner slots you fill by dragging recipe cards."
      />
    </div>
  );
}
