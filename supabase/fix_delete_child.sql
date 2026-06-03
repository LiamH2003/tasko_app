-- ============================================================
-- fix_delete_child
-- Run this in the Supabase SQL Editor.
--
-- The old version used: WHERE id = p_child_id AND parent_id = auth.uid()
-- This blocked co-parents from deleting children even though the
-- UI shows the delete button to all family members.
--
-- The new version mirrors reset_child_pin: look up the caller's
-- family via family_members, verify the child belongs to it,
-- then delete. Raises a clear exception if the check fails so
-- the client surfaces the error rather than silently doing nothing.
-- ============================================================

CREATE OR REPLACE FUNCTION public.delete_child(p_child_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_family_id uuid;
BEGIN
  SELECT family_id INTO v_family_id
  FROM family_members
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF v_family_id IS NULL THEN
    RAISE EXCEPTION 'Niet ingelogd of geen gezin gevonden';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM children
    WHERE id = p_child_id AND family_id = v_family_id
  ) THEN
    RAISE EXCEPTION 'Kind niet gevonden in uw gezin';
  END IF;

  DELETE FROM children WHERE id = p_child_id;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_child(uuid) TO authenticated;
