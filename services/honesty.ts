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

// ── Detection (client-side) ───────────────────────────────────────────────────

export function detectFlags(
  completions: RawCompletion[],
  dismissed: DismissedFlag[],
): HonestyFlag[] {
  const flags: HonestyFlag[] = [];
  const dismissed_set = new Set(dismissed.map(d => `${d.flag_type}_${d.flag_date}`));

  // Group by date
  const byDate: Record<string, RawCompletion[]> = {};
  for (const c of completions) {
    if (!byDate[c.completed_date]) byDate[c.completed_date] = [];
    byDate[c.completed_date].push(c);
  }

  for (const [date, dayCompletions] of Object.entries(byDate)) {
    const sorted = [...dayCompletions].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    // Burst: 3+ tasks completed within 90 seconds
    if (!dismissed_set.has(`burst_${date}`)) {
      for (let i = 0; i <= sorted.length - 3; i++) {
        const start = new Date(sorted[i].created_at).getTime();
        const end   = new Date(sorted[i + 2].created_at).getTime();
        const secs  = (end - start) / 1000;
        if (secs < 90) {
          const burst = sorted.filter(
            c => new Date(c.created_at).getTime() <= start + 90_000,
          );
          flags.push({
            type: 'burst',
            date,
            taskNames: burst.map(c => c.task_title),
            durationSeconds: Math.round(secs),
          });
          break;
        }
      }
    }

    // Off-hours: task completed between 23:00 and 05:00
    if (!dismissed_set.has(`off_hours_${date}`)) {
      for (const c of sorted) {
        const d    = new Date(c.created_at);
        const hour = d.getHours();
        if (hour >= 23 || hour < 5) {
          const time = `${String(hour).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
          flags.push({ type: 'off_hours', date, taskNames: [c.task_title], time });
          break;
        }
      }
    }
  }

  return flags.sort((a, b) => b.date.localeCompare(a.date));
}
