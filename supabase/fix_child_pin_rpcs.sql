-- ============================================================
-- fix_child_pin_rpcs
-- Run this in Supabase SQL Editor.
--
-- Creates the three PIN functions missing from the database:
--   set_child_pin    — child saves their PIN during onboarding
--   verify_child_pin — child enters PIN to log back in
--   reset_child_pin  — parent resets a forgotten PIN
-- ============================================================


-- ── set_child_pin ────────────────────────────────────────────
-- Called during child onboarding (no auth session → anon).
-- Stores the plain-text PIN in children.pin_code.
create or replace function set_child_pin(p_child_id uuid, p_pin text)
returns void
language sql
security definer
set search_path = public
as $$
  update children set pin_code = p_pin where id = p_child_id;
$$;

grant execute on function set_child_pin(uuid, text) to anon;


-- ── verify_child_pin ─────────────────────────────────────────
-- Returns:
--   NULL  — no PIN set yet (route child to set-pin screen)
--   TRUE  — PIN is correct
--   FALSE — PIN is wrong
create or replace function verify_child_pin(p_child_id uuid, p_pin text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pin_code text;
begin
  select pin_code into v_pin_code
  from   children
  where  id = p_child_id
  limit  1;

  if v_pin_code is null then
    return null;
  end if;

  return v_pin_code = p_pin;
end;
$$;

grant execute on function verify_child_pin(uuid, text) to anon;


-- ── reset_child_pin ──────────────────────────────────────────
-- Called by an authenticated parent from the settings screen.
-- Clears the PIN so the child is prompted to set a new one on
-- next login. Guards that the child belongs to the caller's family.
create or replace function reset_child_pin(p_child_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
begin
  select family_id into v_family_id
  from   family_members
  where  user_id = auth.uid()
  limit  1;

  if v_family_id is null then
    raise exception 'Niet ingelogd of geen gezin gevonden';
  end if;

  if not exists (
    select 1 from children
    where id = p_child_id and family_id = v_family_id
  ) then
    raise exception 'Kind niet gevonden in uw gezin';
  end if;

  update children set pin_code = null where id = p_child_id;
end;
$$;

grant execute on function reset_child_pin(uuid) to authenticated;
