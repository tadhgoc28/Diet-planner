import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <Button href="/recipes" size="sm">
          Open MealBoard
        </Button>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="bento-grid">
          {/* Headline */}
          <section className="col-span-2 flex flex-col justify-between gap-8 rounded-[var(--radius-tile)] bg-ink p-7 text-[color:var(--color-surface)] md:col-span-2 md:row-span-2 md:p-9">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-medium tracking-wide text-white/70">
              Recipes · Planner · Shopping list
            </p>
            <div>
              <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl md:text-[3.4rem]">
                Your recipes,
                <br />
                <span className="text-terracotta">planned</span> into an
                <br />
                easy week.
              </h1>
              <p className="mt-5 max-w-md text-base text-white/70">
                A calm kitchen companion: collect the recipes you actually cook,
                drag them across the week, and walk into the shop with the list
                already made.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/recipes" size="lg">
                Open MealBoard
              </Button>
              <span className="self-center text-xs text-white/50">
                No sign-up — your data stays in this browser.
              </span>
            </div>
          </section>

          {/* Collect */}
          <section className="col-span-2 rounded-[var(--radius-tile)] border border-line bg-[color:var(--color-butter-soft)] p-6">
            <div className="text-3xl">📖</div>
            <h2 className="mt-3 font-display text-xl font-semibold text-ink">
              Keep every recipe in one place
            </h2>
            <p className="mt-1.5 text-sm text-ink-soft">
              Photos, ingredients and steps. Tag by cuisine, diet and meal so
              they’re easy to find. A live servings slider scales the quantities.
            </p>
          </section>

          {/* Plan */}
          <section className="col-span-1 flex flex-col justify-between rounded-[var(--radius-tile)] bg-sage p-6 text-[color:var(--color-sage-soft)]">
            <div className="text-3xl">🗓️</div>
            <div className="mt-6">
              <h2 className="font-display text-lg font-semibold text-white">
                Plan by dragging
              </h2>
              <p className="mt-1 text-sm text-white/70">
                Drop recipes into breakfast, lunch and dinner slots.
              </p>
            </div>
          </section>

          {/* Shop */}
          <section className="col-span-1 flex flex-col justify-between rounded-[var(--radius-tile)] border border-line bg-surface p-6">
            <div className="text-3xl">🛒</div>
            <div className="mt-6">
              <h2 className="font-display text-lg font-semibold text-ink">
                Auto shopping list
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Duplicates added up, grouped by aisle.
              </p>
            </div>
          </section>

          {/* Faux recipe card */}
          <section className="col-span-2 rounded-[var(--radius-tile)] border border-line bg-[color:var(--color-terracotta-soft)] p-4">
            <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
              <div className="mb-3 h-28 rounded-[var(--radius-sm)] bg-gradient-to-br from-[color:var(--color-butter-soft)] via-surface-muted to-[color:var(--color-sage-soft)]" />
              <div className="h-3 w-2/3 rounded-full bg-surface-muted" />
              <div className="mt-2 h-3 w-1/2 rounded-full bg-surface-muted" />
              <div className="mt-3 flex flex-wrap gap-1.5">
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
          </section>

          {/* How it works */}
          <section className="col-span-2 rounded-[var(--radius-tile)] border border-line bg-surface p-6">
            <h2 className="font-display text-lg font-semibold text-ink">
              How it works
            </h2>
            <ol className="mt-3 space-y-2 text-sm text-ink-soft">
              {[
                "Add recipes (6 samples are already there to explore).",
                "Drag them onto the weekly planner.",
                "Generate the shopping list and tick things off in-store.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-[color:var(--color-surface)]">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>

      <footer className="border-t border-line py-8 text-center text-sm text-ink-soft">
        <p>
          MealBoard — a personal recipe &amp; meal planner.{" "}
          <Link href="/recipes" className="font-medium text-terracotta-dark underline">
            Start cooking
          </Link>
        </p>
      </footer>
    </div>
  );
}
