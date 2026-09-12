-- MealBoard schema, step 3 of 3: give every new account a profile row.
--
-- This fires for email and password sign up and for Google sign in alike, so
-- the app never has to handle a missing profile. Google puts the display name
-- and photo in raw_user_meta_data under slightly different keys depending on
-- the provider version, hence the coalesce.
--
-- The body is wrapped in an exception handler on purpose. A failure in here
-- would otherwise roll back the auth.users insert and break sign up outright.
-- A signed in user with no profile row is recoverable (the app upserts one
-- during onboarding), a user who cannot sign up at all is not.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  )
  on conflict (id) do nothing;

  return new;
exception
  when others then
    raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
