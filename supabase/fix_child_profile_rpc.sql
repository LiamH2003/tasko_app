-- ============================================================
-- Fix get_child_profile to match the current children schema.
--
-- The original SQL referenced invite_code which no longer
-- exists (replaced by pin_code in the family-based schema).
-- That caused every fetchChildProfile call to fail, making
-- all child screens fall back to hardcoded defaults:
--   monster name → 'Monster' / 'Tasko'
--   child name   → 'Jij'
--
-- Run in Supabase SQL Editor.
-- ============================================================

drop function if exists get_child_profile(uuid);

create function get_child_profile(p_child_id uuid)
returns table(
  id               uuid,
  name             text,
  monster_name     text,
  level            integer,
  xp               integer,
  xp_to_next_level integer,
  stage            text,
  avatar_url       text
)
language sql
security definer
set search_path = public
as $$
  select id, name, monster_name, level, xp, xp_to_next_level, stage, avatar_url
  from children
  where id = p_child_id
  limit 1;
$$;

grant execute on function get_child_profile(uuid) to anon;
