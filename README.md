# MealBoard

A personal recipe & meal-planning app. Save recipes, tag them, drag them into a
weekly planner, and auto-generate a categorized shopping list for the week.

Built with **Next.js 16** (App Router), **Tailwind CSS v4**, `@dnd-kit`, `zod`
and `swr`. **No accounts, no server database** — everything is stored in the
visitor's browser (`localStorage`).

---

## Setup

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. On the first visit, six sample recipes are seeded
into your browser so the app isn't empty. No environment variables, no database,
no migrations.

## Scripts

| Script              | What it does                    |
| ------------------- | ------------------------------- |
| `npm run dev`       | Start the dev server (Turbopack) |
| `npm run build`     | Production build                 |
| `npm start`         | Serve the production build       |
| `npm run lint`      | ESLint                           |
| `npm run typecheck` | `tsc --noEmit`                   |

## Where the data lives

There is no backend. `lib/localdb.ts` keeps a single JSON blob under the
`mealboard.v1` key in `localStorage` holding `{ recipes, planner, shopping }`.

The UI still "calls an API" the usual way — `apiFetch("/api/recipes")`,
`apiSend("/api/planner", "POST", …)` — but `lib/api.ts` is an **in-browser
router**: it parses the URL + method, validates the body with the same `zod`
schemas, reads/writes `localStorage` synchronously, and returns the same JSON
shapes the old server did. Because of that, the feature components and their
`swr` hooks were left essentially unchanged when the backend was removed.

Consequences to be aware of:

- Data is **per browser**. Nothing syncs between devices or browsers.
- Clearing site data / using a private window starts fresh.
- "Reset data" in the nav wipes storage and reseeds the six samples.

## Project structure

```
app/
  page.tsx                 Landing page
  (app)/
    layout.tsx             Nav + toaster (no auth)
    recipes/               list · new · [id] (detail) · [id]/edit  (all client)
    planner/               weekly board (?week=YYYY-MM-DD)
    shopping-list/         generated list (?week=YYYY-MM-DD)
components/
  ui/                      Button, Card, Field/Input, Modal, Tag, Skeleton, Toaster, …
  recipes/                 RecipeListView, RecipeCard, RecipeForm (+ Ingredient/
                           Instruction rows), RecipeDetailView, ServingsAdjuster,
                           DeleteRecipeButton, RecipeStates
  planner/                 PlannerBoard, WeekGrid, WeekNav, RecipePicker,
                           DaySlot, PlannerSlotModal
  shopping/                ShoppingListView
  AppNav.tsx  Logo.tsx
lib/
  localdb.ts               localStorage blob: load / save / seed / reset
  api.ts                   in-browser request router (replaces the server)
  seed-recipes.ts          the six sample recipes
  swr.ts                   SWR fetcher (calls apiFetch)
  validation.ts            zod schemas (recipe + planner + shopping)
  recipe.ts / planner.ts / shopping.ts   shared data types + small helpers
  tags.ts                  tag vocabularies
  week.ts                  date-key week maths (timezone-free)
  scale.ts                 servings scaling + quantity formatting
  aggregate.ts             combine + sum ingredients across planned recipes
  categorize.ts            keyword → aisle category (best-effort)
  cn.ts                    className helper
```

## Design

"Bento Bold" theme — warm parchment ground, near-black ink, a vivid poppy-orange
accent with butter-yellow and deep-pine tints, big rounded tiles with hairline
borders. Display type is **Bricolage Grotesque**, body is **Inter** (both via
`next/font`). Tokens live in `app/globals.css`.

## How the shopping list combines ingredients

- Names are normalized (lowercase, trimmed, lightly singularized) so `eggs` and
  `egg`, `tomatoes` and `tomato` merge.
- Lines are keyed by **name + unit**. Two recipes needing `2 tbsp olive oil`
  → `4 tbsp olive oil`. `1 clove garlic` + `2 cups garlic` stay as two lines —
  no unit conversion is attempted.
- A missing quantity ("salt, to taste") contributes nothing to the sum; if every
  contribution for a line is missing, the line just shows no amount.
- `lib/categorize.ts` is a keyword matcher — deliberately rough.

## Out of scope

Accounts / sync, social sharing, nutrition info, meal-plan templates, recipe
image file upload (image URL only).
