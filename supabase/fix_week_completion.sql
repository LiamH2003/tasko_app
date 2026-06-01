-- ============================================================
-- Fix get_week_completion to read from task_completions and
-- filter totals by days_of_week.
--
-- Uses DROP + CREATE because the live function returns jsonb
-- while the previous version of this file used returns table(),
-- and CREATE OR REPLACE cannot change the return type.
--
-- Run in Supabase SQL Editor.
-- ============================================================

drop function if exists get_week_completion(uuid);

create function get_week_completion(p_child_id uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  with week_days as (
    select generate_series(
      date_trunc('week', current_date)::date,
      date_trunc('week', current_date)::date + 6,
      interval '1 day'
    )::date as day
  ),
  daily as (
    select
      wd.day,
      count(tc.task_id)::integer as done,
      (
        select count(t.id)::integer
        from tasks t
        join routines r on r.id = t.routine_id
        where r.child_id = p_child_id
          and (
            r.days_of_week is null
            or array_length(r.days_of_week, 1) is null
            or (extract(isodow from wd.day)::int - 1) = any(r.days_of_week)
          )
      ) as total
    from week_days wd
    left join task_completions tc
      on  tc.child_id      = p_child_id
      and tc.completed_date = wd.day
    group by wd.day
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'date',  to_char(day, 'YYYY-MM-DD'),
        'done',  done,
        'total', total
      )
      order by day
    ),
    '[]'::jsonb
  )
  from daily;
$$;

grant execute on function get_week_completion(uuid) to anon;
