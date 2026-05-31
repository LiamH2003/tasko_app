import { supabase } from '@/lib/supabase';
import type { MoodEntryRow } from '@/lib/database.types';

// Bug 5 & 7: uses server-side current_date (no timezone math) and bypasses RLS
export async function getTodayMoodForChild(
  childId: string,
): Promise<MoodEntryRow['mood'] | null> {
  const { data, error } = await supabase.rpc('get_today_mood_for_child', {
    p_child_id: childId,
  });
  if (error) return null;
  return (data as MoodEntryRow['mood'] | null) ?? null;
}

// Bug 6: bypasses RLS via SECURITY DEFINER
export async function getMoodHistory(
  childId: string,
  fromDate: string,
): Promise<MoodEntryRow[]> {
  const { data, error } = await supabase.rpc('get_mood_history', {
    p_child_id: childId,
    p_from_date: fromDate,
  });
  if (error) throw error;
  return (data as MoodEntryRow[]) ?? [];
}
