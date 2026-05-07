-- ============================================================
-- Tasko Tracker — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Children ────────────────────────────────────────────────
create table if not exists children (
  id               uuid primary key default gen_random_uuid(),
  parent_id        uuid references auth.users on delete cascade not null,
  name             text not null,
  monster_name     text not null default 'Blub',
  level            integer not null default 1,
  xp               integer not null default 0,
  xp_to_next_level integer not null default 100,
  stage            text not null default 'egg'
                   check (stage in ('egg','baby','child','teen','adult')),
  created_at       timestamptz not null default now()
);

alter table children enable row level security;

create policy "Parents can read their own children"
  on children for select
  using (parent_id = auth.uid());

create policy "Parents can insert their own children"
  on children for insert
  with check (parent_id = auth.uid());

create policy "Parents can update their own children"
  on children for update
  using (parent_id = auth.uid());

create policy "Parents can delete their own children"
  on children for delete
  using (parent_id = auth.uid());

-- ── Routines ────────────────────────────────────────────────
create table if not exists routines (
  id             uuid primary key default gen_random_uuid(),
  child_id       uuid references children on delete cascade not null,
  name           text not null,
  scheduled_time text,
  created_at     timestamptz not null default now()
);

alter table routines enable row level security;

create policy "Parents can manage routines for their children"
  on routines for all
  using (
    child_id in (select id from children where parent_id = auth.uid())
  );

-- ── Tasks ────────────────────────────────────────────────────
create table if not exists tasks (
  id         uuid primary key default gen_random_uuid(),
  routine_id uuid references routines on delete cascade not null,
  title      text not null,
  emoji      text not null default '✅',
  completed  boolean not null default false,
  sort_order integer not null default 0
);

alter table tasks enable row level security;

create policy "Parents can manage tasks for their children's routines"
  on tasks for all
  using (
    routine_id in (
      select r.id from routines r
      join children c on c.id = r.child_id
      where c.parent_id = auth.uid()
    )
  );

-- ── Mood entries ─────────────────────────────────────────────
create table if not exists mood_entries (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid references children on delete cascade not null,
  mood       text not null
             check (mood in ('great','good','okay','sad','angry')),
  note       text,
  created_at timestamptz not null default now()
);

alter table mood_entries enable row level security;

create policy "Parents can manage mood entries for their children"
  on mood_entries for all
  using (
    child_id in (select id from children where parent_id = auth.uid())
  );
