import { supabase } from '@/lib/supabase';
import type { ChildRow } from '@/lib/database.types';

export async function getChildren(): Promise<ChildRow[]> {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .order('created_at');
  if (error) throw error;
  return data;
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
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Niet ingelogd');

  const { data, error } = await supabase
    .from('children')
    .insert({ parent_id: user.id, name, monster_name: monsterName })
    .select()
    .single();
  if (error) throw error;
  return data;
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

export async function applyXpToChild(
  child: ChildRow,
  amount: number,
): Promise<ChildRow> {
  let { xp, level } = child;
  xp += amount;
  // Level-up loop — mirrors the xpToNextLevel curve from utils/xp.ts
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
