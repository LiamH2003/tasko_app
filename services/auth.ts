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

export async function completeOnboarding() {
  const { error } = await supabase.auth.updateUser({
    data: { onboarding_complete: true },
  });
  if (error) throw error;
}

export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw error;
  // Session is now invalid server-side; clear it locally too
  try { await supabase.auth.signOut(); } catch { /* already gone */ }
}

// Joins an existing family by invite code using a SECURITY DEFINER RPC — mirrors the
// atomic pattern of createFamily(). The RPC handles the DB lookup + insert in one
// transaction; auth metadata is synced client-side afterwards.
export async function joinFamilyByCode(code: string, parentName: string): Promise<string> {
  const { data, error } = await supabase.rpc('join_family_by_code', { p_code: code });
  if (error) {
    if (error.message.includes('Onbekende code'))
      throw new Error('Onbekende code. Controleer de code bij je partner.');
    if (error.message.includes('al lid'))
      throw new Error('Je bent al lid van dit gezin.');
    throw error;
  }

  const result = data as { family_id: string; family_name: string; family_code: string };

  await supabase.auth.updateUser({
    data: {
      first_name:  parentName,
      family_name: result.family_name,
      family_code: result.family_code,
      family_id:   result.family_id,
      role:        'parent',
    },
  });

  return result.family_name;
}
