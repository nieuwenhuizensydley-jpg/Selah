-- ============================================
-- SELAH SALON BOOKING - SUPABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── BUSINESSES ──
create table if not exists businesses (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null default 'My Salon',
  phone text,
  address text,
  vat_no text,
  logo_url text,
  salon_type text default 'both',
  theme text default 'gold',
  setup_complete boolean default false,
  social_links jsonb default '{"instagram":"","facebook":"","tiktok":""}',
  currency text default 'R',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── CLIENTS ──
create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  surname text,
  mobile text,
  email text,
  dob text,
  address text,
  flags jsonb default '[]',
  alerts jsonb default '[]',
  notes jsonb default '[]',
  hair_records jsonb default '[]',
  beauty_records jsonb default '[]',
  photos jsonb default '[]',
  balance numeric default 0,
  referred_by text,
  join_date text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── APPOINTMENTS ──
create table if not exists appointments (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  client_name text,
  service text,
  addons jsonb default '[]',
  date text,
  time text,
  duration integer,
  price numeric,
  status text default 'confirmed',
  staff text default 'Owner',
  notes text,
  created_at timestamptz default now()
);

-- ── SERVICES ──
create table if not exists services (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  category text,
  duration integer,
  price numeric,
  buffer integer default 10,
  addons jsonb default '[]',
  created_at timestamptz default now()
);

-- ── INVENTORY ──
create table if not exists inventory (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  supplier text,
  cost numeric default 0,
  price numeric default 0,
  stock integer default 0,
  min_stock integer default 0,
  category text,
  created_at timestamptz default now()
);

-- ── SALES ──
create table if not exists sales (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  client_name text,
  items jsonb default '[]',
  extras jsonb default '[]',
  subtotal numeric default 0,
  discount numeric default 0,
  tip numeric default 0,
  total numeric default 0,
  payment text,
  status text default 'paid',
  paid_amount numeric,
  remaining numeric,
  date text,
  created_at timestamptz default now()
);

-- ── EXPENSES ──
create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  category text,
  description text,
  amount numeric,
  date text,
  created_at timestamptz default now()
);

-- ── STAFF ──
create table if not exists staff (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  role text,
  commission_rate numeric default 0,
  email text,
  mobile text,
  active boolean default true,
  created_at timestamptz default now()
);

-- ── NOTES ──
create table if not exists notes (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  text text,
  done boolean default false,
  pinned boolean default false,
  due_date text,
  date text,
  created_at timestamptz default now()
);

-- ── CASH UPS ──
create table if not exists cash_ups (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  cash_counted numeric,
  cash_expected numeric,
  card_total numeric,
  eft_total numeric,
  tips numeric,
  total_revenue numeric,
  notes text,
  closed_by text,
  date text,
  created_at timestamptz default now()
);

-- ── ROW LEVEL SECURITY ──
-- Each business can only see its own data

alter table businesses      enable row level security;
alter table clients         enable row level security;
alter table appointments    enable row level security;
alter table services        enable row level security;
alter table inventory       enable row level security;
alter table sales           enable row level security;
alter table expenses        enable row level security;
alter table staff           enable row level security;
alter table notes           enable row level security;
alter table cash_ups        enable row level security;

-- Businesses policy
create policy "Users can manage their own business"
  on businesses for all
  using (owner_id = auth.uid());

-- Helper function to get business_id for current user
create or replace function get_my_business_id()
returns uuid language sql security definer as $$
  select id from businesses where owner_id = auth.uid() limit 1;
$$;

-- Apply policy to all child tables
do $$
declare
  t text;
begin
  foreach t in array array['clients','appointments','services','inventory','sales','expenses','staff','notes','cash_ups']
  loop
    execute format('
      create policy "Business data isolation" on %I for all
      using (business_id = get_my_business_id())
      with check (business_id = get_my_business_id())
    ', t);
  end loop;
end $$;

-- ── UPDATED_AT TRIGGER ──
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger businesses_updated_at before update on businesses
  for each row execute function update_updated_at();

create trigger clients_updated_at before update on clients
  for each row execute function update_updated_at();
