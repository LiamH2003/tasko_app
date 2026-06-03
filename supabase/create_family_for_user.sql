-- ============================================================
-- create_family_for_user
-- Run this in Supabase SQL Editor.
--
-- Creates a family + adds the caller as admin in one transaction.
-- SECURITY DEFINER bypasses RLS on families + family_members.
-- ============================================================

create or replace function create_family_for_user(p_name text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id    uuid;
  v_family_id  uuid;
  v_code       text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Niet ingelogd';
  end if;

  -- Generate a unique 6-character uppercase invite code
  loop
    v_code := upper(substring(md5(random()::text) from 1 for 6));
    exit when not exists (select 1 from families where family_code = v_code);
  end loop;

  -- Create the family
  insert into families (name, family_code, created_by)
  values (p_name, v_code, v_user_id)
  returning id into v_family_id;

  -- Add the caller as admin
  insert into family_members (family_id, user_id, role)
  values (v_family_id, v_user_id, 'admin');

  return json_build_object(
    'id',          v_family_id,
    'name',        p_name,
    'family_code', v_code
  );
end;
$$;

grant execute on function create_family_for_user(text) to authenticated;
