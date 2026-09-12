-- MealBoard schema, step 2 of 3: row level security.
--
-- Every table is locked to the owning account. Two details worth knowing:
--
--   1. auth.uid() is wrapped in a scalar subquery, (select auth.uid()). Postgres
--      then evaluates it once per statement instead of once per row, and the
--      user_id index can still be used.
--   2. Child tables carry user_id AND re-check the parent row. Without the
--      parent check, a signed in user could insert an ingredient carrying their
--      own user_id but pointing at somebody else's recipe_id. They could never
--      read it back, but they should not be able to write it either.
--
-- Signed out visitors keep using localStorage and never touch Postgres, so the
-- anon role is stripped of table access entirely.

alter table public.profiles           enable row level security;
alter table public.recipes            enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.planner_entries    enable row level security;
alter table public.shopping_items     enable row level security;

-- ---------------------------------------------------------------- profiles --

create policy "profiles: read own"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "profiles: insert own"
  on public.profiles for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy "profiles: update own"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "profiles: delete own"
  on public.profiles for delete
  to authenticated
  using (id = (select auth.uid()));

-- ----------------------------------------------------------------- recipes --

create policy "recipes: read own"
  on public.recipes for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "recipes: insert own"
  on public.recipes for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "recipes: update own"
  on public.recipes for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "recipes: delete own"
  on public.recipes for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ------------------------------------------------------ recipe_ingredients --

create policy "recipe_ingredients: read own"
  on public.recipe_ingredients for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "recipe_ingredients: insert own"
  on public.recipe_ingredients for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.recipes r
      where r.id = recipe_id and r.user_id = (select auth.uid())
    )
  );

create policy "recipe_ingredients: update own"
  on public.recipe_ingredients for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.recipes r
      where r.id = recipe_id and r.user_id = (select auth.uid())
    )
  );

create policy "recipe_ingredients: delete own"
  on public.recipe_ingredients for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- --------------------------------------------------------- planner_entries --

create policy "planner_entries: read own"
  on public.planner_entries for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "planner_entries: insert own"
  on public.planner_entries for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.recipes r
      where r.id = recipe_id and r.user_id = (select auth.uid())
    )
  );

create policy "planner_entries: update own"
  on public.planner_entries for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.recipes r
      where r.id = recipe_id and r.user_id = (select auth.uid())
    )
  );

create policy "planner_entries: delete own"
  on public.planner_entries for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------- shopping_items --

create policy "shopping_items: read own"
  on public.shopping_items for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "shopping_items: insert own"
  on public.shopping_items for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "shopping_items: update own"
  on public.shopping_items for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "shopping_items: delete own"
  on public.shopping_items for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ------------------------------------------------------------------ grants --

revoke all on table public.profiles           from anon;
revoke all on table public.recipes            from anon;
revoke all on table public.recipe_ingredients from anon;
revoke all on table public.planner_entries    from anon;
revoke all on table public.shopping_items     from anon;

grant select, insert, update, delete on table public.profiles           to authenticated;
grant select, insert, update, delete on table public.recipes            to authenticated;
grant select, insert, update, delete on table public.recipe_ingredients to authenticated;
grant select, insert, update, delete on table public.planner_entries    to authenticated;
grant select, insert, update, delete on table public.shopping_items     to authenticated;
