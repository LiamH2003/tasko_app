import { supabase } from '@/lib/supabase';
import type { FamilyRow } from '@/lib/database.types';

export type { FamilyRow };

export type MyFamily = {
  id: string;
  name: string;
  family_code: string;
};

export type FamilyMemberProfile = {
  user_id: string;
  role: 'admin' | 'parent';
  joined_at: string;
  first_name: string | null;
  email: string | null;
};

function generateFamilyCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `TASKO-${suffix}`;
}

export async function createFamily(name: string): Promise<FamilyRow> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Niet ingelogd');

  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({ name, created_by: user.id, family_code: generateFamilyCode() })
    .select()
    .single();
  if (familyError) throw familyError;

  const { error: memberError } = await supabase
    .from('family_members')
    .insert({ family_id: family.id, user_id: user.id, role: 'admin' });
  if (memberError) throw memberError;

  // Cache in user metadata so getMyFamily() always has a fallback
  await supabase.auth.updateUser({
    data: { family_name: name, family_code: family.family_code, family_id: family.id, role: 'admin' },
  });

  return family;
}

export async function getMyFamily(): Promise<MyFamily | null> {
  const { data, error } = await supabase.rpc('get_my_family');
  if (error || !data || data.length === 0) return null;
  return data[0] as MyFamily;
}

export async function getMyFamilyCode(): Promise<string | null> {
  const fam = await getMyFamily();
  return fam?.family_code ?? null;
}

export async function getMyFamilyId(): Promise<string | null> {
  const fam = await getMyFamily();
  return fam?.id ?? null;
}

export async function updateFamilyName(name: string): Promise<void> {
  const { error } = await supabase.rpc('update_family_name', { p_name: name });
  if (error) throw error;
  await supabase.auth.updateUser({ data: { family_name: name } });
}

export async function regenerateFamilyCode(): Promise<string> {
  const { data, error } = await supabase.rpc('regenerate_family_code');
  if (error) throw error;
  const newCode = data as string;
  // Keep metadata in sync so the fallback path stays accurate
  await supabase.auth.updateUser({ data: { family_code: newCode } });
  return newCode;
}

export async function getFamilyMembersWithNames(): Promise<FamilyMemberProfile[]> {
  const { data, error } = await supabase.rpc('get_family_members_with_names');
  if (error) throw error;
  return (data as FamilyMemberProfile[]) ?? [];
}

export async function removeFamilyMember(userId: string): Promise<void> {
  const { error } = await supabase.rpc('remove_family_member', { p_user_id: userId });
  if (error) throw error;
}
