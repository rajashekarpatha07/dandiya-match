-- =========================================================
-- TABLES
-- =========================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Dandiya Fan',
  avatar_url text,
  gender text check (gender in ('male','female','other')),
  age int check (age >= 18 and age <= 80),
  experience text check (experience in ('beginner','intermediate','pro')),
  bio text check (char_length(bio) <= 300),
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

-- Private. Readable by others only after an accepted match.
create table profile_contacts (
  user_id uuid primary key references profiles(id) on delete cascade,
  phone text,
  instagram text,
  updated_at timestamptz not null default now()
);

create table venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  address text,
  area text,
  lat double precision not null,
  lng double precision not null,
  entry_fee numeric,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table venue_events (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  event_date date not null,
  start_time time,
  end_time time,
  unique (venue_id, event_date)
);

create table partner_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  event_id uuid not null references venue_events(id) on delete cascade,
  note text check (char_length(note) <= 200),
  preferred_gender text not null default 'any'
    check (preferred_gender in ('any','male','female')),
  status text not null default 'open'
    check (status in ('open','matched','closed')),
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

create table match_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references venue_events(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  receiver_id uuid not null references profiles(id) on delete cascade,
  message text check (char_length(message) <= 200),
  status text not null default 'pending'
    check (status in ('pending','accepted','rejected','cancelled')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (sender_id <> receiver_id),
  unique (event_id, sender_id, receiver_id)
);

create table blocks (
  blocker_id uuid not null references profiles(id) on delete cascade,
  blocked_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  reported_id uuid not null references profiles(id) on delete cascade,
  event_id uuid references venue_events(id) on delete set null,
  reason text not null check (char_length(reason) <= 500),
  created_at timestamptz not null default now()
);

-- Indexes
create index on match_requests (sender_id, status);
create index on match_requests (receiver_id, status);
create index on match_requests (event_id, status);
create index on partner_listings (event_id, status);
create index on venue_events (event_date);

-- =========================================================
-- HELPER: today's date in India (DB runs in UTC)
-- =========================================================
create or replace function ist_today() returns date
language sql stable as $$
  select (now() at time zone 'Asia/Kolkata')::date
$$;

-- =========================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =========================================================
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Dandiya Fan'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table profiles         enable row level security;
alter table profile_contacts enable row level security;
alter table venues           enable row level security;
alter table venue_events     enable row level security;
alter table partner_listings enable row level security;
alter table match_requests   enable row level security;
alter table blocks           enable row level security;
alter table reports          enable row level security;

-- profiles: any signed-in user can read; only owner can update
create policy "profiles read" on profiles
  for select to authenticated using (true);
create policy "profiles update own" on profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- profile_contacts: owner full access; others only after accepted match
create policy "contacts own" on profile_contacts
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "contacts matched read" on profile_contacts
  for select to authenticated using (
    exists (
      select 1 from match_requests m
      where m.status = 'accepted'
        and ((m.sender_id = auth.uid() and m.receiver_id = profile_contacts.user_id)
          or (m.receiver_id = auth.uid() and m.sender_id = profile_contacts.user_id))
    )
  );

-- venues + events: read-only for signed-in users (writes via SQL editor/admin only)
create policy "venues read" on venues
  for select to authenticated using (is_active);
create policy "events read" on venue_events
  for select to authenticated using (true);

-- partner_listings: see open listings (excluding blocked either way) and your own
create policy "listings read" on partner_listings
  for select to authenticated using (
    user_id = auth.uid()
    or (
      status = 'open'
      and not exists (
        select 1 from blocks b
        where (b.blocker_id = auth.uid() and b.blocked_id = partner_listings.user_id)
           or (b.blocker_id = partner_listings.user_id and b.blocked_id = auth.uid())
      )
    )
  );
create policy "listings insert own" on partner_listings
  for insert to authenticated with check (user_id = auth.uid());
create policy "listings update own" on partner_listings
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "listings delete own" on partner_listings
  for delete to authenticated using (user_id = auth.uid());

-- match_requests: READ ONLY from client. All writes go through RPCs below.
create policy "requests read own" on match_requests
  for select to authenticated using (auth.uid() in (sender_id, receiver_id));

-- blocks
create policy "blocks own" on blocks
  for all to authenticated
  using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

-- reports: insert only
create policy "reports insert" on reports
  for insert to authenticated with check (reporter_id = auth.uid());

-- =========================================================
-- RPC: send_request
-- =========================================================
create or replace function send_request(
  p_event_id uuid, p_receiver_id uuid, p_message text default null
) returns match_requests
language plpgsql security definer set search_path = public as $$
declare
  v_sender uuid := auth.uid();
  v_date date;
  v_req match_requests;
begin
  if v_sender is null then raise exception 'Not authenticated'; end if;
  if v_sender = p_receiver_id then raise exception 'You cannot request yourself'; end if;

  select event_date into v_date from venue_events where id = p_event_id;
  if v_date is null or v_date < ist_today() then
    raise exception 'This event is not available';
  end if;

  if exists (
    select 1 from blocks
    where (blocker_id = v_sender and blocked_id = p_receiver_id)
       or (blocker_id = p_receiver_id and blocked_id = v_sender)
  ) then raise exception 'Not allowed'; end if;

  if not exists (select 1 from partner_listings
                 where user_id = v_sender and event_id = p_event_id and status = 'open') then
    raise exception 'Post your own listing for this event first';
  end if;

  if not exists (select 1 from partner_listings
                 where user_id = p_receiver_id and event_id = p_event_id and status = 'open') then
    raise exception 'This person is no longer available';
  end if;

  if (select count(*) from match_requests
      where sender_id = v_sender and event_id = p_event_id and status = 'pending') >= 5 then
    raise exception 'You can have at most 5 pending requests per event';
  end if;

  insert into match_requests (event_id, sender_id, receiver_id, message)
  values (p_event_id, v_sender, p_receiver_id, p_message)
  returning * into v_req;

  return v_req;
end; $$;

-- =========================================================
-- RPC: respond_to_request (receiver accepts or rejects)
-- =========================================================
create or replace function respond_to_request(p_request_id uuid, p_accept boolean)
returns match_requests
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_req match_requests;
begin
  if v_user is null then raise exception 'Not authenticated'; end if;

  select * into v_req from match_requests where id = p_request_id for update;
  if not found then raise exception 'Request not found'; end if;
  if v_req.receiver_id <> v_user then raise exception 'Only the receiver can respond'; end if;
  if v_req.status <> 'pending' then raise exception 'Request is no longer pending'; end if;

  if p_accept then
    -- both people must still be open for this event
    if (select count(*) from partner_listings
        where event_id = v_req.event_id
          and user_id in (v_req.sender_id, v_req.receiver_id)
          and status = 'open') < 2 then
      raise exception 'One of you is already matched for this event';
    end if;

    update match_requests
       set status = 'accepted', responded_at = now()
     where id = v_req.id returning * into v_req;

    update partner_listings set status = 'matched'
     where event_id = v_req.event_id
       and user_id in (v_req.sender_id, v_req.receiver_id);

    -- auto-cancel every other pending request involving either person for this event
    update match_requests
       set status = 'cancelled', responded_at = now()
     where event_id = v_req.event_id
       and status = 'pending'
       and id <> v_req.id
       and (sender_id in (v_req.sender_id, v_req.receiver_id)
         or receiver_id in (v_req.sender_id, v_req.receiver_id));
  else
    update match_requests
       set status = 'rejected', responded_at = now()
     where id = v_req.id returning * into v_req;
  end if;

  return v_req;
end; $$;

-- =========================================================
-- RPC: cancel_request (sender withdraws a pending request)
-- =========================================================
create or replace function cancel_request(p_request_id uuid)
returns match_requests
language plpgsql security definer set search_path = public as $$
declare v_req match_requests;
begin
  update match_requests
     set status = 'cancelled', responded_at = now()
   where id = p_request_id and sender_id = auth.uid() and status = 'pending'
  returning * into v_req;
  if not found then raise exception 'Nothing to cancel'; end if;
  return v_req;
end; $$;

-- =========================================================
-- RPC: unmatch (either person undoes an accepted match)
-- Reopens both listings, closes the request so contacts are hidden again
-- =========================================================
create or replace function unmatch(p_request_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare v_req match_requests;
begin
  select * into v_req from match_requests
   where id = p_request_id and status = 'accepted'
     and auth.uid() in (sender_id, receiver_id) for update;
  if not found then raise exception 'Match not found'; end if;

  update match_requests set status = 'cancelled', responded_at = now() where id = v_req.id;
  update partner_listings set status = 'open'
   where event_id = v_req.event_id and user_id in (v_req.sender_id, v_req.receiver_id);
end; $$;

-- Lock down RPC execution
revoke all on function send_request(uuid, uuid, text)    from public, anon;
revoke all on function respond_to_request(uuid, boolean) from public, anon;
revoke all on function cancel_request(uuid)              from public, anon;
revoke all on function unmatch(uuid)                     from public, anon;
grant execute on function send_request(uuid, uuid, text)    to authenticated;
grant execute on function respond_to_request(uuid, boolean) to authenticated;
grant execute on function cancel_request(uuid)              to authenticated;
grant execute on function unmatch(uuid)                     to authenticated;

-- =========================================================
-- REALTIME (in-app notifications)
-- =========================================================
alter publication supabase_realtime add table match_requests;
