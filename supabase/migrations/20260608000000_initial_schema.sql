-- ============================================================
-- Stock Management — Full Schema Migration
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (linked to auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null default 'staff' check (role in ('admin', 'staff', 'viewer')),
  phone text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Allow insert during signup" on public.profiles for insert with check (auth.uid() = id);
create policy "Admins can read all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table public.products (
  id text primary key,
  name text not null,
  sku text not null unique,
  category text not null,
  warehouse text not null,
  vendor text,
  stock integer not null default 0,
  low_stock_threshold integer not null default 10,
  price numeric(12,2) not null default 0,
  status text not null default 'in_stock' check (status in ('in_stock', 'low_stock', 'out_of_stock')),
  last_updated text not null default to_char(now(), 'YYYY-MM-DD HH24:MI')
);
alter table public.products enable row level security;
create policy "Authenticated users can read products" on public.products for select using (auth.role() = 'authenticated');
create policy "Staff and admin can modify products" on public.products for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'staff'))
);

-- ============================================================
-- STOCK HISTORY
-- ============================================================
create table public.stock_history (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  type text not null check (type in ('sale', 'purchase', 'transfer_in', 'transfer_out', 'return', 'adjustment')),
  quantity integer not null,
  stock_before integer not null,
  stock_after integer not null,
  reference text not null,
  note text not null default '',
  warehouse text not null,
  user_name text not null,
  created_at text not null default to_char(now(), 'YYYY-MM-DD HH24:MI')
);
alter table public.stock_history enable row level security;
create policy "Authenticated users can read stock history" on public.stock_history for select using (auth.role() = 'authenticated');
create policy "Staff and admin can insert stock history" on public.stock_history for insert with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'staff'))
);

-- ============================================================
-- WAREHOUSES
-- ============================================================
create table public.warehouses (
  id text primary key,
  name text not null,
  type text not null check (type in ('owned', 'vendor')),
  address text not null,
  city text not null,
  country text not null,
  manager text not null,
  manager_email text,
  manager_phone text,
  operating_hours text,
  total_capacity integer not null default 0,
  used_capacity integer not null default 0,
  total_skus integer not null default 0,
  total_units integer not null default 0,
  inbound_today integer not null default 0,
  outbound_today integer not null default 0,
  pending_pickups integer not null default 0,
  zones jsonb not null default '[]'::jsonb,
  staff jsonb not null default '[]'::jsonb,
  monthly_activity jsonb not null default '[]'::jsonb,
  last_audit text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.warehouses enable row level security;
create policy "Authenticated users can read warehouses" on public.warehouses for select using (auth.role() = 'authenticated');
create policy "Admin can modify warehouses" on public.warehouses for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ============================================================
-- VENDORS
-- ============================================================
create table public.vendors (
  id text primary key,
  name text not null,
  type text not null check (type in ('supplier', 'manufacturer', 'distributor')),
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  logo text,
  address text,
  city text,
  country text,
  website text,
  registered_at text,
  contacts jsonb not null default '[]'::jsonb,
  products jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}',
  payment_terms text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.vendors enable row level security;
create policy "Authenticated users can read vendors" on public.vendors for select using (auth.role() = 'authenticated');
create policy "Staff and admin can modify vendors" on public.vendors for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'staff'))
);

-- ============================================================
-- PURCHASES
-- ============================================================
create table public.purchases (
  id text primary key,
  vendor text not null,
  vendor_contact text,
  vendor_email text,
  warehouse text not null,
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'approved', 'ordered', 'received', 'cancelled')),
  items jsonb not null default '[]'::jsonb,
  total_items integer not null default 0,
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  requested_by text not null,
  approved_by text,
  notes text,
  expected_delivery text,
  received_at text,
  created_at text not null default to_char(now(), 'YYYY-MM-DD HH24:MI'),
  updated_at text not null default to_char(now(), 'YYYY-MM-DD HH24:MI')
);
alter table public.purchases enable row level security;
create policy "Authenticated users can read purchases" on public.purchases for select using (auth.role() = 'authenticated');
create policy "Staff and admin can modify purchases" on public.purchases for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'staff'))
);

-- ============================================================
-- ORDERS
-- ============================================================
create table public.orders (
  id text primary key,
  customer text not null,
  email text,
  phone text,
  address text,
  city text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'partial', 'processing', 'fulfilled')),
  total numeric(12,2) not null default 0,
  item_count integer not null default 0,
  vendor_splits jsonb not null default '[]'::jsonb,
  notes text,
  created_at text not null default to_char(now(), 'YYYY-MM-DD HH24:MI'),
  updated_at text not null default to_char(now(), 'YYYY-MM-DD HH24:MI')
);
alter table public.orders enable row level security;
create policy "Authenticated users can read orders" on public.orders for select using (auth.role() = 'authenticated');
create policy "Staff and admin can modify orders" on public.orders for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'staff'))
);

-- ============================================================
-- DELIVERIES
-- ============================================================
create table public.deliveries (
  id text primary key,
  order_id text not null,
  customer text not null,
  items integer not null default 0,
  status text not null default 'prepare' check (status in ('prepare', 'ready', 'in_transit', 'delivered')),
  last_update text not null default to_char(now(), 'YYYY-MM-DD HH24:MI'),
  destination text,
  created_at timestamptz not null default now()
);
alter table public.deliveries enable row level security;
create policy "Authenticated users can read deliveries" on public.deliveries for select using (auth.role() = 'authenticated');
create policy "Staff and admin can modify deliveries" on public.deliveries for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'staff'))
);

-- ============================================================
-- TRANSFERS
-- ============================================================
create table public.transfers (
  id text primary key,
  from_warehouse text not null,
  to_warehouse text not null,
  requested_by text not null,
  approved_by text,
  status text not null default 'requested' check (status in ('requested', 'approved', 'in_transit', 'received', 'cancelled')),
  items jsonb not null default '[]'::jsonb,
  total_items integer not null default 0,
  reason text not null default '',
  notes text,
  expected_arrival text,
  completed_at text,
  created_at text not null default to_char(now(), 'YYYY-MM-DD HH24:MI'),
  updated_at text not null default to_char(now(), 'YYYY-MM-DD HH24:MI')
);
alter table public.transfers enable row level security;
create policy "Authenticated users can read transfers" on public.transfers for select using (auth.role() = 'authenticated');
create policy "Staff and admin can modify transfers" on public.transfers for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'staff'))
);

-- ============================================================
-- RETURNS
-- ============================================================
create table public.returns (
  id text primary key,
  order_id text not null,
  customer text not null,
  email text,
  phone text,
  status text not null default 'pending' check (status in ('pending', 'inspecting', 'approved', 'restocked', 'discarded', 'refunded')),
  items jsonb not null default '[]'::jsonb,
  total_items integer not null default 0,
  total_value numeric(12,2) not null default 0,
  reason text not null check (reason in ('wrong_item', 'damaged', 'defective', 'not_as_described', 'changed_mind', 'other')),
  reason_note text,
  refund_method text not null default 'none' check (refund_method in ('original_payment', 'store_credit', 'bank_transfer', 'none')),
  refund_amount numeric(12,2) not null default 0,
  warehouse text not null,
  assigned_to text,
  inspection_notes text,
  completed_at text,
  created_at text not null default to_char(now(), 'YYYY-MM-DD HH24:MI'),
  updated_at text not null default to_char(now(), 'YYYY-MM-DD HH24:MI')
);
alter table public.returns enable row level security;
create policy "Authenticated users can read returns" on public.returns for select using (auth.role() = 'authenticated');
create policy "Staff and admin can modify returns" on public.returns for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'staff'))
);

-- ============================================================
-- REQUIREMENTS
-- ============================================================
create table public.requirements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  module text not null,
  priority text not null check (priority in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.requirements enable row level security;
create policy "Authenticated users can read requirements" on public.requirements for select using (auth.role() = 'authenticated');
create policy "Admin can modify requirements" on public.requirements for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ============================================================
-- PROMOTIONS
-- ============================================================
create table public.promotions (
  id text primary key,
  name text not null,
  type text not null check (type in ('percentage', 'fixed_amount', 'buy_x_get_y', 'bundle')),
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'active', 'paused', 'expired')),
  description text,
  discount_value numeric(12,2) not null default 0,
  min_order_amount numeric(12,2),
  max_usage_count integer,
  usage_count integer not null default 0,
  products jsonb not null default '[]'::jsonb,
  bundle_items jsonb,
  bundle_price numeric(12,2),
  buy_qty integer,
  get_qty integer,
  start_date text not null,
  end_date text not null,
  total_revenue numeric(12,2) not null default 0,
  total_units_sold integer not null default 0,
  created_at text not null default to_char(now(), 'YYYY-MM-DD HH24:MI'),
  updated_at text not null default to_char(now(), 'YYYY-MM-DD HH24:MI')
);
alter table public.promotions enable row level security;
create policy "Authenticated users can read promotions" on public.promotions for select using (auth.role() = 'authenticated');
create policy "Admin can modify promotions" on public.promotions for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null check (type in ('low_stock', 'out_of_stock', 'new_order', 'return_pending', 'transfer_ready', 'delivery_delayed', 'system')),
  title text not null,
  message text not null,
  is_read boolean not null default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
create policy "Users can read own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "Users can update own notifications" on public.notifications for update using (user_id = auth.uid());
create policy "Users can delete own notifications" on public.notifications for delete using (user_id = auth.uid());
create policy "Service role can insert notifications" on public.notifications for insert with check (true);

-- ============================================================
-- NOTIFICATION SETTINGS
-- ============================================================
create table public.notification_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email_enabled boolean not null default true,
  sms_enabled boolean not null default false,
  in_app_enabled boolean not null default true,
  browser_push_enabled boolean not null default true,
  category_thresholds jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.notification_settings enable row level security;
create policy "Users can manage own notification settings" on public.notification_settings for all using (user_id = auth.uid());

-- ============================================================
-- ALERT RULES
-- ============================================================
create table public.alert_rules (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  trigger_type text not null,
  trigger_condition jsonb not null default '{}'::jsonb,
  notification_type text not null,
  message_template text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.alert_rules enable row level security;
create policy "Authenticated users can read alert rules" on public.alert_rules for select using (auth.role() = 'authenticated');
create policy "Admin can modify alert rules" on public.alert_rules for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ============================================================
-- PUSH SUBSCRIPTIONS
-- ============================================================
create table public.push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text,
  auth text,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
create policy "Users can manage own push subscriptions" on public.push_subscriptions for all using (user_id = auth.uid());

-- ============================================================
-- WEBHOOK CONFIGS
-- ============================================================
create table public.webhook_configs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  provider text not null check (provider in ('slack', 'discord', 'telegram', 'custom')),
  webhook_url text not null,
  secret_token text,
  is_active boolean not null default true,
  notify_on_types text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.webhook_configs enable row level security;
create policy "Authenticated users can read webhook configs" on public.webhook_configs for select using (auth.role() = 'authenticated');
create policy "Admin can modify webhook configs" on public.webhook_configs for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ============================================================
-- ACTIVITY LOG
-- ============================================================
create table public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('sale', 'purchase', 'transfer', 'return', 'adjustment')),
  description text not null,
  product text not null,
  quantity integer not null,
  warehouse text not null,
  user_name text not null,
  created_at timestamptz not null default now()
);
alter table public.activity_log enable row level security;
create policy "Authenticated users can read activity log" on public.activity_log for select using (auth.role() = 'authenticated');
create policy "Service role can insert activity log" on public.activity_log for insert with check (true);

-- ============================================================
-- REPORT TABLES (pre-aggregated data for dashboards)
-- ============================================================

create table public.daily_revenue (
  id uuid primary key default uuid_generate_v4(),
  date text not null unique,
  revenue numeric(12,2) not null default 0,
  orders integer not null default 0,
  returns integer not null default 0
);
alter table public.daily_revenue enable row level security;
create policy "Authenticated users can read daily revenue" on public.daily_revenue for select using (auth.role() = 'authenticated');
create policy "Admin can modify daily revenue" on public.daily_revenue for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create table public.monthly_snapshots (
  id uuid primary key default uuid_generate_v4(),
  month text not null unique,
  revenue numeric(12,2) not null default 0,
  orders integer not null default 0,
  returns integer not null default 0,
  transfers integer not null default 0,
  purchases integer not null default 0,
  avg_order_value numeric(12,2) not null default 0
);
alter table public.monthly_snapshots enable row level security;
create policy "Authenticated users can read monthly snapshots" on public.monthly_snapshots for select using (auth.role() = 'authenticated');
create policy "Admin can modify monthly snapshots" on public.monthly_snapshots for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create table public.top_products (
  id uuid primary key default uuid_generate_v4(),
  product_id text,
  product_name text not null,
  sku text not null,
  category text not null,
  units_sold integer not null default 0,
  revenue numeric(12,2) not null default 0,
  return_rate numeric(5,2) not null default 0,
  trend text not null default 'stable' check (trend in ('up', 'down', 'stable'))
);
alter table public.top_products enable row level security;
create policy "Authenticated users can read top products" on public.top_products for select using (auth.role() = 'authenticated');
create policy "Admin can modify top products" on public.top_products for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create table public.category_breakdown (
  id uuid primary key default uuid_generate_v4(),
  category text not null unique,
  revenue numeric(12,2) not null default 0,
  units_sold integer not null default 0,
  return_rate numeric(5,2) not null default 0,
  color text not null default '#6b7280'
);
alter table public.category_breakdown enable row level security;
create policy "Authenticated users can read category breakdown" on public.category_breakdown for select using (auth.role() = 'authenticated');
create policy "Admin can modify category breakdown" on public.category_breakdown for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create table public.return_reasons (
  id uuid primary key default uuid_generate_v4(),
  reason text not null unique,
  count integer not null default 0,
  value numeric(12,2) not null default 0,
  percentage numeric(5,2) not null default 0
);
alter table public.return_reasons enable row level security;
create policy "Authenticated users can read return reasons" on public.return_reasons for select using (auth.role() = 'authenticated');
create policy "Admin can modify return reasons" on public.return_reasons for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create table public.vendor_performance (
  id uuid primary key default uuid_generate_v4(),
  vendor text not null unique,
  fulfillment_rate numeric(5,2) not null default 0,
  total_orders integer not null default 0,
  rejected_orders integer not null default 0,
  avg_delivery_days numeric(5,2) not null default 0,
  revenue numeric(12,2) not null default 0
);
alter table public.vendor_performance enable row level security;
create policy "Authenticated users can read vendor performance" on public.vendor_performance for select using (auth.role() = 'authenticated');
create policy "Admin can modify vendor performance" on public.vendor_performance for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create table public.warehouse_performance (
  id uuid primary key default uuid_generate_v4(),
  warehouse text not null unique,
  inbound integer not null default 0,
  outbound integer not null default 0,
  returns integer not null default 0,
  fulfillment_rate numeric(5,2) not null default 0,
  avg_processing_days numeric(5,2) not null default 0
);
alter table public.warehouse_performance enable row level security;
create policy "Authenticated users can read warehouse performance" on public.warehouse_performance for select using (auth.role() = 'authenticated');
create policy "Admin can modify warehouse performance" on public.warehouse_performance for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create table public.notification_analytics (
  id uuid primary key default uuid_generate_v4(),
  day date not null,
  type text not null,
  total integer not null default 0,
  read_count integer not null default 0,
  emailed_count integer not null default 0,
  sms_count integer not null default 0,
  webhook_count integer not null default 0,
  unique (day, type)
);
alter table public.notification_analytics enable row level security;
create policy "Authenticated users can read notification analytics" on public.notification_analytics for select using (auth.role() = 'authenticated');
create policy "Admin can modify notification analytics" on public.notification_analytics for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
