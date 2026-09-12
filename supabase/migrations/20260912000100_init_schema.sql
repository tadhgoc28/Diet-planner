-- MealBoard schema, step 1 of 3: tables, constraints, indexes.
--
-- Notes on choices made here:
--   * Closed vocabularies are check constraints rather than Postgres enums.
--     Adding a value later is a one line ALTER instead of an enum migration,
--     and the TypeScript unions in lib/tags.ts stay the source of truth.
--   * cuisine and diet are free text at the database level. The app validates
--     them against CUISINES and DIETS with zod, so the lists can grow without
--     a migration.
--   * Recipe steps live in a jsonb array on recipes. They are always read and
--     written as one whole block and never queried individually.
--   * user_id is repeated on child tables. It makes every RLS policy a single
--     column comparison with no joins or subqueries.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- profiles --

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,

  -- Onboarding answers. All nullable: a brand new account has not answered yet.
  sex text check (sex in ('male', 'female')),
  age integer check (age between 13 and 120),
  height_cm numeric(6, 2) check (height_cm > 0 and height_cm < 300),
  weight_kg numeric(6, 2) check (weight_kg > 0 and weight_kg < 500),
  activity_level text check (
    activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')
  ),
  goal text check (goal in ('bulk', 'maintain', 'cut')),

  -- Targets derived from the answers above by lib/targets.ts and written back
  -- here so the planner can compare a day against them without recomputing.
  calorie_target integer check (calorie_target > 0),
  protein_target_g integer check (protein_target_g > 0),

  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per account. Holds the onboarding answers and the derived daily targets.';
comment on column public.profiles.sex is
  'Needed only for the Mifflin St Jeor constant. Not used for anything else.';

-- ----------------------------------------------------------------- recipes --

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  title text not null check (length(btrim(title)) between 1 and 160),
  description text not null default '' check (length(description) <= 2000),
  image_url text check (length(image_url) <= 2000),

  prep_time_minutes integer not null default 0
    check (prep_time_minutes between 0 and 100000),
  cook_time_minutes integer not null default 0
    check (cook_time_minutes between 0 and 100000),
  servings integer not null check (servings between 1 and 100),

  cuisine text check (length(cuisine) <= 60),
  diet text check (length(diet) <= 60),
  meal_types text[] not null default '{}'
    check (meal_types <@ array['breakfast', 'lunch', 'dinner', 'snack']::text[]),

  -- [{ "id": uuid, "stepNumber": 1, "text": "..." }, ...]
  steps jsonb not null default '[]'::jsonb
    check (jsonb_typeof(steps) = 'array' and jsonb_array_length(steps) <= 60),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recipes_user_updated_idx
  on public.recipes (user_id, updated_at desc);

-- ------------------------------------------------------ recipe_ingredients --

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,

  name text not null check (length(btrim(name)) between 1 and 120),

  -- What the cook reads and what the shopping list aggregates. Free text unit,
  -- so "2 cloves" and "1 pinch" still work.
  quantity numeric(10, 2) check (quantity > 0 and quantity <= 1000000),
  unit text check (length(unit) <= 30),

  -- What the macro maths uses. Null means this line is not counted, which the
  -- recipe view says out loud rather than quietly treating as zero.
  grams numeric(10, 2) check (grams > 0 and grams <= 100000),

  calories_per_100g numeric(8, 2) check (calories_per_100g >= 0 and calories_per_100g <= 1000),
  protein_per_100g  numeric(8, 2) check (protein_per_100g  >= 0 and protein_per_100g  <= 100),
  carbs_per_100g    numeric(8, 2) check (carbs_per_100g    >= 0 and carbs_per_100g    <= 100),
  fat_per_100g      numeric(8, 2) check (fat_per_100g      >= 0 and fat_per_100g      <= 100),

  sort_order integer not null default 0 check (sort_order >= 0)
);

-- "order" is awkward in raw SQL, hence sort_order. The app maps it to `order`.
create index recipe_ingredients_recipe_idx
  on public.recipe_ingredients (recipe_id, sort_order);
create index recipe_ingredients_user_idx
  on public.recipe_ingredients (user_id);

-- --------------------------------------------------------- planner_entries --

create table public.planner_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,

  entry_date date not null,
  meal_slot text not null check (meal_slot in ('breakfast', 'lunch', 'dinner')),

  created_at timestamptz not null default now(),

  -- One meal per slot per day. Planning over an occupied slot replaces it,
  -- which is what upsertPlanner already did in the browser version.
  unique (user_id, entry_date, meal_slot)
);

create index planner_entries_user_date_idx
  on public.planner_entries (user_id, entry_date);
create index planner_entries_recipe_idx
  on public.planner_entries (recipe_id);

-- ---------------------------------------------------------- shopping_items --

create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  week_start date not null,
  ingredient_name text not null check (length(btrim(ingredient_name)) between 1 and 200),
  quantity numeric(10, 2),
  unit text check (length(unit) <= 30),
  category text not null default 'Other',

  -- Which planned recipes contributed to this line. Plain uuid array, not a
  -- join table: it is display only and the whole week is rewritten on regenerate.
  source_recipe_ids uuid[] not null default '{}',

  checked boolean not null default false,
  created_at timestamptz not null default now()
);

create index shopping_items_user_week_idx
  on public.shopping_items (user_id, week_start);

-- ------------------------------------------------------- updated_at bumper --

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger recipes_touch_updated_at
  before update on public.recipes
  for each row execute function public.touch_updated_at();
