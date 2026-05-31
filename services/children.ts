import { supabase } from '@/lib/supabase';
import type { ChildRow } from '@/lib/database.types';
import { getMyFamilyId } from '@/services/families';

export async function getChildren(): Promise<ChildRow[]> {
  const { data, error } = await supabase.rpc('get_children_for_parent');
  if (error) throw error;
  return (data as ChildRow[]) ?? [];
}

export async function getChild(id: string): Promise<ChildRow> {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createChild(name: string, monsterName: string): Promise<ChildRow> {
  const familyId = await getMyFamilyId();
  if (!familyId) throw new Error('Geen gezin gevonden');

  const { data, error } = await supabase
    .from('children')
    .insert({ family_id: familyId, name, monster_name: monsterName })
    .select()
    .single();
  if (error) throw error;
  return data;
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

export async function updateChild(id: string, updates: Partial<ChildRow>): Promise<ChildRow> {
  const { data, error } = await supabase
    .from('children')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function applyXpToChild(child: ChildRow, amount: number): Promise<ChildRow> {
  let { xp, level } = child;
  xp += amount;
  while (xp >= child.xp_to_next_level) {
    xp -= child.xp_to_next_level;
    level += 1;
  }
  const xpToNext = Math.round(100 * Math.pow(1.5, level - 1));
  const stage = stageForLevel(level);
  return updateChild(child.id, { xp, level, xp_to_next_level: xpToNext, stage });
}

function stageForLevel(level: number): ChildRow['stage'] {
  if (level >= 10) return 'adult';
  if (level >= 7)  return 'teen';
  if (level >= 4)  return 'child';
  if (level >= 2)  return 'baby';
  return 'egg';
}
