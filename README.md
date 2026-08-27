# MealBoard

A personal recipe & meal-planning app. Save recipes, tag them, drag them into a
weekly planner, and auto-generate a categorized shopping list for the week.

Built with **Next.js 16** (App Router, Route Handlers), **Prisma + SQLite**,
**Tailwind CSS v4**, and JWT cookie sessions.

> **Build status:** all four phases complete — auth, recipe management, weekly
> planner, and the shopping-list generator.

---

## Prerequisites

- **Node.js 20.9+** (Next.js 16 requirement)
- npm

## Setup

```bash
# 1. Install dependencies (also runs `prisma generate` via postinstall)
npm install

# 2. Create your environment file
cp .env.example .env
#   then edit .env — at minimum set a long random JWT_SECRET:
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Create the database and run migrations
npm run db:migrate

# 4. Seed sample data (1 demo user + 6 recipes)
npm run db:seed

# 5. Start the dev server
npm run dev
```

Open <http://localhost:3000>.

### Demo login

The seed script creates:

| Email                | Password       |
| -------------------- | -------------- |
| `demo@mealboard.app` | `mealboard123` |

Or create your own account at `/signup`.

## Environment variables

| Variable       | Required | Description                                                                    |
| -------------- | -------- | ---------------------------------------------------------------------------- |
| `DATABASE_URL` | yes      | Prisma connection string. Default `file:./dev.db` (SQLite at `prisma/dev.db`). |
| `JWT_SECRET`   | yes      | Secret used to sign session JWTs. Use a long random string.                   |

## Scripts

| Script             | What it does                                              |
| ------------------ | -------------------------------------------------------- |
| `npm run dev`      | Start the dev server (Turbopack)                          |
| `npm run build`    | Production build                                          |
| `npm start`        | Serve the production build                                |
| `npm run lint`     | ESLint                                                    |
| `npm run typecheck`| `tsc --noEmit`                                            |
| `npm run db:migrate`| Create/apply migrations (`prisma migrate dev`)           |
| `npm run db:seed`  | Seed the demo user + recipes                              |
| `npm run db:reset` | Drop, re-migrate and re-seed the database                 |
| `npm run db:studio`| Open Prisma Studio                                        |

## Project structure

```
app/
  page.tsx                 Landing page (public)
  (auth)/                  login / signup (redirects to app if already signed in)
  (app)/                   Signed-in area — layout verifies the session
    recipes/               list · new · [id] (detail) · [id]/edit
    planner/               weekly board (?week=YYYY-MM-DD)
    shopping-list/          generated list (?week=YYYY-MM-DD)
  api/auth/                signup · login · logout · me  (Route Handlers)
  api/recipes/             GET list / POST create · [id] GET/PATCH/DELETE
  api/planner/             GET ?weekStart / POST upsert · [id] DELETE
  api/shopping-list/       GET ?weekStart / DELETE ?onlyChecked · [id] PATCH
                           · generate POST ?weekStart
components/
  ui/                      Button, Card, Field/Input, Modal, Tag, Skeleton, Toaster, …
  recipes/                 RecipeListView, RecipeCard, RecipeForm (+ Ingredient/
                           Instruction rows), RecipeDetailView, ServingsAdjuster
  planner/                 PlannerBoard, WeekGrid, WeekNav, RecipePicker,
                           DaySlot, PlannerSlotModal
  shopping/                ShoppingListView
  AppNav.tsx  Logo.tsx
lib/
  prisma.ts                PrismaClient singleton
  auth.ts                  password hashing, JWT sign/verify, getCurrentUser()
  session.ts               session cookie config
  validation.ts            zod schemas (auth + recipe + planner) + error flattening
  tags.ts                  tag vocab + JSON-string column helpers
  recipe.ts / recipe-server.ts  DTO serializers / owned-recipe loader
  planner.ts               planner DTO serializer + slot-id helpers
  week.ts                  date-key week maths (timezone-free)
  scale.ts                 servings scaling + quantity formatting
  aggregate.ts             combine + sum ingredients across planned recipes
  categorize.ts            keyword → aisle category (best-effort)
  shopping.ts              shopping-item DTO + checked-carryover identity
  http.ts / api.ts / swr.ts     server error envelope / client fetch / SWR fetcher
proxy.ts                   Route-protection UX (Next 16's renamed `middleware`)
prisma/
  schema.prisma  seed.ts  migrations/
```

## Auth model

- Passwords hashed with bcrypt; session is a signed JWT in an `httpOnly` cookie.
- `proxy.ts` does a cheap cookie check to redirect between the auth pages and the
  app — it is **not** the security boundary.
- Every Route Handler and the `(app)` layout independently verify the session
  with `getCurrentUser()` and check ownership before returning data.

## Notes on the stack

- **SQLite** has no array/enum columns, so tag lists are stored as JSON strings
  (`lib/tags.ts` has the helpers) and "enums" are validated strings.
  Switching to PostgreSQL later is a `provider` + `DATABASE_URL` change plus a
  fresh migration.
- **Next.js 16** specifics used here: the `middleware`→`proxy` rename, async
  `cookies()`, and Promise-typed route `params`.

## Roadmap

- [x] **Phase 1** — scaffold + email/password auth
- [x] **Phase 2** — recipe CRUD, grid + search/filter, detail view with servings
      scaler, add/edit form with dynamic + reorderable rows, delete confirmation
- [x] **Phase 3** — weekly planner: 7×3 grid, drag recipes from the sidebar onto
      a slot (or "+ add meal" for a no-drag path), click a planned meal to
      swap/remove, prev/next/this-week nav synced to `?week=`
- [x] **Phase 4** — shopping list: one button pulls every ingredient from the
      week's planned recipes, sums duplicates (same name + unit; different units
      stay separate), groups by aisle, checkboxes with "clear checked".
      Regenerating keeps items you've already ticked off.

## How the shopping list combines ingredients

- Names are normalized (lowercase, trimmed, lightly singularized) so `eggs` and
  `egg`, `tomatoes` and `tomato` merge.
- Lines are keyed by **name + unit**. Two recipes needing `2 tbsp olive oil`
  → `4 tbsp olive oil`. `1 clove garlic` + `2 cups garlic` would stay as two
  lines — no unit conversion is attempted.
- A missing quantity ("salt, to taste") contributes nothing to the sum; if every
  contribution for a line is missing, the line just shows no amount.
- `lib/categorize.ts` is a keyword matcher — deliberately rough. It won't be
  right for every item; that's expected.

Deliberately out of scope: social sharing, nutrition info, meal-plan templates,
recipe image file upload (URL only for now). The data model leaves room for them.
