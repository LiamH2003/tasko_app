-- ============================================================
-- add_child
-- Run this in Supabase SQL Editor.
--
-- Creates a new child record in an existing family.
-- Called during child onboarding (no auth session → anon role).
--
-- Security model: the child already had to supply the correct
-- family_code to obtain family_id from get_family_by_code.
-- The UUID is not guessable so family_id acts as the access
-- secret. The family existence check is an extra guard.
--
-- Returns the new child's id so the app can store it in
-- SecureStore (pendingChildId) and continue onboarding.
-- ============================================================

create or replace function add_child(p_family_id uuid, p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_child_id uuid;
begin
  if not exists (select 1 from families where id = p_family_id) then
    raise exception 'Gezin niet gevonden';
  end if;

  insert into children (family_id, name, monster_name, level, xp, xp_to_next_level, stage)
  values (p_family_id, p_name, 'Tasko', 1, 0, 100, 'egg')
  returning id into v_child_id;

  return v_child_id;
end;
$$;

grant execute on function add_child(uuid, text) to anon;
