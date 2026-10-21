-- Health App database setup. Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Row Level Security (RLS) makes sure people can only read and change their own data.

-- 1) Synced app data: one row per user per kind of data ('profile', 'foodlog').
create table if not exists public.user_data (
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null check (key in ('profile', 'foodlog')),
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.user_data enable row level security;

create policy "Read own data" on public.user_data
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own data" on public.user_data
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own data" on public.user_data
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own data" on public.user_data
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.user_data to authenticated;

-- 2) Restaurant reports: "they cook in olive oil ✅ / they use canola ❌".
-- Anyone can read them (they power "Confirmed by users"); only signed-in users can add, and only their own.
create table if not exists public.restaurant_reports (
  id uuid primary key default gen_random_uuid(),
  place_id text not null, -- Google Places ID
  place_name text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  criterion text not null check (criterion in ('seedOilFree', 'freshIngredients', 'sugarFree', 'noAddedSugar')),
  value boolean not null, -- true = confirms the place meets it, false = it doesn't
  updated_at timestamptz not null default now(),
  unique (place_id, user_id, criterion) -- one vote per person per question; changing your mind updates it
);

create index if not exists restaurant_reports_place_idx on public.restaurant_reports (place_id);

alter table public.restaurant_reports enable row level security;

create policy "Anyone can read reports" on public.restaurant_reports
  for select to anon, authenticated using (true);
create policy "Add own reports" on public.restaurant_reports
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Change own reports" on public.restaurant_reports
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Remove own reports" on public.restaurant_reports
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select on public.restaurant_reports to anon, authenticated;
grant insert, update, delete on public.restaurant_reports to authenticated;

-- 3) Account deletion (also available as 002_delete_account.sql for projects set up earlier).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
