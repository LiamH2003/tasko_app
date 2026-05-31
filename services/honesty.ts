import { supabase } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

export type RawCompletion = {
  id: string;
  task_title: string;
  routine_name: string;
  completed_date: string;
  created_at: string;
};

export type DismissedFlag = {
  flag_type: string;
  flag_date: string;
};

export type HonestyFlag = {
  type: 'burst' | 'off_hours';
  date: string;
  taskNames: string[];
  durationSeconds?: number;
  time?: string;
};

// ── API ───────────────────────────────────────────────────────────────────────

export async function getCompletionsForParent(
  childId: string,
  days = 14,
): Promise<RawCompletion[]> {
  const { data, error } = await supabase.rpc('get_completions_for_parent', {
    p_child_id: childId,
    p_days: days,
  });
  if (error) throw error;
  return (data as RawCompletion[]) ?? [];
}

export async function getDismissedFlags(childId: string): Promise<DismissedFlag[]> {
  const { data, error } = await supabase.rpc('get_dismissed_flags', { p_child_id: childId });
  if (error) return [];
  return (data as DismissedFlag[]) ?? [];
}

export async function getHonestyFlags(
  childId: string,
  days = 14,
): Promise<HonestyFlag[]> {
  const { data, error } = await supabase.rpc('detect_honesty_flags', {
    p_child_id: childId,
    p_days: days,
  });
  if (error) throw error;
  return (data as HonestyFlag[]) ?? [];
}

export async function dismissHonestyFlag(
  childId: string,
  flagType: string,
  flagDate: string,
): Promise<void> {
  const { error } = await supabase.rpc('dismiss_honesty_flag', {
    p_child_id: childId,
    p_flag_type: flagType,
    p_flag_date: flagDate,
  });
  if (error) throw error;
}
