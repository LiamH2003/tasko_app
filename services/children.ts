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

function generateInviteCode(): string {
  // Exclude visually ambiguous characters (O, 0, I, 1, L)
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `TASKO-${suffix}`;
}

export async function createChildWithCode(familyName: string): Promise<ChildRow> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Niet ingelogd');

  const invite_code = generateInviteCode();
  const { data, error } = await supabase
    .from('children')
    .insert({ parent_id: user.id, name: familyName, monster_name: 'Monster', invite_code })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getChildByInviteCode(code: string): Promise<ChildRow | null> {
  const { data, error } = await supabase.rpc('get_child_by_invite_code', { code });
  if (error) throw error;
  return (data as ChildRow[])?.[0] ?? null;
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
