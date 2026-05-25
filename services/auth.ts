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

// Looks up a family by the child invite code and links the current user to that family.
// Returns the family name so it can be shown on the success screen.
export async function joinFamilyByCode(code: string, parentName: string): Promise<string> {
  const { data, error } = await supabase.rpc('get_child_by_invite_code', { code });
  if (error) throw error;
  const rows = data as { parent_id: string; name: string }[] | null;
  if (!rows || rows.length === 0) throw new Error('Onbekende code. Controleer de code bij je partner.');
  const { parent_id, name: familyName } = rows[0];
  const { error: updateError } = await supabase.auth.updateUser({
    data: { first_name: parentName, family_name: familyName, linked_parent_id: parent_id },
  });
  if (updateError) throw updateError;
  return familyName;
}
