-- =====================================================================
-- LifeDrop – Blood Donation Network : complete schema, RLS and helpers
-- Run in the Supabase SQL editor (or `supabase db push`).
-- =====================================================================

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------------------------------------------------------------- tables
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null check (char_length(full_name) between 2 and 80),
  email        text not null,
  phone        text check (phone is null or phone ~ '^[6-9][0-9]{9}$'),
  avatar_url   text,
  role         text not null default 'user' check (role in ('user','donor')),
  is_suspended boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.admin_roles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.donors (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null unique references public.profiles(id) on delete cascade,
  blood_group        text not null check (blood_group in ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  date_of_birth      date,
  gender             text check (gender in ('male','female','other')),
  last_donation_date date check (last_donation_date is null or last_donation_date <= current_date),
  availability       text not null default 'available' check (availability in ('available','unavailable')),
  state              text not null,
  city               text not null,
  area               text not null default '',
  pin_code           text not null check (pin_code ~ '^[1-9][0-9]{5}$'),
  bio                text check (bio is null or char_length(bio) <= 300),
  show_in_public     boolean not null default false,
  show_phone         boolean not null default false,
  is_verified        boolean not null default false,
  status             text not null default 'active' check (status in ('active','removed')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create or replace function public.gen_request_code()
returns text language sql as $$
  select 'LD-' || upper(substr(md5(gen_random_uuid()::text), 1, 8))
$$;

create table public.blood_requests (
  id               uuid primary key default gen_random_uuid(),
  request_code     text not null unique default public.gen_request_code(),
  requester_id     uuid not null references public.profiles(id) on delete cascade,
  patient_name     text not null,
  blood_group      text not null check (blood_group in ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  hospital_name    text not null,
  hospital_address text not null,
  state            text not null,
  city             text not null,
  pin_code         text not null check (pin_code ~ '^[1-9][0-9]{5}$'),
  units            int  not null check (units between 1 and 20),
  required_date    date not null,
  contact_person   text not null,
  contact_number   text not null check (contact_number ~ '^[6-9][0-9]{9}$'),
  priority         text not null default 'normal' check (priority in ('normal','urgent','critical')),
  status           text not null default 'open' check (status in ('open','fulfilled','cancelled','removed')),
  message          text check (message is null or char_length(message) <= 500),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  request_id uuid references public.blood_requests(id) on delete cascade,
  type       text not null default 'blood_request' check (type in ('blood_request','donor_response','system')),
  title      text not null,
  body       text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.donor_responses (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid not null references public.blood_requests(id) on delete cascade,
  donor_user_id uuid not null references public.profiles(id) on delete cascade,
  response      text not null check (response in ('interested','declined')),
  message       text check (message is null or char_length(message) <= 300),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (request_id, donor_user_id)
);

create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 2 and 80),
  email      text not null,
  subject    text not null check (char_length(subject) between 3 and 120),
  message    text not null check (char_length(message) between 10 and 2000),
  status     text not null default 'new' check (status in ('new','resolved')),
  created_at timestamptz not null default now()
);

-- --------------------------------------------------------------- indexes
create index donors_blood_group_idx   on public.donors (blood_group);
create index donors_city_idx          on public.donors (lower(city));
create index donors_state_idx         on public.donors (lower(state));
create index donors_pin_idx           on public.donors (pin_code);
create index donors_listing_idx       on public.donors (show_in_public, status, availability);
create index requests_group_idx       on public.blood_requests (blood_group);
create index requests_city_idx        on public.blood_requests (lower(city));
create index requests_status_idx      on public.blood_requests (status, created_at desc);
create index requests_requester_idx   on public.blood_requests (requester_id);
create index notifications_user_idx   on public.notifications (user_id, is_read, created_at desc);
create index responses_request_idx    on public.donor_responses (request_id);
create index contact_status_idx       on public.contact_messages (status, created_at desc);

-- ----------------------------------------------------- helper functions
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_roles where user_id = auth.uid())
$$;

create or replace function public.is_active_user()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and not is_suspended)
$$;

-- ---------------------------------------------------- updated_at triggers
create trigger trg_profiles_updated  before update on public.profiles        for each row execute function public.set_updated_at();
create trigger trg_donors_updated    before update on public.donors          for each row execute function public.set_updated_at();
create trigger trg_requests_updated  before update on public.blood_requests  for each row execute function public.set_updated_at();
create trigger trg_responses_updated before update on public.donor_responses for each row execute function public.set_updated_at();

-- ------------------------------------- column protection (non-admins)
-- Service-role calls (backend) have auth.uid() = null and are not restricted.
create or replace function public.protect_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.is_suspended := old.is_suspended;
    new.email := old.email;
  end if;
  return new;
end $$;
create trigger trg_protect_profile before update on public.profiles for each row execute function public.protect_profile();

create or replace function public.protect_donor()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.user_id := old.user_id;
    new.is_verified := old.is_verified;
    new.status := old.status;
    if new.blood_group <> old.blood_group then new.is_verified := false; end if;
  end if;
  return new;
end $$;
create trigger trg_protect_donor before update on public.donors for each row execute function public.protect_donor();

create or replace function public.protect_request()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.requester_id := old.requester_id;
    new.request_code := old.request_code;
    if old.status = 'removed' then new.status := 'removed'; end if;
    if new.status not in ('open','fulfilled','cancelled','removed') then
      raise exception 'Invalid status';
    end if;
    if new.status = 'removed' and old.status <> 'removed' then
      raise exception 'Only administrators can remove a request';
    end if;
  end if;
  return new;
end $$;
create trigger trg_protect_request before update on public.blood_requests for each row execute function public.protect_request();

-- ---------------------------------- create profile (+ donor) on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  r text := case when meta->>'role' = 'donor' then 'donor' else 'user' end;
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (new.id,
          coalesce(nullif(meta->>'full_name',''), split_part(new.email,'@',1)),
          new.email, nullif(meta->>'phone',''), r);

  if r = 'donor' then
    insert into public.donors (user_id, blood_group, date_of_birth, gender, last_donation_date, availability,
                               state, city, area, pin_code, bio, show_in_public, show_phone)
    values (new.id, meta->>'blood_group', nullif(meta->>'date_of_birth','')::date, nullif(meta->>'gender',''),
            nullif(meta->>'last_donation_date','')::date,
            coalesce(nullif(meta->>'availability',''), 'available'),
            meta->>'state', meta->>'city', coalesce(meta->>'area',''), meta->>'pin_code',
            nullif(meta->>'bio',''),
            coalesce((meta->>'show_in_public')::boolean, false),
            coalesce((meta->>'show_phone')::boolean, false));
  end if;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- --------------------------- notify requester when a donor responds
create or replace function public.notify_requester_on_response()
returns trigger language plpgsql security definer set search_path = public as $$
declare req record; donor_name text;
begin
  if tg_op = 'UPDATE' and old.response = new.response then return new; end if;
  if new.response = 'interested' then
    select requester_id, request_code, blood_group into req from public.blood_requests where id = new.request_id;
    select full_name into donor_name from public.profiles where id = new.donor_user_id;
    insert into public.notifications (user_id, request_id, type, title, body)
    values (req.requester_id, new.request_id, 'donor_response',
            'A donor responded to ' || req.request_code,
            donor_name || ' expressed interest in your ' || req.blood_group ||
            ' request. Open My Blood Requests to see their details. Eligibility must be confirmed by the hospital.');
  end if;
  return new;
end $$;
create trigger trg_notify_requester after insert or update of response on public.donor_responses
for each row execute function public.notify_requester_on_response();

-- -------------------------------------------------- RLS: enable on all
alter table public.profiles         enable row level security;
alter table public.admin_roles      enable row level security;
alter table public.donors           enable row level security;
alter table public.blood_requests   enable row level security;
alter table public.notifications    enable row level security;
alter table public.donor_responses  enable row level security;
alter table public.contact_messages enable row level security;

-- profiles
create policy profiles_select_own   on public.profiles for select using (id = auth.uid());
create policy profiles_select_admin on public.profiles for select using (public.is_admin());
create policy profiles_update_own   on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_update_admin on public.profiles for update using (public.is_admin());

-- admin_roles (users may only learn whether *they* are admin; writes: service role / SQL only)
create policy admin_roles_select_own on public.admin_roles for select using (user_id = auth.uid());

-- donors (public access happens ONLY through the public_donors view)
create policy donors_select_own   on public.donors for select using (user_id = auth.uid());
create policy donors_select_admin on public.donors for select using (public.is_admin());
create policy donors_insert_own   on public.donors for insert with check (user_id = auth.uid() and public.is_active_user());
create policy donors_update_own   on public.donors for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy donors_update_admin on public.donors for update using (public.is_admin());
create policy donors_delete_admin on public.donors for delete using (public.is_admin());

-- blood_requests (creation goes through the backend API so donors get notified)
create policy br_select_own      on public.blood_requests for select using (requester_id = auth.uid());
create policy br_select_admin    on public.blood_requests for select using (public.is_admin());
create policy br_select_notified on public.blood_requests for select using (
  exists (select 1 from public.notifications n where n.request_id = blood_requests.id and n.user_id = auth.uid()));
create policy br_update_own      on public.blood_requests for update using (requester_id = auth.uid()) with check (requester_id = auth.uid());
create policy br_update_admin    on public.blood_requests for update using (public.is_admin());
create policy br_delete_admin    on public.blood_requests for delete using (public.is_admin());

-- notifications (rows are created by the backend / triggers)
create policy notif_select_own on public.notifications for select using (user_id = auth.uid());
create policy notif_update_own on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notif_delete_own on public.notifications for delete using (user_id = auth.uid());

-- donor_responses (a donor may respond only to requests they were notified about)
create policy resp_select_own   on public.donor_responses for select using (donor_user_id = auth.uid());
create policy resp_select_admin on public.donor_responses for select using (public.is_admin());
create policy resp_insert_own   on public.donor_responses for insert with check (
  donor_user_id = auth.uid() and public.is_active_user() and
  exists (select 1 from public.notifications n where n.request_id = donor_responses.request_id and n.user_id = auth.uid()));
create policy resp_update_own   on public.donor_responses for update using (donor_user_id = auth.uid()) with check (donor_user_id = auth.uid());

-- contact_messages (inserted by the rate-limited backend; only admins can read)
create policy contact_select_admin on public.contact_messages for select using (public.is_admin());
create policy contact_update_admin on public.contact_messages for update using (public.is_admin());

-- ------------------------------------------------------- public views
-- Owner-run views expose ONLY whitelisted columns. Email, DOB, gender, contact numbers never appear.
create view public.public_donors as
select d.id, p.full_name, p.avatar_url, d.blood_group, d.state, d.city, d.area, d.pin_code,
       d.availability, d.last_donation_date, d.bio, d.is_verified,
       case when d.show_phone then p.phone end as phone,
       d.created_at
from public.donors d
join public.profiles p on p.id = d.user_id
where d.show_in_public and d.status = 'active' and not p.is_suspended;

create view public.public_blood_requests as
select id, request_code, blood_group, hospital_name, state, city, units, required_date,
       priority, status, left(message, 200) as message, created_at
from public.blood_requests
where status in ('open','fulfilled');

grant select on public.public_donors, public.public_blood_requests to anon, authenticated;

-- ------------------------------------------------------- RPC functions
create or replace function public.public_stats()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'total_donors',     (select count(*) from donors where status = 'active'),
    'available_donors', (select count(*) from donors where status = 'active' and availability = 'available'),
    'connections',      (select count(*) from donor_responses where response = 'interested'),
    'blood_requests',   (select count(*) from blood_requests where status <> 'removed'))
$$;
grant execute on function public.public_stats() to anon, authenticated;

create or replace function public.get_request_responses(p_request_id uuid)
returns table (donor_user_id uuid, full_name text, blood_group text, city text, phone text,
               response text, message text, responded_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not (exists (select 1 from blood_requests br where br.id = p_request_id and br.requester_id = auth.uid())
          or public.is_admin()) then
    raise exception 'Not allowed';
  end if;
  return query
    select r.donor_user_id, p.full_name, d.blood_group, d.city,
           case when r.response = 'interested' then p.phone end,
           r.response, r.message, r.created_at
    from donor_responses r
    join profiles p on p.id = r.donor_user_id
    left join donors d on d.user_id = r.donor_user_id
    where r.request_id = p_request_id
    order by r.created_at desc;
end $$;
revoke all on function public.get_request_responses(uuid) from public, anon;
grant execute on function public.get_request_responses(uuid) to authenticated;

-- ------------------------------------------------------------- storage
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
create policy avatars_read   on storage.objects for select using (bucket_id = 'avatars');
create policy avatars_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_update on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_delete on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
