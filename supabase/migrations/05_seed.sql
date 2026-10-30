-- ============================================================
-- 05_seed.sql
-- Run fifth (last).
-- Seeds the six fuel brands.
-- Also contains the super-admin bootstrap snippet and the
-- RLS verification query.
-- ============================================================

-- Seed brands (idempotent)
insert into public.brands (name) values
  ('Puma Energy'),
  ('Meru'),
  ('Petroda'),
  ('TotalEnergies'),
  ('Engen'),
  ('Moil')
on conflict (name) do nothing;


-- ============================================================
-- Bootstrap the FIRST super-admin
-- ─────────────────────────────
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" and create the admin's account
-- 3. Copy the user's UUID from the Users list
-- 4. Uncomment the line below, paste the UUID, and run it
-- ============================================================
--
insert into public.super_admins (user_id)
values ('f6c16b13-1b94-4a8f-8fe6-51dc3d247485');
--
-- No application code path can create super_admins rows.
-- This manual step is the only way.


-- ============================================================
-- Verify RLS is enabled on all tables
-- Expected: relrowsecurity = true for every row
-- ============================================================
select
  relname          as table_name,
  relrowsecurity   as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind  = 'r'
order by relname;
