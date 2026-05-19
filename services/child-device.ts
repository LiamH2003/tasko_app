import { supabase } from '@/lib/supabase';

export type ChildProfile = {
  id: string;
  name: string;
  monster_name: string;
  level: number;
  xp: number;
  xp_to_next_level: number;
  stage: 'egg' | 'baby' | 'child' | 'teen' | 'adult';
  invite_code: string | null;
};

export type ChildTask = {
  id: string;
  title: string;
  emoji: string;
  completed: boolean;
  sort_order: number;
};

export type ChildRoutine = {
  id: string;
  name: string;
  scheduled_time: string | null;
  tasks: ChildTask[];
};

export async function fetchChildProfile(childId: string): Promise<ChildProfile | null> {
  const { data, error } = await supabase.rpc('get_child_profile', { p_child_id: childId });
  if (error) throw error;
  return (data as ChildProfile[])?.[0] ?? null;
}

export async function fetchChildRoutines(childId: string): Promise<ChildRoutine[]> {
  const { data, error } = await supabase.rpc('get_child_routines', { p_child_id: childId });
  if (error) throw error;
  return (data as ChildRoutine[]) ?? [];
}

export async function completeTask(taskId: string, childId: string): Promise<void> {
  const { error } = await supabase.rpc('complete_task_for_child', {
    p_task_id: taskId,
    p_child_id: childId,
  });
  if (error) throw error;
}

export async function submitMood(childId: string, mood: string): Promise<void> {
  const { error } = await supabase.rpc('log_mood_entry', {
    p_child_id: childId,
    p_mood: mood,
  });
  if (error) throw error;
}

export async function updateChildName(childId: string, name: string): Promise<void> {
  const { error } = await supabase.rpc('update_child_name', {
    p_child_id: childId,
    p_name: name,
  });
  if (error) throw error;
}
