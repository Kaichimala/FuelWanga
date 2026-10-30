-- ============================================================
-- 01_tables.sql
-- Run first in the Supabase SQL editor (Settings → SQL Editor).
-- Creates all five tables.
-- ============================================================

-- brands
create table if not exists public.brands (
  id        serial  primary key,
  name      text    unique not null,
  is_active boolean not null default true
);

-- stations
create table if not exists public.stations (
  id             uuid        primary key default gen_random_uuid(),
  brand          text        not null,
  city           text        not null,
  area           text        not null,
  -- Generated column – nobody writes this directly.
  name           text generated always as (brand || ' ' || area) stored,
  petrol_status  text        not null default 'no_fuel'
                   check (petrol_status in ('has_fuel', 'no_fuel')),
  diesel_status  text        not null default 'no_fuel'
                   check (diesel_status in ('has_fuel', 'no_fuel')),
  petrol_eta     timestamptz,
  diesel_eta     timestamptz,
  is_active      boolean     not null default true,
  created_by     uuid        references auth.users on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (brand, city, area),
  -- Brand must exist (deferrable so we can insert brand + station in one txn)
  foreign key (brand) references public.brands(name)
    deferrable initially deferred
);

-- station_staff
create table if not exists public.station_staff (
  station_id uuid not null references public.stations(id) on delete cascade,
  user_id    uuid not null references auth.users              on delete cascade,
  primary key (station_id, user_id)
);

-- super_admins
create table if not exists public.super_admins (
  user_id uuid primary key references auth.users on delete cascade
);

-- station_invites  (stores SHA-256 hash, NEVER the raw token)
create table if not exists public.station_invites (
  id          uuid        primary key default gen_random_uuid(),
  token_hash  text        unique not null,
  brand       text        not null,
  city        text        not null,
  area        text        not null,
  used        boolean     not null default false,
  used_by     uuid        references auth.users on delete set null,
  used_at     timestamptz,
  created_by  uuid        references auth.users on delete set null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '7 days'
);
