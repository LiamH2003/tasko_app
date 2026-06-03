-- ============================================================
-- fix_get_family_by_code
-- Run this in Supabase SQL Editor.
--
-- Replaces the broken get_family_by_invite_code function.
-- Fixes:
--   1. Wrong RPC name (service called get_family_by_code)
--   2. Old parent_id join (children now use family_id)
--   3. Missing has_pin field (needed by who-am-i.tsx routing)
-- Called by the child invite-code screen (no auth → anon role).
-- ============================================================

create or replace function get_family_by_code(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id   uuid;
  v_family_name text;
begin
  -- Look up the family via a child's invite_code
  select c.family_id, f.name
  into   v_family_id, v_family_name
  from   children c
  join   families f on f.id = c.family_id
  where  c.invite_code = p_code
  limit  1;

  if v_family_id is null then
    return null;
  end if;

  return json_build_object(
    'family_name', v_family_name,
    'children', (
      select coalesce(json_agg(
        json_build_object(
          'id',           c.id,
          'name',         c.name,
          'monster_name', c.monster_name,
          'level',        c.level,
          'stage',        c.stage,
          'has_pin',      (c.pin_code is not null)
        ) order by c.created_at
      ), '[]'::json)
      from children c
      where c.family_id = v_family_id
    )
  );
end;
$$;

grant execute on function get_family_by_code(text) to anon;
