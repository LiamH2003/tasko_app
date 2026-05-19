-- ============================================================
-- Child device RPC functions
-- Child devices have no auth session (anon role).
-- These security definer functions bypass RLS so children
-- can read their profile/routines and write completions/moods.
-- Run this in Supabase SQL Editor.
-- ============================================================

-- ── Get child profile ────────────────────────────────────────
create or replace function get_child_profile(p_child_id uuid)
returns table(
  id               uuid,
  name             text,
  monster_name     text,
  level            integer,
  xp               integer,
  xp_to_next_level integer,
  stage            text,
  invite_code      text
)
language sql
security definer
set search_path = public
as $$
  select id, name, monster_name, level, xp, xp_to_next_level, stage, invite_code
  from children
  where id = p_child_id
  limit 1;
$$;

grant execute on function get_child_profile(uuid) to anon;

-- ── Get child routines + tasks (nested JSON) ─────────────────
create or replace function get_child_routines(p_child_id uuid)
returns json
language sql
security definer
set search_path = public
as $$
  select coalesce(
    json_agg(
      json_build_object(
        'id', r.id,
        'name', r.name,
        'scheduled_time', r.scheduled_time,
        'tasks', (
          select coalesce(
            json_agg(
              json_build_object(
                'id', t.id,
                'title', t.title,
                'emoji', t.emoji,
                'completed', t.completed,
                'sort_order', t.sort_order
              )
              order by t.sort_order
            ),
            '[]'::json
          )
          from tasks t
          where t.routine_id = r.id
        )
      )
      order by r.created_at
    ),
    '[]'::json
  )
  from routines r
  where r.child_id = p_child_id;
$$;

grant execute on function get_child_routines(uuid) to anon;

-- ── Complete a task + award XP + handle level-up ─────────────
create or replace function complete_task_for_child(p_task_id uuid, p_child_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_child          children%rowtype;
  v_task_valid     boolean;
  v_new_xp         integer;
  v_new_level      integer;
  v_new_xp_to_next integer;
  v_new_stage      text;
  xp_reward        constant integer := 20;
begin
  -- Only proceed if the task belongs to this child and isn't done yet
  select exists(
    select 1 from tasks t
    join routines r on r.id = t.routine_id
    where t.id = p_task_id
      and r.child_id = p_child_id
      and not t.completed
  ) into v_task_valid;

  if not v_task_valid then return; end if;

  -- Mark task done
  update tasks set completed = true where id = p_task_id;

  -- Load child
  select * into v_child from children where id = p_child_id;

  -- Calculate XP + level-up (mirrors utils/xp.ts logic)
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

-- ── Log a mood entry ─────────────────────────────────────────
create or replace function log_mood_entry(p_child_id uuid, p_mood text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into mood_entries(child_id, mood) values(p_child_id, p_mood);
$$;

grant execute on function log_mood_entry(uuid, text) to anon;

-- ── Update child name (fixes name saved during onboarding) ───
create or replace function update_child_name(p_child_id uuid, p_name text)
returns void
language sql
security definer
set search_path = public
as $$
  update children set name = p_name where id = p_child_id;
$$;

grant execute on function update_child_name(uuid, text) to anon;
