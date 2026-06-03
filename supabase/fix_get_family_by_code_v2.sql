-- ============================================================
-- fix_get_family_by_code_v2
-- Run this in Supabase SQL Editor.
--
-- Replaces the broken get_family_by_code that looked up by
-- children.invite_code. Children now enter the same 6-char
-- GEZINSCODE the parent sees in Settings — stored in
-- families.family_code.
--
-- Changes:
--   1. Lookup changed from children.invite_code → families.family_code
--   2. family_id added to response (needed by add_child in profile.tsx)
--   3. Response shape otherwise unchanged so who-am-i.tsx still works
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
  select id, name
  into   v_family_id, v_family_name
  from   families
  where  family_code = p_code
  limit  1;

  if v_family_id is null then
    return null;
  end if;

  return json_build_object(
    'family_id',   v_family_id,
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
