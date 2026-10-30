-- ============================================================
-- 04_rls.sql
-- Run fourth.
-- Enables RLS on every table and creates all policies.
-- Also creates the stations_public view (anon-readable).
-- ============================================================

-- ── stations ──────────────────────────────────────────────────────────────
alter table public.stations enable row level security;

-- Direct table access is restricted to staff/admin.
-- Public reads go through the stations_public view instead.

create policy "station: select own or admin"
  on public.stations for select
  using (
    public.is_station_staff(id) or public.is_super_admin()
  );

create policy "station: update own or admin"
  on public.stations for update
  using      ( public.is_station_staff(id) or public.is_super_admin() )
  with check ( public.is_station_staff(id) or public.is_super_admin() );

create policy "station: delete admin only"
  on public.stations for delete
  using ( public.is_super_admin() );

-- Nobody inserts directly via RLS; only the service-role register-station
-- route inserts rows (it bypasses RLS).
create policy "station: no direct insert"
  on public.stations for insert
  with check ( false );


-- ── brands ────────────────────────────────────────────────────────────────
alter table public.brands enable row level security;

-- Anon + authenticated can read active brands (needed for register form)
create policy "brands: public read active"
  on public.brands for select
  using ( is_active = true );

-- Super-admin has full control
create policy "brands: super-admin all"
  on public.brands for all
  using      ( public.is_super_admin() )
  with check ( public.is_super_admin() );


-- ── station_staff ─────────────────────────────────────────────────────────
alter table public.station_staff enable row level security;

-- A staff member can see their own row; super-admin sees all
create policy "station_staff: select own or admin"
  on public.station_staff for select
  using ( user_id = auth.uid() or public.is_super_admin() );

-- Super-admin manages all links
create policy "station_staff: admin all"
  on public.station_staff for all
  using      ( public.is_super_admin() )
  with check ( public.is_super_admin() );


-- ── super_admins ──────────────────────────────────────────────────────────
alter table public.super_admins enable row level security;

-- Users can see their own row; super-admin sees all
create policy "super_admins: select own or admin"
  on public.super_admins for select
  using ( user_id = auth.uid() or public.is_super_admin() );

-- Only super-admins can manage this table
create policy "super_admins: admin all"
  on public.super_admins for all
  using      ( public.is_super_admin() )
  with check ( public.is_super_admin() );


-- ── station_invites ───────────────────────────────────────────────────────
alter table public.station_invites enable row level security;

-- Zero anon access. Super-admin only.
-- (The validate and register routes use the service-role client.)
create policy "station_invites: admin all"
  on public.station_invites for all
  using      ( public.is_super_admin() )
  with check ( public.is_super_admin() );


-- ============================================================
-- stations_public VIEW
-- Anon-readable. Exposes only active stations.
-- Does NOT expose created_by or is_active.
-- security_invoker = false means the view runs as the view
-- owner (postgres), not the calling role – so anon can read it
-- without a direct stations SELECT policy.
-- ============================================================
drop view if exists public.stations_public;

create view public.stations_public
  with (security_invoker = false)
as
  select
    id,
    name,
    brand,
    city,
    area,
    petrol_status,
    diesel_status,
    petrol_eta,
    diesel_eta,
    updated_at
  from public.stations
  where is_active = true;

-- Grant read access to anon and authenticated roles
grant select on public.stations_public to anon, authenticated;
