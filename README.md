# MealBoard

A personal recipe & meal-planning app. Save recipes, tag them, drag them into a
weekly planner, and auto-generate a categorized shopping list for the week.

Built with **Next.js 16** (App Router, Route Handlers), **Prisma + SQLite**,
**Tailwind CSS v4**, and JWT cookie sessions.

> **Build status:** Phase 1 (project scaffold + email/password auth) is complete.
> Recipes, planner and shopping list are being added feature by feature — see
> _Roadmap_ below.

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
    recipes/  planner/  shopping-list/
  api/auth/                signup · login · logout · me  (Route Handlers)
components/
  ui/                      Button, Card, Field/Input, Spinner, EmptyState, …
  AppNav.tsx  Logo.tsx
lib/
  prisma.ts                PrismaClient singleton
  auth.ts                  password hashing, JWT sign/verify, getCurrentUser()
  session.ts               session cookie config
  validation.ts            zod schemas + error flattening
  tags.ts                  tag vocab + JSON-string column helpers
  http.ts / api.ts         server error envelope / client fetch helper
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
- [ ] **Phase 2** — recipe CRUD, grid + search, detail view with servings scaler
- [ ] **Phase 3** — weekly drag-and-drop planner
- [ ] **Phase 4** — shopping list generator (aggregate + categorize)

Deliberately out of scope for now: social sharing, nutrition info, meal-plan
templates. The data model leaves room for them.
