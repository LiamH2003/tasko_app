import { supabase } from '@/lib/supabase';

export type FocusSession = {
  duration_seconds: number;
  subject: string | null;
  completed_at: string;
};

export async function getFocusSessions(
  childId: string,
  days = 7,
): Promise<FocusSession[]> {
  const { data, error } = await supabase.rpc('get_focus_sessions_for_parent', {
    p_child_id: childId,
    p_days: days,
  });
  if (error) throw error;
  return (data as FocusSession[]) ?? [];
}
