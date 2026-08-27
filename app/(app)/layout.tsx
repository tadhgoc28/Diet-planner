import { AppNav } from "@/components/AppNav";
import { Toaster } from "@/components/ui/Toaster";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
      <p className="pb-8 text-center text-xs text-ink-soft">
        MealBoard keeps everything in this browser — nothing is uploaded.
      </p>
      <Toaster />
    </div>
  );
}
