import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

const FEATURES = [
  {
    emoji: "📖",
    title: "Keep every recipe in one place",
    body: "Save recipes with photos, ingredients and steps. Tag them by cuisine, diet and meal so they're easy to find later.",
  },
  {
    emoji: "🗓️",
    title: "Plan the week by dragging",
    body: "Drop recipes into breakfast, lunch and dinner slots on a simple weekly calendar. Swap or clear a meal in a click.",
  },
  {
    emoji: "🛒",
    title: "Shop from an auto-built list",
    body: "Turn the week's plan into one categorized shopping list, with duplicate ingredients added up for you.",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          {user ? (
            <Button href="/recipes" size="sm">
              Open MealBoard
            </Button>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button href="/signup" size="sm">
                Sign up
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
          <div>
            <p className="mb-3 inline-block rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-sage">
              Recipes · Planner · Shopping list
            </p>
            <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
              Your recipes, gathered and planned into an easy week.
            </h1>
            <p className="mt-4 max-w-md text-lg text-ink-soft">
              MealBoard is a calm little kitchen companion: collect the recipes
              you actually cook, plan them across the week, and walk into the
              shop with the list already made.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href={user ? "/recipes" : "/signup"} size="lg">
                {user ? "Go to your recipes" : "Get started — it's free"}
              </Button>
              {!user && (
                <Button href="/login" variant="secondary" size="lg">
                  I already have an account
                </Button>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
              <div className="mb-4 h-40 rounded-xl bg-gradient-to-br from-terracotta-soft via-surface-muted to-sage-soft" />
              <div className="space-y-2">
                <div className="h-3 w-2/3 rounded-full bg-surface-muted" />
                <div className="h-3 w-1/2 rounded-full bg-surface-muted" />
                <div className="mt-4 flex gap-2">
                  <span className="rounded-full bg-terracotta-soft px-2.5 py-1 text-xs text-terracotta-dark">
                    Italian
                  </span>
                  <span className="rounded-full bg-sage-soft px-2.5 py-1 text-xs text-sage">
                    Vegetarian
                  </span>
                  <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs text-ink-soft">
                    Dinner
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 pb-20 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-[var(--shadow-card)]"
            >
              <div className="text-3xl">{f.emoji}</div>
              <h3 className="mt-3 text-lg text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-line py-8 text-center text-sm text-ink-soft">
        <p>
          MealBoard — a personal recipe &amp; meal planner.{" "}
          <Link href="/signup" className="text-terracotta-dark underline">
            Create your board
          </Link>
        </p>
      </footer>
    </div>
  );
}
