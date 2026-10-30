-- ============================================================
-- 03_trigger.sql
-- Run third.
-- BEFORE INSERT OR UPDATE trigger on public.stations.
-- Enforces:
--   • updated_at is always stamped by the DB (client value ignored)
--   • area / city normalisation
--   • ETA must be in the future and ≤ 30 days out
--   • has_fuel automatically nulls the corresponding ETA
--   • station staff cannot modify protected columns (brand, city,
--     area, is_active, created_by, created_at, id) on UPDATE
-- ============================================================

create or replace function public.stations_before_write()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin

  -- 1. Always stamp updated_at regardless of what the client sent
  new.updated_at := now();

  -- 2. Normalise area: trim whitespace, collapse multiple spaces, initcap
  new.area := initcap(btrim(regexp_replace(new.area, '\s+', ' ', 'g')));

  -- 3. Trim city
  new.city := btrim(new.city);

  -- 4. Petrol ETA rules
  if new.petrol_status = 'has_fuel' then
    -- Clear ETA whenever fuel becomes available
    new.petrol_eta := null;
  elsif new.petrol_eta is not null then
    if new.petrol_eta <= now() then
      raise exception 'petrol_eta must be in the future';
    end if;
    if new.petrol_eta > now() + interval '30 days' then
      raise exception 'petrol_eta cannot be more than 30 days in the future';
    end if;
  end if;

  -- 5. Diesel ETA rules
  if new.diesel_status = 'has_fuel' then
    new.diesel_eta := null;
  elsif new.diesel_eta is not null then
    if new.diesel_eta <= now() then
      raise exception 'diesel_eta must be in the future';
    end if;
    if new.diesel_eta > now() + interval '30 days' then
      raise exception 'diesel_eta cannot be more than 30 days in the future';
    end if;
  end if;

  -- 6. Column lock on UPDATE for non-super-admin authenticated users.
  --    Service-role calls bypass RLS but still fire this trigger; they
  --    arrive with auth.role() = 'service_role', so the lock is skipped
  --    (the register-station route needs to insert freely).
  if TG_OP = 'UPDATE'
     and auth.role() = 'authenticated'
     and not public.is_super_admin()
  then
    if (
         new.brand      is distinct from old.brand      or
         new.city       is distinct from old.city       or
         new.area       is distinct from old.area       or
         new.is_active  is distinct from old.is_active  or
         new.created_by is distinct from old.created_by or
         new.created_at is distinct from old.created_at or
         new.id         is distinct from old.id
    ) then
      raise exception 'not authorized to modify protected station fields';
    end if;
  end if;

  return new;
end;
$$;

-- Attach (or re-attach) the trigger
drop trigger if exists stations_before_write_trg on public.stations;

create trigger stations_before_write_trg
  before insert or update on public.stations
  for each row execute procedure public.stations_before_write();
