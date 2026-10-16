-- Add admin role to profiles
alter table profiles add column is_admin boolean not null default false;

-- Grant admin users full access to venues table
create policy "admin venues all" on venues
  for all to authenticated
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  )
  with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Grant admin users full access to venue_events table
create policy "admin events all" on venue_events
  for all to authenticated
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  )
  with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- RPC: Check if current user is admin
create or replace function is_admin()
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid() and is_admin = true
  );
end; $$;

grant execute on function is_admin() to authenticated;

-- Note: To make a user admin, run this SQL in Supabase SQL Editor:
-- update profiles set is_admin = true where id = 'USER_UUID_HERE';
