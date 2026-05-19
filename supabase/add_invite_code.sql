-- Add invite_code column to children table
alter table children add column if not exists invite_code text unique;

-- RPC that child devices (no auth session) can call to look up their slot by code
-- security definer runs as the function owner (postgres), bypassing RLS
create or replace function get_child_by_invite_code(code text)
returns table(
  id               uuid,
  parent_id        uuid,
  name             text,
  monster_name     text,
  level            integer,
  xp               integer,
  xp_to_next_level integer,
  stage            text,
  invite_code      text,
  created_at       timestamptz
)
language sql
security definer
set search_path = public
as $$
  select id, parent_id, name, monster_name, level, xp, xp_to_next_level, stage, invite_code, created_at
  from children
  where invite_code = code
  limit 1;
$$;

-- Allow anonymous (unauthenticated) callers to invoke this function
grant execute on function get_child_by_invite_code(text) to anon;
