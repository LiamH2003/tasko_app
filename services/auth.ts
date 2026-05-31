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

// Looks up a family by its family_code and links the current (authenticated) user as a parent member.
// Returns the family name for display on the success screen.
export async function joinFamilyByCode(code: string, parentName: string): Promise<string> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Niet ingelogd');

  const { data: families, error: familyError } = await supabase
    .from('families')
    .select('id, name')
    .eq('family_code', code)
    .limit(1);
  if (familyError) throw familyError;
  if (!families || families.length === 0)
    throw new Error('Onbekende code. Controleer de code bij je partner.');

  const { id: familyId, name: familyName } = families[0];

  const { error: memberError } = await supabase
    .from('family_members')
    .insert({ family_id: familyId, user_id: user.id, role: 'parent' });
  if (memberError) throw memberError;

  await supabase.auth.updateUser({
    data: { first_name: parentName, family_name: familyName },
  });

  return familyName;
}
