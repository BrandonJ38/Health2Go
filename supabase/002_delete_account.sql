-- Account deletion (required by the App Store and Google Play). Run once in Supabase SQL Editor.
-- Lets a signed-in user delete only their own account. Their synced data (user_data) and
-- restaurant reports are removed automatically via "on delete cascade".
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
