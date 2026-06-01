import { supabase } from '@/lib/supabase';
import type { ChildRow } from '@/lib/database.types';

export async function getChildren(): Promise<ChildRow[]> {
  const { data, error } = await supabase.rpc('get_children_for_parent');
  if (error) throw error;
  return (data as ChildRow[]) ?? [];
}

export async function updateChildProfile(
  childId: string,
  updates: { name?: string; monster_name?: string },
): Promise<void> {
  const { error } = await supabase.rpc('update_child_profile', {
    p_child_id: childId,
    p_name: updates.name ?? null,
    p_monster_name: updates.monster_name ?? null,
  });
  if (error) throw error;
}

export async function saveChildPin(childId: string, pin: string): Promise<void> {
  const { error } = await supabase.rpc('set_child_pin', { p_child_id: childId, p_pin: pin });
  if (error) throw error;
}

export async function verifyChildPin(childId: string, pin: string): Promise<boolean | null> {
  const { data, error } = await supabase.rpc('verify_child_pin', {
    p_child_id: childId,
    p_pin: pin,
  });
  if (error) throw error;
  if (data === null) return null;
  return data as boolean;
}

export async function deleteChild(childId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_child', { p_child_id: childId });
  if (error) throw error;
}

export async function resetChildPin(childId: string): Promise<void> {
  const { error } = await supabase.rpc('reset_child_pin', { p_child_id: childId });
  if (error) throw error;
}
