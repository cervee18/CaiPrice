-- CaiPrice initial schema
-- Community-sourced supermarket price tracking.

-- ============================================================
-- Profiles (one per auth user, auto-created on signup)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by everyone"
  on public.profiles for select
  to authenticated, anon
  using (true);

create policy "users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Supermarkets
-- ============================================================
create table public.supermarkets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  chain text,
  area text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (name, area)
);

alter table public.supermarkets enable row level security;

create policy "supermarkets are readable by everyone"
  on public.supermarkets for select
  to authenticated, anon
  using (true);

create policy "authenticated users can add supermarkets"
  on public.supermarkets for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "creators can update their supermarkets"
  on public.supermarkets for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "creators can delete their supermarkets"
  on public.supermarkets for delete
  to authenticated
  using (created_by = auth.uid());

-- ============================================================
-- Products
-- ============================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  category text not null default 'other',
  size_value numeric(10,3) check (size_value is null or size_value > 0),
  size_unit text check (size_unit in ('kg', 'g', 'l', 'ml', 'unit', 'pack')),
  barcode text unique,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products are readable by everyone"
  on public.products for select
  to authenticated, anon
  using (true);

create policy "authenticated users can add products"
  on public.products for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "creators can update their products"
  on public.products for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "creators can delete their products"
  on public.products for delete
  to authenticated
  using (created_by = auth.uid());

-- ============================================================
-- Price reports (append-only crowdsourced observations)
-- ============================================================
create table public.price_reports (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  supermarket_id uuid not null references public.supermarkets(id) on delete cascade,
  price numeric(8,2) not null check (price > 0),
  is_offer boolean not null default false,
  note text,
  reported_by uuid references public.profiles(id) on delete set null,
  reported_at timestamptz not null default now()
);

create index price_reports_latest_idx
  on public.price_reports (product_id, supermarket_id, reported_at desc);

alter table public.price_reports enable row level security;

create policy "price reports are readable by everyone"
  on public.price_reports for select
  to authenticated, anon
  using (true);

create policy "authenticated users can report prices"
  on public.price_reports for insert
  to authenticated
  with check (reported_by = auth.uid());

create policy "reporters can delete their reports"
  on public.price_reports for delete
  to authenticated
  using (reported_by = auth.uid());

-- ============================================================
-- Views
-- ============================================================

-- Latest known price per (product, supermarket)
create view public.current_prices
with (security_invoker = on) as
select distinct on (pr.product_id, pr.supermarket_id)
  pr.id,
  pr.product_id,
  pr.supermarket_id,
  pr.price,
  pr.is_offer,
  pr.note,
  pr.reported_by,
  pr.reported_at
from public.price_reports pr
order by pr.product_id, pr.supermarket_id, pr.reported_at desc;

-- Cheapest current price per product
create view public.best_prices
with (security_invoker = on) as
select distinct on (cp.product_id)
  cp.id,
  cp.product_id,
  cp.supermarket_id,
  cp.price,
  cp.is_offer,
  cp.reported_at
from public.current_prices cp
order by cp.product_id, cp.price asc, cp.reported_at desc;

-- Product list with best price, where to get it, and coverage
create view public.product_overview
with (security_invoker = on) as
select
  p.id,
  p.name,
  p.brand,
  p.category,
  p.size_value,
  p.size_unit,
  p.barcode,
  p.created_at,
  bp.price as best_price,
  bp.is_offer as best_price_is_offer,
  bp.reported_at as best_price_at,
  s.id as best_supermarket_id,
  s.name as best_supermarket_name,
  (select count(distinct cp.supermarket_id)
     from public.current_prices cp
    where cp.product_id = p.id) as store_count
from public.products p
left join public.best_prices bp on bp.product_id = p.id
left join public.supermarkets s on s.id = bp.supermarket_id;

-- Supermarket list with coverage and "cheapest here" counts
create view public.supermarket_overview
with (security_invoker = on) as
select
  s.id,
  s.name,
  s.chain,
  s.area,
  s.created_at,
  (select count(*)
     from public.current_prices cp
    where cp.supermarket_id = s.id) as prices_count,
  (select count(*)
     from public.best_prices bp
    where bp.supermarket_id = s.id) as best_count
from public.supermarkets s;
