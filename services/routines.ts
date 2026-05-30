import { supabase } from '@/lib/supabase';
import type { RoutineRow, TaskRow, RoutineWithTasks } from '@/lib/database.types';

export async function getRoutines(childId: string): Promise<RoutineWithTasks[]> {
  const { data, error } = await supabase
    .from('routines')
    .select('*, tasks(*)')
    .eq('child_id', childId)
    .order('created_at');
  if (error) throw error;
  return data as RoutineWithTasks[];
}

export async function createRoutine(
  childId: string,
  name: string,
  emoji: string,
  scheduledTime?: string,
  daysOfWeek: number[] = [],
): Promise<RoutineRow> {
  const { data, error } = await supabase
    .from('routines')
    .insert({
      child_id: childId,
      name,
      emoji,
      scheduled_time: scheduledTime ?? null,
      days_of_week: daysOfWeek,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

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

export async function updateRoutine(
  id: string,
  updates: Partial<RoutineRow>,
): Promise<RoutineRow> {
  const { data, error } = await supabase
    .from('routines')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRoutine(id: string): Promise<void> {
  const { error } = await supabase.from('routines').delete().eq('id', id);
  if (error) throw error;
}

export async function addTask(
  routineId: string,
  title: string,
  emoji = '✅',
  sortOrder = 0,
): Promise<TaskRow> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ routine_id: routineId, title, emoji, sort_order: sortOrder })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) throw error;
}

export async function completeTask(taskId: string): Promise<TaskRow> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ completed: true })
    .eq('id', taskId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uncompleteTask(taskId: string): Promise<TaskRow> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ completed: false })
    .eq('id', taskId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
