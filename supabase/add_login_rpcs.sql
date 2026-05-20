-- Get all children for a family using any child's invite code.
-- Used for child login: enter code → show all children to pick from.
create or replace function get_family_by_invite_code(p_code text)
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'family_name', coalesce(
      (
        select u.raw_user_meta_data->>'family_name'
        from auth.users u
        join children c on c.parent_id = u.id
        where c.invite_code = p_code
        limit 1
      ), ''
    ),
    'children', coalesce(
      (
        select json_agg(
          json_build_object(
            'id',           c.id,
            'name',         c.name,
            'monster_name', c.monster_name,
            'level',        c.level,
            'stage',        c.stage
          ) order by c.created_at
        )
        from children c
        where c.parent_id = (
          select parent_id from children where invite_code = p_code limit 1
        )
      ),
      '[]'::json
    )
  );
$$;

grant execute on function get_family_by_invite_code(text) to anon;
