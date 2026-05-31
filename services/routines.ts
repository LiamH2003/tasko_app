import { supabase } from '@/lib/supabase';
import type { RoutineWithTasks } from '@/lib/database.types';

// Bug 17: getRoutines (direct read, stale completed boolean) removed — use getRoutinesForDate.
// Bug 16: completeTask / uncompleteTask (direct writes, bypass task_completions) removed.

export async function getRoutinesForDate(
  childId: string,
  date: string,
): Promise<RoutineWithTasks[]> {
  const { data, error } = await supabase.rpc('get_routines_for_date', {
    p_child_id: childId,
    p_date: date,
  });
  if (error) throw error;
  return (data as RoutineWithTasks[]) ?? [];
}

// Bug 14: all writes now go through SECURITY DEFINER RPCs to bypass RLS.

export async function createRoutine(
  childId: string,
  name: string,
  emoji: string,
  scheduledTime?: string,
  daysOfWeek: number[] = [],
): Promise<void> {
  const { error } = await supabase.rpc('create_routine', {
    p_child_id:       childId,
    p_name:           name,
    p_emoji:          emoji,
    p_scheduled_time: scheduledTime ?? null,
    p_days_of_week:   daysOfWeek,
  });
  if (error) throw error;
}

// Bug 15: updateRoutine was dead code — now wired and uses an RPC.
export async function updateRoutine(
  id: string,
  updates: { name: string; emoji: string; scheduled_time: string | null; days_of_week: number[] },
): Promise<void> {
  const { error } = await supabase.rpc('update_routine', {
    p_routine_id:     id,
    p_name:           updates.name,
    p_emoji:          updates.emoji,
    p_scheduled_time: updates.scheduled_time,
    p_days_of_week:   updates.days_of_week,
  });
  if (error) throw error;
}

export async function addTask(
  routineId: string,
  title: string,
  emoji = '✅',
  sortOrder = 0,
): Promise<void> {
  const { error } = await supabase.rpc('add_task', {
    p_routine_id: routineId,
    p_title:      title,
    p_emoji:      emoji,
    p_sort_order: sortOrder,
  });
  if (error) throw error;
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_task', { p_task_id: taskId });
  if (error) throw error;
}

export async function deleteRoutine(id: string): Promise<void> {
  const { error } = await supabase.rpc('delete_routine', { p_routine_id: id });
  if (error) throw error;
}
