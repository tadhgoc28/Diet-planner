import { Suspense } from "react";
import type { Metadata } from "next";
import { PlannerBoard } from "@/components/planner/PlannerBoard";

export const metadata: Metadata = { title: "Planner · MealBoard" };

export default function PlannerPage() {
  return (
    <Suspense fallback={null}>
      <PlannerBoard />
    </Suspense>
  );
}
