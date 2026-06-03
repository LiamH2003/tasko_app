-- ============================================================
-- get_children_for_parent — co-parent aware version
-- Run this in Supabase SQL Editor.
--
-- The original version (if it exists) likely filtered by
-- parent_id or created_by, which means co-parents saw an
-- empty dashboard. This version joins through family_members
-- so both the admin and every co-parent see the same children.
-- ============================================================

create or replace function get_children_for_parent()
returns setof children
language sql
security definer
set search_path = public
as $$
  select c.*
  from   children c
  join   family_members fm
    on   fm.family_id = c.family_id
  where  fm.user_id = auth.uid()
  order  by c.created_at;
$$;

grant execute on function get_children_for_parent() to authenticated;
