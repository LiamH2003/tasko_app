-- ============================================================
-- fix_update_child_profile_anon
-- Run this in Supabase SQL Editor.
--
-- The previous update_child_profile checked auth.uid() and
-- was granted only to authenticated. But child/profile.tsx
-- and child/monster-select.tsx call it during onboarding
-- when the child has no auth session (anon role).
--
-- Fix: grant to anon, and skip the family membership guard
-- when the caller is unauthenticated (auth.uid() IS NULL).
-- The authenticated parent path keeps its family check.
-- ============================================================

drop function if exists update_child_profile(uuid, text, text);

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
  v_user_id   uuid;
  v_family_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is not null then
    -- Authenticated parent: verify the child belongs to their family
    select family_id into v_family_id
    from   family_members
    where  user_id = v_user_id
    limit  1;

    if v_family_id is null then
      raise exception 'Geen gezin gevonden';
    end if;

    if not exists (
      select 1 from children
      where id = p_child_id and family_id = v_family_id
    ) then
      raise exception 'Kind niet gevonden in uw gezin';
    end if;
  end if;
  -- Unauthenticated child (anon): trust the child_id directly.
  -- The child can only reach this during their own onboarding.

  update children set
    name         = coalesce(p_name,         name),
    monster_name = coalesce(p_monster_name, monster_name)
  where id = p_child_id;
end;
$$;

grant execute on function update_child_profile(uuid, text, text) to anon;
grant execute on function update_child_profile(uuid, text, text) to authenticated;
