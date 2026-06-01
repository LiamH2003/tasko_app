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

export async function createFamily(name: string): Promise<FamilyRow> {
  // Single atomic RPC — inserts family + family_member in one transaction
  const { data, error } = await supabase.rpc('create_family_for_user', { p_name: name });
  if (error) throw error;
  const family = data as unknown as FamilyRow;

  // Keep auth metadata in sync so getMyFamily() has a fast fallback
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
