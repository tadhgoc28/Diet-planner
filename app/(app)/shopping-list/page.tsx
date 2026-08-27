import { Suspense } from "react";
import type { Metadata } from "next";
import { ShoppingListView } from "@/components/shopping/ShoppingListView";

export const metadata: Metadata = { title: "Shopping list · MealBoard" };

export default function ShoppingListPage() {
  return (
    <Suspense fallback={null}>
      <ShoppingListView />
    </Suspense>
  );
}
