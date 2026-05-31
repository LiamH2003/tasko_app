import { supabase } from '@/lib/supabase';

export type ChildProfile = {
  id: string;
  name: string;
  monster_name: string;
  level: number;
  xp: number;
  xp_to_next_level: number;
  stage: 'egg' | 'baby' | 'child' | 'teen' | 'adult';
  avatar_url: string | null;
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
  if (error) return null;
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

export async function uncompleteTask(taskId: string, childId: string): Promise<void> {
  const { error } = await supabase.rpc('uncomplete_task_for_child', {
    p_task_id: taskId,
    p_child_id: childId,
  });
  if (error) throw error;
}

export type WeekDay = {
  date: string;
  done: number;
  total: number;
};

export async function getWeekCompletion(childId: string): Promise<WeekDay[]> {
  const { data, error } = await supabase.rpc('get_week_completion', { p_child_id: childId });
  if (error) return [];
  return (data as WeekDay[]) ?? [];
}

export async function submitMood(childId: string, mood: string): Promise<void> {
  const { error } = await supabase.rpc('log_mood_entry', {
    p_child_id: childId,
    p_mood: mood,
  });
  if (error) throw error;
}

export async function getTodayMood(childId: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_today_mood', { p_child_id: childId });
  if (error) return null;
  return (data as string) ?? null;
}

export async function getDailyQuote(): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_daily_quote');
  if (error) return null;
  return (data as string) ?? null;
}

export type FamilyChild = {
  id: string;
  name: string;
  monster_name: string;
  level: number;
  stage: string;
  has_pin: boolean;
};

export type FamilyData = {
  family_name: string;
  children: FamilyChild[];
};

export async function getFamilyByCode(code: string): Promise<FamilyData | null> {
  const { data, error } = await supabase.rpc('get_family_by_code', { p_code: code });
  if (error) throw error;
  return (data as FamilyData) ?? null;
}

export async function updateChildName(childId: string, name: string): Promise<void> {
  const { error } = await supabase.rpc('update_child_name', {
    p_child_id: childId,
    p_name: name,
  });
  if (error) throw error;
}

export async function updateMonsterName(childId: string, name: string): Promise<void> {
  const { error } = await supabase.rpc('update_monster_name', {
    p_child_id: childId,
    p_name: name,
  });
  if (error) throw error;
}

export async function uploadChildAvatar(childId: string, localUri: string): Promise<string> {
  const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${childId}/avatar.${ext}`;
  const contentType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;

  const res = await fetch(localUri);
  const blob = await res.blob();

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, blob, { contentType, upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

export async function logFocusSession(childId: string, durationSeconds: number, subject: string): Promise<void> {
  const { error } = await supabase.rpc('log_focus_session', {
    p_child_id: childId,
    p_duration_seconds: durationSeconds,
    p_subject: subject || null,
  });
  if (error) throw error;
}

export async function updateChildAvatar(childId: string, avatarUrl: string): Promise<void> {
  const { error } = await supabase.rpc('update_child_avatar', {
    p_child_id: childId,
    p_avatar_url: avatarUrl,
  });
  if (error) throw error;
}
