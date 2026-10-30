-- ============================================================
-- 02_helpers.sql
-- Run second.
-- Helper functions used by RLS policies and the trigger.
-- Both are SECURITY DEFINER, search_path = '', and not
-- executable by anon or unauthenticated callers.
-- ============================================================

-- is_super_admin(): true if the caller is in public.super_admins
create or replace function public.is_super_admin()
  returns boolean
  language sql
  security definer
  stable
  set search_path = ''
as $$
  select exists (
    select 1
    from public.super_admins
    where user_id = auth.uid()
  );
$$;

revoke execute on function public.is_super_admin()       from public, anon;
grant  execute on function public.is_super_admin()       to   authenticated;


-- is_station_staff(p_station uuid): true if caller is staff for that station
create or replace function public.is_station_staff(p_station uuid)
  returns boolean
  language sql
  security definer
  stable
  set search_path = ''
as $$
  select exists (
    select 1
    from public.station_staff
    where station_id = p_station
      and user_id    = auth.uid()
  );
$$;

revoke execute on function public.is_station_staff(uuid) from public, anon;
grant  execute on function public.is_station_staff(uuid) to   authenticated;
