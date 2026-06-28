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
  created_at timestamptz not null default now()
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
