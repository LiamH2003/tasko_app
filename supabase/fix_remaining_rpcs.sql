-- ============================================================
-- fix_remaining_rpcs
-- Run this in Supabase SQL Editor.
--
-- Creates all remaining missing RPCs:
--   update_child_profile   — parent edits child name / monster name
--   update_monster_name    — child renames their monster (no auth)
--   update_child_avatar    — updates avatar_url after storage upload
--   log_focus_session      — records a focus session (needs new table)
--   get_today_mood         — returns child's mood entry for today
--   get_daily_quote        — returns a rotating Dutch motivational quote
-- ============================================================


-- ── update_child_profile ─────────────────────────────────────
-- Called by authenticated parent from settings.
-- Updates name and/or monster_name; only overwrites non-null args.
-- Verifies the child belongs to the caller's family.
create or replace function update_child_profile(
  p_child_id     uuid,
  p_name         text,
  p_monster_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
begin
  select family_id into v_family_id
  from   family_members
  where  user_id = auth.uid()
  limit  1;

  if v_family_id is null then
    raise exception 'Niet ingelogd of geen gezin gevonden';
  end if;

  if not exists (
    select 1 from children
    where id = p_child_id and family_id = v_family_id
  ) then
    raise exception 'Kind niet gevonden in uw gezin';
  end if;

  update children set
    name         = coalesce(p_name,         name),
    monster_name = coalesce(p_monster_name, monster_name)
  where id = p_child_id;
end;
$$;

grant execute on function update_child_profile(uuid, text, text) to authenticated;


-- ── update_monster_name ──────────────────────────────────────
-- Called from the child device (no auth session → anon).
create or replace function update_monster_name(p_child_id uuid, p_name text)
returns void
language sql
security definer
set search_path = public
as $$
  update children set monster_name = p_name where id = p_child_id;
$$;

grant execute on function update_monster_name(uuid, text) to anon;


-- ── update_child_avatar ──────────────────────────────────────
-- Called after a successful storage upload to persist the URL.
-- Granted to both anon (child uploads own avatar) and
-- authenticated (parent uploads from settings).
create or replace function update_child_avatar(p_child_id uuid, p_avatar_url text)
returns void
language sql
security definer
set search_path = public
as $$
  update children set avatar_url = p_avatar_url where id = p_child_id;
$$;

grant execute on function update_child_avatar(uuid, text) to anon;
grant execute on function update_child_avatar(uuid, text) to authenticated;


-- ── focus_sessions table (needed by log_focus_session) ───────
create table if not exists focus_sessions (
  id               uuid primary key default gen_random_uuid(),
  child_id         uuid references children on delete cascade not null,
  duration_seconds integer not null,
  subject          text,
  created_at       timestamptz not null default now()
);


-- ── log_focus_session ────────────────────────────────────────
-- Called from the child device (no auth → anon).
create or replace function log_focus_session(
  p_child_id         uuid,
  p_duration_seconds integer,
  p_subject          text
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into focus_sessions(child_id, duration_seconds, subject)
  values(p_child_id, p_duration_seconds, p_subject);
$$;

grant execute on function log_focus_session(uuid, integer, text) to anon;


-- ── get_today_mood ───────────────────────────────────────────
-- Returns the most recent mood entry for the child today, or NULL.
create or replace function get_today_mood(p_child_id uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select mood::text
  from   mood_entries
  where  child_id   = p_child_id
    and  created_at >= current_date
    and  created_at <  current_date + interval '1 day'
  order  by created_at desc
  limit  1;
$$;

grant execute on function get_today_mood(uuid) to anon;
grant execute on function get_today_mood(uuid) to authenticated;


-- ── get_daily_quote ──────────────────────────────────────────
-- Returns one of 14 Dutch motivational quotes, rotating daily.
create or replace function get_daily_quote()
returns text
language sql
security definer
set search_path = public
as $$
  select (array[
    'Elke dag is een nieuwe kans om te groeien! 🌱',
    'Jij kunt alles wat je wilt bereiken. Ik ben er altijd voor je! 🌈',
    'Kleine stapjes leiden tot grote overwinningen! 🏆',
    'Fouten maken is ook leren. Ga zo door! ⭐',
    'Je bent sterker dan je denkt! 💪',
    'Vandaag is jouw dag om te schitteren! ✨',
    'Probeer, probeer, probeer het nog een keer! 🎯',
    'Trots op jou voor elke taak die je doet! 🎉',
    'Jij maakt het verschil, elke dag opnieuw! 🌟',
    'Geloof in jezelf, want ik geloof in jou! 🦋',
    'Iedere taak die je doet maakt je sterker! 🔥',
    'Samen staan we sterk! 🤝',
    'Jouw inspanning van vandaag is de overwinning van morgen! 🚀',
    'Wees trots op wie je bent! 🎈'
  ])[((extract(doy from current_date)::int - 1) % 14) + 1];
$$;

grant execute on function get_daily_quote() to anon;
grant execute on function get_daily_quote() to authenticated;
