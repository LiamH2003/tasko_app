-- ============================================================
-- Fix dismiss_honesty_flag to accept an optional routine_name
-- so two same-type same-date flags (e.g. two late_window flags
-- on the same day for different routines) can be dismissed
-- individually instead of both at once.
--
-- Run in Supabase SQL Editor (Dashboard → SQL Editor).
-- ============================================================

-- Drop the old signature first (takes 3 params: child_id, flag_type, flag_date)
drop function if exists dismiss_honesty_flag(uuid, text, date);
drop function if exists dismiss_honesty_flag(uuid, text, text);

create or replace function dismiss_honesty_flag(
  p_child_id    uuid,
  p_flag_type   text,
  p_flag_date   date,
  p_routine_name text default null
)
returns void
language sql
security definer
set search_path = public
as $$
  delete from honesty_flags
  where child_id  = p_child_id
    and flag_type = p_flag_type
    and flag_date = p_flag_date
    and (
      -- When a routine_name is supplied, only delete the matching flag.
      -- When null, delete all flags of that type+date (backward-compat).
      p_routine_name is null
      or routine_name = p_routine_name
      or (routine_name is null and p_routine_name is null)
    );
$$;

grant execute on function dismiss_honesty_flag(uuid, text, date, text) to anon;
