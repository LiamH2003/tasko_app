import { supabase } from '@/lib/supabase';
import type { MoodEntryRow } from '@/lib/database.types';

export async function logMood(
  childId: string,
  mood: MoodEntryRow['mood'],
  note?: string,
): Promise<MoodEntryRow> {
  const { data, error } = await supabase
    .from('mood_entries')
    .insert({ child_id: childId, mood, note: note ?? null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMoodHistory(
  childId: string,
  limit = 30,
): Promise<MoodEntryRow[]> {
  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('child_id', childId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
