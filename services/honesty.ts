import { supabase } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

export type HonestyFlag = {
  type: 'burst' | 'off_hours' | 'missed_window' | 'late_window';
  date: string;
  taskNames: string[];
  durationSeconds?: number;
  time?: string;
  routineName?: string;
  scheduledTime?: string;
  windowMinutes?: number;
  actualTime?: string;
};

// ── API ───────────────────────────────────────────────────────────────────────

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
