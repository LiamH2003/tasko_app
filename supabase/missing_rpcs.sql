-- ============================================================
-- Missing RPCs for the parent dashboard and settings
-- Run this in Supabase SQL Editor.
-- All functions use SECURITY DEFINER to bypass RLS on
-- families / family_members / auth.users.
-- ============================================================


-- ── get_my_family ────────────────────────────────────────────
-- Returns the family the current user belongs to.
-- Returns an empty array if the user is not in any family.
create or replace function get_my_family()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_row     record;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Niet ingelogd';
  end if;

  select f.id, f.name, f.family_code
  into   v_row
  from   families f
  join   family_members fm on fm.family_id = f.id
  where  fm.user_id = v_user_id
  limit  1;

  if v_row.id is null then
    return '[]'::json;
  end if;

  return json_build_array(
    json_build_object(
      'id',          v_row.id,
      'name',        v_row.name,
      'family_code', v_row.family_code
    )
  );
end;
$$;

grant execute on function get_my_family() to authenticated;


-- ── update_family_name ───────────────────────────────────────
-- Updates the name of the family the current user admins.
create or replace function update_family_name(p_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id  uuid;
  v_family_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Niet ingelogd';
  end if;

  select family_id into v_family_id
  from   family_members
  where  user_id = v_user_id and role = 'admin'
  limit  1;

  if v_family_id is null then
    raise exception 'Geen beheerdersrechten voor dit gezin';
  end if;

  update families set name = p_name where id = v_family_id;
end;
$$;

grant execute on function update_family_name(text) to authenticated;


-- ── regenerate_family_code ───────────────────────────────────
-- Generates a new unique invite code for the admin's family.
-- Returns the new code as text.
create or replace function regenerate_family_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id   uuid;
  v_family_id uuid;
  v_code      text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Niet ingelogd';
  end if;

  select family_id into v_family_id
  from   family_members
  where  user_id = v_user_id and role = 'admin'
  limit  1;

  if v_family_id is null then
    raise exception 'Geen beheerdersrechten voor dit gezin';
  end if;

  loop
    v_code := upper(substring(md5(random()::text) from 1 for 6));
    exit when not exists (select 1 from families where family_code = v_code);
  end loop;

  update families set family_code = v_code where id = v_family_id;

  return v_code;
end;
$$;

grant execute on function regenerate_family_code() to authenticated;


-- ── get_family_members_with_names ────────────────────────────
-- Returns all members of the current user's family with their
-- first_name and email pulled from auth.users metadata.
create or replace function get_family_members_with_names()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id   uuid;
  v_family_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Niet ingelogd';
  end if;

  select family_id into v_family_id
  from   family_members
  where  user_id = v_user_id
  limit  1;

  if v_family_id is null then
    return '[]'::json;
  end if;

  return (
    select coalesce(json_agg(
      json_build_object(
        'user_id',    fm.user_id,
        'role',       fm.role,
        'joined_at',  fm.joined_at,
        'first_name', u.raw_user_meta_data->>'first_name',
        'email',      u.email
      ) order by fm.joined_at
    ), '[]'::json)
    from   family_members fm
    join   auth.users u on u.id = fm.user_id
    where  fm.family_id = v_family_id
  );
end;
$$;

grant execute on function get_family_members_with_names() to authenticated;


-- ── remove_family_member ─────────────────────────────────────
-- Removes a member from the family. Only admins can do this,
-- and an admin cannot remove themselves.
create or replace function remove_family_member(p_user_id uuid)
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
  if v_user_id is null then
    raise exception 'Niet ingelogd';
  end if;

  if v_user_id = p_user_id then
    raise exception 'Je kunt jezelf niet verwijderen';
  end if;

  select family_id into v_family_id
  from   family_members
  where  user_id = v_user_id and role = 'admin'
  limit  1;

  if v_family_id is null then
    raise exception 'Geen beheerdersrechten voor dit gezin';
  end if;

  delete from family_members
  where  family_id = v_family_id
    and  user_id   = p_user_id;
end;
$$;

grant execute on function remove_family_member(uuid) to authenticated;


-- ── delete_my_account ────────────────────────────────────────
-- Deletes the current user's family membership and auth record.
-- If the user is the admin and sole creator of the family,
-- the family and its children cascade-delete automatically.
create or replace function delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Niet ingelogd';
  end if;

  -- Remove from family (cascade handles children if admin)
  delete from family_members where user_id = v_user_id;

  -- Delete the auth user (requires service-role privileges via SECURITY DEFINER)
  delete from auth.users where id = v_user_id;
end;
$$;

grant execute on function delete_my_account() to authenticated;
