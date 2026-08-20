create table if not exists public.app_settings (
  workspace_key text primary key,
  settings_json jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.sales_events (
  id bigint generated always as identity primary key,
  workspace_key text not null,
  order_id text not null unique,
  sale_date date not null,
  subtotal numeric(10,2) not null,
  tip numeric(10,2) not null,
  total numeric(10,2) not null,
  note text not null default '',
  item_count integer not null default 0,
  items_json jsonb not null,
  created_at timestamptz not null default now(),
  user_name text
);

alter table public.app_settings enable row level security;
alter table public.sales_events enable row level security;

drop policy if exists "public app settings access" on public.app_settings;
create policy "public app settings access"
on public.app_settings
for all
using (true)
with check (true);

drop policy if exists "public sales access" on public.sales_events;
create policy "public sales access"
on public.sales_events
for all
using (true)
with check (true);

create index if not exists sales_events_workspace_date_idx
on public.sales_events (workspace_key, sale_date desc);

-- Admin flag for Supabase Auth users. Only an admin's own row is readable;
-- there is no public write policy, so is_admin can only be set via the
-- dashboard, the CLI, or the service_role key.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile"
on public.profiles
for select
using (auth.uid() = id);

-- Named (no-password) users for the guest/host name login. Public policies
-- match the rest of this app's personal-project security model.
create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  created_at timestamptz not null default now()
);

alter table public.app_users enable row level security;

drop policy if exists "public app users access" on public.app_users;
create policy "public app users access"
on public.app_users
for all
using (true)
with check (true);

-- Per-user menu card ordering. user_id holds either an app_users.id (name
-- login) or a Supabase Auth user id (admin login), so it is intentionally
-- not foreign-keyed to either table.
create table if not exists public.user_item_order (
  user_id uuid primary key,
  item_order jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_item_order enable row level security;

drop policy if exists "public user item order access" on public.user_item_order;
create policy "public user item order access"
on public.user_item_order
for all
using (true)
with check (true);
