import { supabase } from '@/lib/supabase';
import type { FamilyRow } from '@/lib/database.types';

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

  return family;
}

export async function getMyFamilyCode(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('family_members')
    .select('families(family_code)')
    .eq('user_id', user.id)
    .single();
  if (error) return null;
  return (data?.families as { family_code: string } | null)?.family_code ?? null;
}

export async function getMyFamilyId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', user.id)
    .single();
  if (error) return null;
  return data?.family_id ?? null;
}
