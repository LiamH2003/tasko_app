-- ============================================================
-- Fix child task RPCs to be date-aware
--
-- Bug 1: get_child_routines read tasks.completed (static boolean, never resets).
--        Now reads from task_completions for current_date instead.
-- Bug 6: get_child_routines showed weekday-only routines on weekends.
--        Now filters by days_of_week (0=Mon … 6=Sun, empty = every day).
-- Bug 7: uncomplete_task_for_child is rewritten to delete the dated row,
--        revert tasks.completed, and reverse the XP award.
--
-- NOTE: get_child_routines uses DROP + CREATE because the live function
-- returns jsonb and CREATE OR REPLACE cannot change the return type.
--
-- Run in Supabase SQL Editor (Dashboard → SQL Editor).
-- ============================================================


-- ── get_child_routines ───────────────────────────────────────
-- DROP first because the live function returns jsonb; CREATE OR REPLACE
-- cannot change the return type from json to jsonb or vice-versa.
drop function if exists get_child_routines(uuid);

create function get_child_routines(p_child_id uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id',             r.id,
        'name',           r.name,
        'scheduled_time', r.scheduled_time,
        'tasks', (
          select coalesce(
            jsonb_agg(
              jsonb_build_object(
                'id',         t.id,
                'title',      t.title,
                'emoji',      t.emoji,
                'completed',  exists(
                  select 1 from task_completions tc
                  where tc.task_id        = t.id
                    and tc.child_id       = p_child_id
                    and tc.completed_date = current_date
                ),
                'sort_order', t.sort_order
              )
              order by t.sort_order
            ),
            '[]'::jsonb
          )
          from tasks t
          where t.routine_id = r.id
        )
      )
      order by r.created_at
    ),
    '[]'::jsonb
  )
  from routines r
  where r.child_id = p_child_id
    and (
      -- empty or null days_of_week means "every day"
      r.days_of_week is null
      or array_length(r.days_of_week, 1) is null
      -- extract(isodow) → 1=Mon…7=Sun; app stores 0=Mon…6=Sun
      or (extract(isodow from current_date)::int - 1) = any(r.days_of_week)
    );
$$;

grant execute on function get_child_routines(uuid) to anon;


-- ── complete_task_for_child ──────────────────────────────────
create or replace function complete_task_for_child(p_task_id uuid, p_child_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task_valid     boolean;
  v_already_done   boolean;
  v_child          children%rowtype;
  v_new_xp         integer;
  v_new_level      integer;
  v_new_xp_to_next integer;
  v_new_stage      text;
  xp_reward        constant integer := 20;
begin
  -- Verify the task belongs to this child
  select exists(
    select 1 from tasks t
    join routines r on r.id = t.routine_id
    where t.id = p_task_id and r.child_id = p_child_id
  ) into v_task_valid;
  if not v_task_valid then return; end if;

  -- Skip if already completed today (idempotent)
  select exists(
    select 1 from task_completions
    where task_id = p_task_id
      and child_id = p_child_id
      and completed_date = current_date
  ) into v_already_done;
  if v_already_done then return; end if;

  -- Record dated completion
  insert into task_completions(task_id, child_id, completed_date)
  values(p_task_id, p_child_id, current_date);

  -- Keep tasks.completed in sync for any backward-compat reads
  update tasks set completed = true where id = p_task_id;

  -- Award XP + handle level-up (mirrors utils/xp.ts logic)
  select * into v_child from children where id = p_child_id;

  v_new_xp         := v_child.xp + xp_reward;
  v_new_level      := v_child.level;
  v_new_xp_to_next := v_child.xp_to_next_level;

  while v_new_xp >= v_new_xp_to_next loop
    v_new_xp         := v_new_xp - v_new_xp_to_next;
    v_new_level      := v_new_level + 1;
    v_new_xp_to_next := round(100 * power(1.5, v_new_level - 1));
  end loop;

  v_new_stage := case
    when v_new_level >= 10 then 'adult'
    when v_new_level >= 7  then 'teen'
    when v_new_level >= 4  then 'child'
    when v_new_level >= 2  then 'baby'
    else 'egg'
  end;

  update children set
    xp               = v_new_xp,
    level            = v_new_level,
    xp_to_next_level = v_new_xp_to_next,
    stage            = v_new_stage
  where id = p_child_id;
end;
$$;

grant execute on function complete_task_for_child(uuid, uuid) to anon;


-- ── uncomplete_task_for_child ────────────────────────────────
create or replace function uncomplete_task_for_child(p_task_id uuid, p_child_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task_valid boolean;
  v_was_done   boolean;
  xp_reward    constant integer := 20;
begin
  -- Verify the task belongs to this child
  select exists(
    select 1 from tasks t
    join routines r on r.id = t.routine_id
    where t.id = p_task_id and r.child_id = p_child_id
  ) into v_task_valid;
  if not v_task_valid then return; end if;

  -- Only undo a completion that happened today
  select exists(
    select 1 from task_completions
    where task_id = p_task_id
      and child_id = p_child_id
      and completed_date = current_date
  ) into v_was_done;
  if not v_was_done then return; end if;

  -- Remove today's completion row
  delete from task_completions
  where task_id = p_task_id
    and child_id = p_child_id
    and completed_date = current_date;

  -- Keep tasks.completed in sync
  update tasks set completed = false where id = p_task_id;

  -- Reverse the XP award (floor at 0; level-ups are not reversed)
  update children
  set xp = greatest(0, xp - xp_reward)
  where id = p_child_id;
end;
$$;

grant execute on function uncomplete_task_for_child(uuid, uuid) to anon;
