-- ─────────────────────────────────────────────────────────
-- SolarPro Database Schema
-- Run this in: Supabase → SQL Editor → Run
-- ─────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── COMPANIES ────────────────────────────────────────────
create table companies (
  id                      uuid primary key default uuid_generate_v4(),
  name                    text not null,
  city                    text,
  phone                   text,
  address                 text,

  -- Subscription
  subscription_status     text not null default 'pending_payment'
                          check (subscription_status in (
                            'pending_payment','pending_approval',
                            'active','expired','suspended'
                          )),
  subscription_plan       text not null default 'trial'
                          check (subscription_plan in ('trial','basic','pro')),
  subscription_expires_at timestamptz,

  -- Approval
  is_approved             boolean not null default false,
  approved_by             uuid references auth.users(id),
  approved_at             timestamptz,

  -- Single device lock — only one active session token at a time
  active_session_token    text unique,

  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ─── USERS (extends Supabase auth.users) ──────────────────
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null,
  phone       text,
  role        text not null default 'company_admin'
              check (role in ('superadmin','company_admin','user')),
  company_id  uuid references companies(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── PRODUCT CATEGORIES ───────────────────────────────────
create table product_categories (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null unique,
  display_name text not null,
  icon         text not null default '📦',
  description  text,
  sort_order   int not null default 0
);

-- Seed default categories
insert into product_categories (name, display_name, icon, sort_order) values
  ('solar_panel', 'Solar Panels',       '🌞', 1),
  ('inverter',    'Inverters',           '⚡', 2),
  ('battery',     'Batteries',           '🔋', 3),
  ('cable',       'DC Cables',           '🔶', 4),
  ('structure',   'Mounting Structure',  '🏗️', 5),
  ('accessory',   'Accessories',         '🔧', 6);

-- ─── PRODUCT MODELS ───────────────────────────────────────
create table product_models (
  id             uuid primary key default uuid_generate_v4(),
  category_id    uuid not null references product_categories(id),
  brand          text not null,
  model_name     text not null,
  specs          jsonb not null default '{}',
  price_per_unit numeric(12,2) not null check (price_per_unit >= 0),
  unit_label     text not null,   -- "per watt", "per kW", etc.
  is_active      boolean not null default true,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  unique (brand, model_name)
);

-- Seed default products
-- Solar panels
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
select id, 'JA Solar',      'JAM72S30', '{"wattage":580,"type":"Mono PERC","warranty_years":12}', 28, 'per watt', 1 from product_categories where name='solar_panel';
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
select id, 'Longi Solar',   'Hi-MO6',   '{"wattage":580,"type":"Mono HPBC","warranty_years":12}', 30, 'per watt', 2 from product_categories where name='solar_panel';
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
select id, 'Canadian Solar','HiKu6',    '{"wattage":580,"type":"Mono","warranty_years":12}',       36, 'per watt', 3 from product_categories where name='solar_panel';
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
select id, 'Risen Energy',  'RSM144',   '{"wattage":580,"type":"Mono","warranty_years":10}',       25, 'per watt', 4 from product_categories where name='solar_panel';

-- Inverters
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
select id, 'Growatt',       'MID 10KTL', '{"type":"On-Grid","mppt":2,"warranty_years":5}',    18000, 'per kW', 1 from product_categories where name='inverter';
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
select id, 'Huawei',        'SUN2000',   '{"type":"On-Grid/Hybrid","mppt":2,"warranty_years":5}', 28000, 'per kW', 2 from product_categories where name='inverter';
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
select id, 'Sungrow',       'SG10RT',    '{"type":"On-Grid","mppt":2,"warranty_years":5}',    22000, 'per kW', 3 from product_categories where name='inverter';
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
select id, 'Sofar Solar',   'SOFAR 8.8K','{"type":"On-Grid","mppt":2,"warranty_years":5}',    15000, 'per kW', 4 from product_categories where name='inverter';
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
select id, 'Fronius',       'Symo GEN24','{"type":"Hybrid","mppt":2,"warranty_years":7}',     35000, 'per kW', 5 from product_categories where name='inverter';

-- Batteries
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
select id, 'Pylontech', 'US5000', '{"kwh":5.12,"chemistry":"LFP","warranty_years":10}', 180000, 'per unit', 1 from product_categories where name='battery';
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
select id, 'BYD',       'LFP',    '{"kwh":5.12,"chemistry":"LFP","warranty_years":12}', 220000, 'per unit', 2 from product_categories where name='battery';
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
select id, 'Dyness',    'B4850',  '{"kwh":5.12,"chemistry":"LFP","warranty_years":7}',  150000, 'per unit', 3 from product_categories where name='battery';
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
select id, 'AGM Local', 'Lead Acid 200Ah', '{"ah":200,"chemistry":"AGM","warranty_years":3}', 35000, 'per unit', 4 from product_categories where name='battery';

-- Cables
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
select id, 'Kuka', 'Solar DC 4mm²',  '{"voltage_dc":1500,"size_mm":4,"color":"Red/Black"}', 65, 'per meter', 1 from product_categories where name='cable';
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
select id, 'Kuka', 'Solar DC 6mm²',  '{"voltage_dc":1500,"size_mm":6,"color":"Red/Black"}', 85, 'per meter', 2 from product_categories where name='cable';

-- Structure & Labour (flat per kW)
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
select id, 'Local', 'GI Structure', '{"material":"Galvanized Steel","type":"Roof Mount"}', 5000, 'per kW', 1 from product_categories where name='structure';
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
select id, 'Labour', 'Installation', '{"includes":"Wiring, Testing, Commissioning"}', 4000, 'per kW', 1 from product_categories where name='accessory';
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
select id, 'FESCO/LESCO', 'Net Metering Fee', '{"includes":"Application, Processing"}', 15000, 'flat fee', 2 from product_categories where name='accessory';

-- ─── QUOTATIONS ───────────────────────────────────────────
create table quotations (
  id               uuid primary key default uuid_generate_v4(),
  company_id       uuid not null references companies(id),
  created_by       uuid not null references profiles(id),
  status           text not null default 'draft'
                   check (status in ('draft','sent','accepted','rejected','expired')),

  -- Client
  client_name      text not null,
  client_phone     text not null,
  client_address   text not null,

  -- System
  system_type      text not null check (system_type in ('ongrid','hybrid','offgrid','tubwell')),
  system_kw        numeric(8,2) not null,

  -- Line items stored as JSONB for flexibility
  line_items       jsonb not null default '[]',

  -- Pricing
  subtotal         numeric(14,2) not null,
  total_price      numeric(14,2) not null,
  advance_percent  int not null default 50,
  advance_amount   numeric(14,2) not null,
  remaining_amount numeric(14,2) not null,

  -- Meta
  valid_days       int not null default 15,
  notes            text,
  pdf_url          text,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  expires_at       timestamptz
);

-- ─── PAYMENTS ─────────────────────────────────────────────
create table payments (
  id               uuid primary key default uuid_generate_v4(),
  company_id       uuid not null references companies(id),
  amount           numeric(12,2) not null,
  method           text not null check (method in ('jazzcash','easypaisa','bank_transfer')),
  status           text not null default 'pending'
                   check (status in ('pending','completed','failed','refunded')),
  transaction_id   text unique,
  gateway_response jsonb,
  plan             text not null check (plan in ('trial','basic','pro')),
  months           int not null default 1,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── SESSION AUDIT LOG ────────────────────────────────────
-- Tracks all login events for security
create table session_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id),
  company_id  uuid references companies(id),
  action      text not null check (action in ('login','logout','kicked','expired')),
  ip_address  text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

-- ─── PRICE UPDATE HISTORY ─────────────────────────────────
-- Every price change is logged — for audit and rollback
create table price_history (
  id               uuid primary key default uuid_generate_v4(),
  product_model_id uuid not null references product_models(id),
  company_id       uuid references companies(id),  -- null = global update by admin
  old_price        numeric(12,2) not null,
  new_price        numeric(12,2) not null,
  changed_by       uuid references profiles(id),
  source           text not null default 'manual'
                   check (source in ('manual','ai_chatbot','admin')),
  raw_text         text,   -- original WhatsApp text if AI updated
  created_at       timestamptz not null default now()
);


-- ─── AUTO-SET expires_at on quotation insert ──────────────
create or replace function set_quotation_expiry()
returns trigger as $$
begin
  new.expires_at := new.created_at + (new.valid_days || ' days')::interval;
  return new;
end;
$$ language plpgsql;

create trigger trg_quotation_expiry
  before insert on quotations
  for each row execute function set_quotation_expiry();

-- ─── INDEXES ──────────────────────────────────────────────
create index idx_profiles_company    on profiles(company_id);
create index idx_quotations_company  on quotations(company_id);
create index idx_quotations_status   on quotations(status);
create index idx_payments_company    on payments(company_id);
create index idx_product_models_cat  on product_models(category_id);
create index idx_product_models_active on product_models(is_active);
create index idx_session_logs_user   on session_logs(user_id);
create index idx_price_history_model on price_history(product_model_id);

-- ─── AUTO-UPDATE updated_at ───────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_companies_updated     before update on companies     for each row execute function update_updated_at();
create trigger trg_profiles_updated      before update on profiles      for each row execute function update_updated_at();
create trigger trg_product_models_updated before update on product_models for each row execute function update_updated_at();
create trigger trg_quotations_updated    before update on quotations    for each row execute function update_updated_at();
create trigger trg_payments_updated      before update on payments      for each row execute function update_updated_at();

-- ─── ROW LEVEL SECURITY ───────────────────────────────────
alter table companies       enable row level security;
alter table profiles        enable row level security;
alter table product_models  enable row level security;
alter table quotations      enable row level security;
alter table payments        enable row level security;
alter table session_logs    enable row level security;
alter table price_history   enable row level security;

-- Profiles: users see only their own profile
create policy "Users see own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users update own profile"
  on profiles for update using (auth.uid() = id);

-- Companies: users see only their company
create policy "Users see own company"
  on companies for select
  using (id = (select company_id from profiles where id = auth.uid()));

-- Product models: active products visible to all authenticated users
create policy "Authenticated users see active products"
  on product_models for select
  to authenticated
  using (is_active = true);

-- Quotations: company members see their company's quotations
create policy "Company members see own quotations"
  on quotations for select
  using (company_id = (select company_id from profiles where id = auth.uid()));

create policy "Company members create quotations"
  on quotations for insert
  with check (company_id = (select company_id from profiles where id = auth.uid()));

create policy "Company members update own quotations"
  on quotations for update
  using (company_id = (select company_id from profiles where id = auth.uid()));

-- Payments: company sees own payments
create policy "Company sees own payments"
  on payments for select
  using (company_id = (select company_id from profiles where id = auth.uid()));

-- ─── SUPERADMIN FUNCTION ──────────────────────────────────
-- Creates first superadmin — run once after setup
create or replace function create_superadmin(admin_email text)
returns void as $$
begin
  update profiles set role = 'superadmin' where email = admin_email;
end;
$$ language plpgsql security definer;

-- ─── AUTO-CREATE PROFILE on signup ────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    'company_admin'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
