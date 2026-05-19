-- Beat-a-Friend schema

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text not null,
  avatar_url text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Groups
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null, -- short code e.g. "AMIGOS2026"
  mode text not null check (mode in ('basic', 'pro')),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  yappy_number text not null,
  apodo_primero text not null default 'El Profeta',
  apodo_ultimo text not null default 'El Ciego',
  premio_castigo text,
  created_at timestamptz default now()
);

-- Group members
create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'active' check (status in ('active', 'pending_payment', 'warned', 'banned')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'confirmed')),
  warning_deadline timestamptz,
  apodo text,
  points integer not null default 0,
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- Matches (seeded manually + updated from football API for results)
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  api_id integer unique,           -- nullable: used only for result sync via API
  home_team text not null,
  away_team text not null,
  home_flag text not null default '🏳️',
  away_flag text not null default '🏳️',
  stage text not null check (stage in ('group', 'round_of_32', 'round_of_16', 'quarter', 'semi', 'third', 'final')),
  group_letter text,               -- A-L for group stage, null for knockouts
  match_date timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'finished')),
  home_score integer,
  away_score integer,
  created_at timestamptz default now()
);

-- Predictions
create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade not null,
  match_id uuid references public.matches(id) on delete cascade not null,
  prediction text check (prediction in ('1', 'X', '2')), -- basic mode
  home_pred integer,  -- pro mode
  away_pred integer,  -- pro mode
  points_earned integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, group_id, match_id)
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at on predictions
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger predictions_updated_at
  before update on public.predictions
  for each row execute procedure update_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;

-- Profiles: anyone reads, only owner writes
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Groups: members can read their groups
create policy "groups_select" on public.groups for select using (
  exists (select 1 from public.group_members where group_id = groups.id and user_id = auth.uid())
  or owner_id = auth.uid()
);
create policy "groups_insert" on public.groups for insert with check (owner_id = auth.uid());

-- Group members: members see their group
create policy "members_select" on public.group_members for select using (
  exists (select 1 from public.group_members gm where gm.group_id = group_members.group_id and gm.user_id = auth.uid())
);
create policy "members_insert" on public.group_members for insert with check (user_id = auth.uid());

-- Matches: public read
create policy "matches_select" on public.matches for select using (true);

-- Predictions: user sees own, group members see group's after match
create policy "predictions_select" on public.predictions for select using (
  user_id = auth.uid()
  or exists (
    select 1 from public.matches m
    join public.group_members gm on gm.group_id = predictions.group_id
    where m.id = predictions.match_id
    and gm.user_id = auth.uid()
    and m.status = 'finished'
  )
);
create policy "predictions_insert" on public.predictions for insert with check (user_id = auth.uid());
create policy "predictions_update" on public.predictions for update using (
  user_id = auth.uid()
  and exists (
    select 1 from public.matches m
    where m.id = predictions.match_id and m.status = 'scheduled'
  )
);

-- Migration: add apodos to existing groups
-- alter table public.groups add column if not exists apodo_primero text not null default 'El Profeta';
-- alter table public.groups add column if not exists apodo_ultimo text not null default 'El Ciego';
-- alter table public.groups add column if not exists premio_castigo text;
