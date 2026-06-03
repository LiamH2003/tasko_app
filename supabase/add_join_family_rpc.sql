-- ============================================================
-- join_family_by_code
-- Run this in Supabase SQL Editor BEFORE deploying the app
-- update that calls it.
--
-- Mirrors the atomic pattern of create_family_for_user:
-- looks up the family, guards against duplicate membership,
-- inserts the co-parent row, and returns the family data the
-- client needs for auth-metadata sync — all in one transaction.
-- SECURITY DEFINER bypasses RLS on families + family_members.
-- ============================================================

create or replace function join_family_by_code(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_family  record;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Niet ingelogd';
  end if;

  -- Look up the family by its invite code
  select id, name, family_code
  into   v_family
  from   families
  where  family_code = p_code
  limit  1;

  if v_family.id is null then
    raise exception 'Onbekende code. Controleer de code bij je partner.';
  end if;

  -- Prevent duplicate membership (idempotency guard)
  if exists (
    select 1
    from   family_members
    where  family_id = v_family.id
      and  user_id   = v_user_id
  ) then
    raise exception 'Je bent al lid van dit gezin.';
  end if;

  -- Add the caller as a co-parent
  insert into family_members (family_id, user_id, role)
  values (v_family.id, v_user_id, 'parent');

  return json_build_object(
    'family_id',   v_family.id,
    'family_name', v_family.name,
    'family_code', v_family.family_code
  );
end;
$$;

-- Only authenticated users (not anon children) may join a family
grant execute on function join_family_by_code(text) to authenticated;
