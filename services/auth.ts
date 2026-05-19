import { supabase } from '@/lib/supabase';

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function saveParentProfile(firstName: string, familyName: string) {
  const { error } = await supabase.auth.updateUser({
    data: { first_name: firstName, family_name: familyName },
  });
  if (error) throw error;
}

// Called at the end of parent onboarding (success screen) to unlock the parent dashboard.
export async function completeOnboarding() {
  const { error } = await supabase.auth.updateUser({
    data: { onboarding_complete: true },
  });
  if (error) throw error;
}
