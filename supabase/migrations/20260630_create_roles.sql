-- ============================================================
-- Roles & Permissions
-- ============================================================

create table if not exists public.roles (
  id text primary key,
  name text not null unique,
  description text,
  permissions jsonb not null default '{}',
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.roles enable row level security;
create policy "Authenticated users can read roles" on public.roles for select using (auth.role() = 'authenticated');
create policy "Admin can modify roles" on public.roles for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Seed default roles
insert into public.roles (id, name, description, permissions, is_system) values
  ('admin', 'Admin', 'Full access to all pages',
    '{"dashboard":true,"inventory":true,"orders":true,"deliveries":true,"warehouses":true,"transfers":true,"returns":true,"purchases":true,"promotions":true,"vendors":true,"reports":true,"teams":true,"requirements":true,"roles":true,"categories":true,"notifications_history":true,"notifications_analytics":true,"notifications_settings":true}',
    true),
  ('staff', 'Staff', 'Access to operational pages',
    '{"dashboard":true,"inventory":true,"orders":true,"deliveries":true,"warehouses":true,"transfers":true,"returns":true,"purchases":true,"promotions":true,"vendors":true,"reports":true,"teams":false,"requirements":false,"roles":false,"categories":false,"notifications_history":true,"notifications_analytics":false,"notifications_settings":true}',
    true),
  ('viewer', 'Viewer', 'Read-only access to basic pages',
    '{"dashboard":true,"inventory":true,"orders":true,"deliveries":true,"warehouses":true,"transfers":false,"returns":false,"purchases":false,"promotions":false,"vendors":false,"reports":true,"teams":false,"requirements":false,"roles":false,"categories":false,"notifications_history":false,"notifications_analytics":false,"notifications_settings":false}',
    true)
on conflict (id) do nothing;
