import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
  Modal, Pressable, TextInput, Alert, Switch, Linking, Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { MonsterSvg } from '@/components/monster/MonsterSvg';
import { useAppStore } from '@/store/useAppStore';
import { useThemePreference } from '@/store/useThemePreference';
import { supabase } from '@/lib/supabase';
import {
  getChildren, updateChildProfile, deleteChild, resetChildPin,
} from '@/services/children';
import {
  getMyFamily, getFamilyMembersWithNames, removeFamilyMember,
  regenerateFamilyCode, updateFamilyName,
  type MyFamily, type FamilyMemberProfile,
} from '@/services/families';
import { deleteAccount } from '@/services/auth';
import { PRIMARY, primaryAlpha } from '@/constants/palette';
import { lightTheme, darkTheme } from '@/constants/restyleTheme';
import type { ChildRow } from '@/lib/database.types';

const STAGE_COLORS: Record<string, string> = {
  egg: '#8a8885', baby: PRIMARY, child: '#4a9e5c', teen: '#e8743c', adult: '#9b6bff',
};


export default function ParentSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useThemePreference();
  const c = isDark ? darkTheme.colors : lightTheme.colors;
  const { session, signOut } = useAppStore();

  // ── Data ─────────────────────────────────────────────────────────────────
  const [children,  setChildren]  = useState<ChildRow[]>([]);
  const [family,    setFamily]    = useState<MyFamily | null>(null);
  const [members,   setMembers]   = useState<FamilyMemberProfile[]>([]);
  const [myUserId,  setMyUserId]  = useState<string | null>(session?.user.id ?? null);
  const [myRole,    setMyRole]    = useState<'admin' | 'parent' | null>(
    (session?.user.user_metadata?.role as 'admin' | 'parent' | null) ?? null
  );
  const [loading,   setLoading]   = useState(true);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [codeVisible,  setCodeVisible]  = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [resetSent,    setResetSent]    = useState(false);
  const [deletingAcct, setDeletingAcct] = useState(false);

  // ── Edit child modal ──────────────────────────────────────────────────────
  const [editChild,       setEditChild]       = useState<ChildRow | null>(null);
  const [editName,        setEditName]        = useState('');
  const [editMonsterName, setEditMonsterName] = useState('');
  const [editSaving,      setEditSaving]      = useState(false);
  const [editError,       setEditError]       = useState('');

  // ── Edit family name modal ────────────────────────────────────────────────
  const [editFamOpen,   setEditFamOpen]   = useState(false);
  const [editFamName,   setEditFamName]   = useState('');
  const [editFamSaving, setEditFamSaving] = useState(false);
  const [editFamError,  setEditFamError]  = useState('');

  const email      = session?.user.email ?? '';
  const isAdmin    = myRole === 'admin';
  const isGoogle   = session?.user.app_metadata?.provider === 'google';

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const [kids, fam, mems] = await Promise.all([
        getChildren(),
        getMyFamily(),
        getFamilyMembersWithNames(),
      ]);
      setChildren(kids);
      setFamily(fam);
      setMembers(mems);
      if (user) {
        setMyUserId(user.id);
        setMyRole(mems.find(m => m.user_id === user.id)?.role ?? null);
      }
    } catch (e) { console.error('[Settings] loadData failed:', e); } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadData();
    return () => { setResetSent(false); };
  }, [loadData]));

  // ── Edit child name ───────────────────────────────────────────────────────
  function openEdit(child: ChildRow) {
    setEditName(child.name);
    setEditMonsterName(child.monster_name);
    setEditError('');
    setEditChild(child);
  }

  async function handleEdit() {
    if (!editChild || !editName.trim() || editSaving) return;
    setEditError('');
    setEditSaving(true);
    try {
      await updateChildProfile(editChild.id, {
        name: editName.trim(),
        monster_name: editMonsterName.trim() || undefined,
      });
      setChildren(prev => prev.map(ch =>
        ch.id === editChild.id
          ? { ...ch, name: editName.trim(), monster_name: editMonsterName.trim() || ch.monster_name }
          : ch
      ));
      setEditChild(null);
    } catch {
      setEditError('Kon naam niet opslaan. Probeer het opnieuw.');
    } finally {
      setEditSaving(false);
    }
  }

  // ── Delete child ──────────────────────────────────────────────────────────
  function handleDeleteChild(child: ChildRow) {
    Alert.alert(
      `${child.name} verwijderen`,
      'Dit verwijdert het kind en alle bijbehorende data permanent.',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen', style: 'destructive',
          onPress: async () => {
            try {
              await deleteChild(child.id);
              setChildren(prev => prev.filter(ch => ch.id !== child.id));
            } catch {
              Alert.alert('Mislukt', 'Kon kind niet verwijderen.');
            }
          },
        },
      ]
    );
  }

  // ── Reset child PIN ───────────────────────────────────────────────────────
  function handleResetPin(child: ChildRow) {
    Alert.alert(
      'Pincode opnieuw instellen',
      `${child.name} moet bij het volgende inloggen een nieuwe pincode kiezen.`,
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Opnieuw instellen',
          onPress: async () => {
            try { await resetChildPin(child.id); }
            catch { Alert.alert('Mislukt', 'Kon pincode niet resetten.'); }
          },
        },
      ]
    );
  }

  // ── Edit family name ──────────────────────────────────────────────────────
  function openEditFam() { setEditFamName(family?.name ?? ''); setEditFamError(''); setEditFamOpen(true); }

  async function handleEditFam() {
    if (!editFamName.trim() || editFamSaving) return;
    setEditFamError('');
    setEditFamSaving(true);
    try {
      await updateFamilyName(editFamName.trim());
      setFamily(prev => ({
        id: prev?.id ?? '',
        name: editFamName.trim(),
        family_code: prev?.family_code ?? '',
      }));
      setEditFamOpen(false);
    } catch {
      setEditFamError('Kon naam niet opslaan. Probeer het opnieuw.');
    } finally {
      setEditFamSaving(false);
    }
  }

  // ── Regenerate code ───────────────────────────────────────────────────────
  function handleRegenCode() {
    Alert.alert(
      'Nieuwe gezinscode',
      'De huidige code stopt met werken. Iedereen moet de nieuwe code gebruiken.',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Genereren',
          onPress: async () => {
            setRegenLoading(true);
            try {
              const newCode = await regenerateFamilyCode();
              setFamily(prev => prev ? { ...prev, family_code: newCode } : prev);
              setCodeVisible(true);
            } catch {
              Alert.alert('Mislukt', 'Kon geen nieuwe code genereren.');
            } finally {
              setRegenLoading(false);
            }
          },
        },
      ]
    );
  }

  // ── Remove co-parent ──────────────────────────────────────────────────────
  function handleRemoveMember(m: FamilyMemberProfile) {
    const name = m.first_name ?? m.email?.split('@')[0] ?? 'Co-ouder';
    Alert.alert(
      `${name} verwijderen`,
      'Deze ouder verliest toegang tot het gezin.',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen', style: 'destructive',
          onPress: async () => {
            try {
              await removeFamilyMember(m.user_id);
              setMembers(prev => prev.filter(x => x.user_id !== m.user_id));
            } catch {
              Alert.alert('Mislukt', 'Kon co-ouder niet verwijderen.');
            }
          },
        },
      ]
    );
  }

  // ── Share family code ─────────────────────────────────────────────────────
  async function handleShareCode() {
    if (!family?.family_code) return;
    try {
      await Share.share({ message: `Gebruik gezinscode ${family.family_code} om in te loggen op Tasko.` });
    } catch { /* cancelled */ }
  }

  // ── Password reset ────────────────────────────────────────────────────────
  async function handlePasswordReset() {
    if (!email || resetSent) return;
    try { await supabase.auth.resetPasswordForEmail(email); setResetSent(true); }
    catch { /* silent */ }
  }

  // ── Delete account ────────────────────────────────────────────────────────
  function handleDeleteAccount() {
    const firstMsg = isAdmin
      ? 'Dit verwijdert je account en alle gezinsdata permanent.'
      : 'Dit verwijdert je account. Je verliest toegang tot het gezin, maar de gezinsdata blijft bewaard.';
    const secondMsg = isAdmin
      ? `Alle data van ${family?.name ?? 'je gezin'} wordt permanent verwijderd. Dit kan niet ongedaan worden.`
      : 'Je account wordt verwijderd. Je kunt daarna niet meer inloggen bij dit gezin.';
    const confirmLabel = isAdmin ? 'Ja, verwijder alles' : 'Ja, verwijder mijn account';

    Alert.alert('Account verwijderen', firstMsg, [
      { text: 'Annuleren', style: 'cancel' },
      {
        text: 'Doorgaan', style: 'destructive',
        onPress: () =>
          Alert.alert('Weet je het zeker?', secondMsg, [
            { text: 'Nee, ga terug', style: 'cancel' },
            {
              text: confirmLabel, style: 'destructive',
              onPress: async () => {
                setDeletingAcct(true);
                try { await deleteAccount(); }
                catch {
                  setDeletingAcct(false);
                  Alert.alert('Mislukt', 'Probeer het opnieuw.');
                }
              },
            },
          ]),
      },
    ]);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const memberName = (m: FamilyMemberProfile) =>
    m.first_name ?? m.email?.split('@')[0] ?? 'Ouder';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box flex={1} backgroundColor="background">

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <AnimatedBlob size={300} color={primaryAlpha(0.12)} duration={3500} opacityFrom={0.6} opacityTo={1} scaleTarget={1.12} style={{ top: -60, right: -70 }} />
        <AnimatedBlob size={180} color={primaryAlpha(0.07)} duration={2800} delay={700} opacityFrom={0.3} opacityTo={0.6} scaleTarget={1.07} style={{ bottom: 160, left: -60 }} />
      </View>

      <Box style={{ height: insets.top + 8 }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 340, delay: 40 }}>
          <Text style={[styles.pageTitle, { color: c.textPrimary }]}>Instellingen</Text>
          <Text style={[styles.pageSub, { color: c.textMuted }]}>Beheer je gezin en account</Text>
        </MotiView>

        {/* ── GEZIN ── */}
        <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 340, delay: 80 }}>
          <Text style={styles.sectionHeader}>GEZIN</Text>

          {/* Family identity card */}
          <TouchableOpacity
            style={[styles.identityCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}
            onPress={isAdmin ? openEditFam : undefined}
            activeOpacity={isAdmin ? 0.82 : 1}
          >
            <View style={[styles.familyIconBox, { backgroundColor: primaryAlpha(0.08), borderColor: primaryAlpha(0.15) }]}>
              <Ionicons name="people-outline" size={22} color={PRIMARY} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.familyNameText, { color: c.textPrimary }]} numberOfLines={1}>
                {loading ? '...' : (family?.name || 'Jouw gezin')}
              </Text>
              <Text style={[styles.familyEmailText, { color: c.textMuted }]} numberOfLines={1}>{email}</Text>
            </View>
            <View style={[styles.rolePill, { backgroundColor: primaryAlpha(0.08), borderColor: primaryAlpha(0.2) }]}>
              <Ionicons name="shield-checkmark-outline" size={10} color={PRIMARY} />
              <Text style={styles.rolePillText}>{isAdmin ? 'Admin' : 'Ouder'}</Text>
            </View>
            {isAdmin && (
              <Ionicons name="chevron-forward" size={15} color={c.textMuted} style={{ marginLeft: 6 }} />
            )}
          </TouchableOpacity>

          {/* Family code card */}
          <View style={[styles.codeCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            <Text style={[styles.sectionHeader, { marginBottom: 8 }]}>GEZINSCODE</Text>
            <Text style={[styles.codeHint, { color: c.textMuted }]}>
              Kinderen voeren deze code in bij eerste aanmelding op hun toestel.
            </Text>

            {/* Code display box */}
            <View style={[styles.codeBox, { backgroundColor: isDark ? 'rgba(0,0,0,0.28)' : 'rgba(0,0,0,0.05)', borderColor: primaryAlpha(0.18) }]}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => !codeVisible && setCodeVisible(true)}
                activeOpacity={codeVisible ? 1 : 0.65}
              >
                <Text
                  style={[styles.codeValueText, { color: codeVisible ? c.textPrimary : c.textMuted }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {loading ? '···' : codeVisible ? (family?.family_code ?? '—') : (family?.family_code ? 'TASKO-••••' : '—')}
                </Text>
              </TouchableOpacity>

              {/* Eye toggle — always visible */}
              <TouchableOpacity
                style={[styles.codeIconBtn, { backgroundColor: c.glassInput, borderColor: c.glassCardBorder }]}
                onPress={() => setCodeVisible(v => !v)}
                activeOpacity={0.8}
              >
                <Ionicons name={codeVisible ? 'eye-off-outline' : 'eye-outline'} size={17} color={c.textMuted} />
              </TouchableOpacity>

              {/* Copy — only when revealed */}
              {codeVisible && family?.family_code && (
                <TouchableOpacity
                  style={styles.copyPill}
                  onPress={() => Clipboard.setStringAsync(family.family_code)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="copy-outline" size={13} color="#fff" />
                  <Text style={styles.copyPillText}>Kopieer</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Bottom action row */}
            <View style={styles.codeBottomRow}>
              <TouchableOpacity
                style={[styles.codePillBtn, { backgroundColor: c.glassInput, borderColor: c.glassCardBorder, opacity: family?.family_code ? 1 : 0.4 }]}
                onPress={handleShareCode}
                disabled={!family?.family_code}
                activeOpacity={0.8}
              >
                <Ionicons name="share-outline" size={14} color={PRIMARY} />
                <Text style={[styles.codePillText, { color: PRIMARY }]}>Deel via bericht</Text>
              </TouchableOpacity>
              {isAdmin && (
                <TouchableOpacity
                  style={[styles.codePillBtn, { backgroundColor: c.glassInput, borderColor: c.glassCardBorder }]}
                  onPress={handleRegenCode}
                  disabled={regenLoading}
                  activeOpacity={0.8}
                >
                  {regenLoading
                    ? <ActivityIndicator size="small" color={PRIMARY} />
                    : <Ionicons name="refresh-outline" size={14} color={PRIMARY} />}
                  <Text style={[styles.codePillText, { color: PRIMARY }]}>Nieuwe code</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </MotiView>

        {/* ── KINDEREN ── */}
        <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 340, delay: 140 }}>
          <Text style={styles.sectionHeader}>KINDEREN</Text>

          {loading ? (
            <ActivityIndicator color={PRIMARY} style={{ marginBottom: 20 }} />
          ) : children.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
              <Text style={[styles.emptyText, { color: c.textMuted }]}>
                Nog geen kinderen. Ze verschijnen hier zodra ze inloggen met de gezinscode.
              </Text>
            </View>
          ) : (
            <View style={[styles.listCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
              {children.map((child, i) => {
                const color = STAGE_COLORS[child.stage] ?? PRIMARY;
                return (
                  <View key={child.id}>
                    {i > 0 && <View style={[styles.sep, { backgroundColor: c.glassCardBorder }]} />}
                    <View style={styles.childRow}>
                      <View style={[styles.childAvatar, { backgroundColor: color + '22' }]}>
                        <MonsterSvg size={42} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.childNameText, { color: c.textPrimary }]}>{child.name}</Text>
                        <Text style={[styles.childMetaText, { color: c.textMuted }]}>
                          Niveau {child.level} · {child.xp} XP
                        </Text>
                      </View>
                      <View style={styles.childBtns}>
                        <TouchableOpacity
                          style={[styles.smallBtn, { backgroundColor: c.glassInput, borderColor: c.glassCardBorder }]}
                          onPress={() => openEdit(child)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="create-outline" size={15} color={c.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.smallBtn, { backgroundColor: c.glassInput, borderColor: c.glassCardBorder }]}
                          onPress={() => handleResetPin(child)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="lock-open-outline" size={15} color={c.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.smallBtn, { backgroundColor: '#fc6b6b14', borderColor: '#fc6b6b30' }]}
                          onPress={() => handleDeleteChild(child)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="trash-outline" size={15} color="#fc6b6b" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </MotiView>

        {/* ── CO-OUDERS ── */}
        <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 340, delay: 180 }}>
          <Text style={styles.sectionHeader}>CO-OUDERS</Text>

          {loading ? (
            <ActivityIndicator color={PRIMARY} style={{ marginBottom: 20 }} />
          ) : members.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
              <Text style={[styles.emptyText, { color: c.textMuted }]}>
                Nog geen co-ouders. Deel de gezinscode om iemand toe te voegen.
              </Text>
            </View>
          ) : (
            <View style={[styles.listCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
              {members.map((m, i) => {
                const isSelf = m.user_id === myUserId;
                return (
                  <View key={m.user_id}>
                    {i > 0 && <View style={[styles.sep, { backgroundColor: c.glassCardBorder }]} />}
                    <View style={styles.memberRow}>
                      <View style={[styles.memberAvatar, { backgroundColor: primaryAlpha(0.08) }]}>
                        <Ionicons name="person-outline" size={17} color={PRIMARY} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.memberNameText, { color: c.textPrimary }]} numberOfLines={1}>
                            {memberName(m)}
                          </Text>
                          {isSelf && (
                            <View style={[styles.pill, { backgroundColor: primaryAlpha(0.08) }]}>
                              <Text style={[styles.pillText, { color: PRIMARY }]}>Jij</Text>
                            </View>
                          )}
                          <View style={[styles.pill, { backgroundColor: m.role === 'admin' ? primaryAlpha(0.08) : c.glassInput }]}>
                            <Text style={[styles.pillText, { color: m.role === 'admin' ? PRIMARY : c.textMuted }]}>
                              {m.role === 'admin' ? 'Admin' : 'Ouder'}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.memberEmailText, { color: c.textMuted }]} numberOfLines={1}>
                          {m.email}
                        </Text>
                      </View>
                      {isAdmin && !isSelf && (
                        <TouchableOpacity
                          style={[styles.smallBtn, { backgroundColor: '#fc6b6b14', borderColor: '#fc6b6b30' }]}
                          onPress={() => handleRemoveMember(m)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="person-remove-outline" size={15} color="#fc6b6b" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </MotiView>

        {/* ── PLAN ── */}
        <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 340, delay: 220 }}>
          <Text style={styles.sectionHeader}>PLAN</Text>
          <View style={[styles.planCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <View style={[styles.planIconBox, { backgroundColor: primaryAlpha(0.08) }]}>
                <Ionicons name="star-outline" size={18} color={PRIMARY} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[{ fontSize: 15, fontWeight: '600' }, { color: c.textPrimary }]}>Tasko Premium</Text>
                <Text style={[{ fontSize: 11, marginTop: 2 }, { color: c.textMuted }]}>Momenteel: Gratis plan</Text>
              </View>
            </View>
            {[
              'Meerdere ouders per gezin',
              'Geavanceerde inzichten & rapporten',
              'Onbeperkt kinderen toevoegen',
              'Data exporteren (CSV)',
            ].map(f => (
              <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Ionicons name="checkmark-circle" size={14} color={PRIMARY} />
                <Text style={[{ fontSize: 13, flex: 1 }, { color: c.textMuted }]}>{f}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.upgradeBtn, { backgroundColor: PRIMARY }]}
              activeOpacity={0.85}
            >
              <Text style={styles.upgradeBtnText}>Bekijk plannen</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* ── ACCOUNT ── */}
        <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 340, delay: 260 }}>
          <Text style={styles.sectionHeader}>ACCOUNT</Text>
          <View style={[styles.listCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>

            {/* Theme toggle */}
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: primaryAlpha(0.08) }]}>
                <Ionicons name={isDark ? 'moon-outline' : 'sunny-outline'} size={17} color={PRIMARY} />
              </View>
              <Text style={[styles.settingLabel, { color: c.textPrimary }]}>Donker thema</Text>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: primaryAlpha(0.2), true: PRIMARY }}
                thumbColor="#fff"
                ios_backgroundColor="rgba(128,128,128,0.2)"
              />
            </View>

            <View style={[styles.sep, { backgroundColor: c.glassCardBorder }]} />

            {/* Password reset / Google info */}
            {isGoogle ? (
              <View style={styles.settingRow}>
                <View style={[styles.settingIcon, { backgroundColor: primaryAlpha(0.08) }]}>
                  <Ionicons name="logo-google" size={17} color={PRIMARY} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: c.textPrimary }]}>Aangemeld via Google</Text>
                  <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>Wachtwoord beheren via Google</Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.settingRow} onPress={handlePasswordReset} disabled={resetSent} activeOpacity={0.8}>
                <View style={[styles.settingIcon, { backgroundColor: primaryAlpha(0.08) }]}>
                  <Ionicons name="lock-closed-outline" size={17} color={resetSent ? '#48bb78' : PRIMARY} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: c.textPrimary }]}>Wachtwoord wijzigen</Text>
                  {resetSent && (
                    <Text style={{ fontSize: 11, color: '#48bb78', marginTop: 2 }}>
                      Link verstuurd naar {email}
                    </Text>
                  )}
                </View>
                <Ionicons
                  name={resetSent ? 'checkmark' : 'chevron-forward'}
                  size={16}
                  color={resetSent ? '#48bb78' : c.textMuted}
                />
              </TouchableOpacity>
            )}

            <View style={[styles.sep, { backgroundColor: c.glassCardBorder }]} />

            {/* Privacy */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => Linking.openURL('https://tasko.app/privacybeleid')}
              activeOpacity={0.8}
            >
              <View style={[styles.settingIcon, { backgroundColor: primaryAlpha(0.08) }]}>
                <Ionicons name="document-text-outline" size={17} color={PRIMARY} />
              </View>
              <Text style={[styles.settingLabel, { color: c.textPrimary }]}>Privacybeleid</Text>
              <Ionicons name="open-outline" size={15} color={c.textMuted} />
            </TouchableOpacity>

          </View>
        </MotiView>

        {/* ── Sign out ── */}
        <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 340, delay: 300 }}>
          <TouchableOpacity
            style={[styles.signOutBtn, { backgroundColor: 'rgba(252,107,107,0.07)', borderColor: 'rgba(252,107,107,0.3)' }]}
            onPress={signOut}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color="#fc6b6b" />
            <Text style={styles.signOutText}>Uitloggen</Text>
          </TouchableOpacity>
        </MotiView>

        {/* ── Delete account ── */}
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 340, delay: 340 }}>
          <TouchableOpacity
            style={styles.deleteAcctBtn}
            onPress={handleDeleteAccount}
            disabled={deletingAcct}
            activeOpacity={0.7}
          >
            {deletingAcct
              ? <ActivityIndicator size="small" color="rgba(252,107,107,0.5)" />
              : <Text style={styles.deleteAcctText}>Account verwijderen</Text>}
          </TouchableOpacity>
        </MotiView>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Edit child name modal ──────────────────────────────────────────── */}
      <Modal visible={!!editChild} transparent animationType="fade" onRequestClose={() => { setEditChild(null); setEditError(''); }}>
        <Pressable style={sh.backdrop} onPress={() => { setEditChild(null); setEditError(''); }}>
          <MotiView
            from={{ opacity: 0, translateY: 40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 130 }}
            style={[sh.panel, { backgroundColor: c.sheetBg }]}
          >
            <Pressable>
              <View style={sh.handle} />
              <Text style={[sh.title, { color: c.textPrimary }]}>Kind bewerken</Text>
              <Text style={[sh.sub, { color: c.textMuted }]}>{editChild?.name}</Text>
              <Text style={[sh.fieldLabel, { color: c.textMuted }]}>NAAM KIND</Text>
              <View style={[sh.inputWrap, { backgroundColor: c.glassInput, borderColor: editError ? '#fc6b6b' : primaryAlpha(0.2) }]}>
                <TextInput
                  style={[sh.input, { color: c.textPrimary }]}
                  value={editName}
                  onChangeText={t => { setEditName(t); setEditError(''); }}
                  placeholder="Naam kind"
                  placeholderTextColor={c.placeholder}
                  autoFocus autoCorrect={false} maxLength={30}
                />
              </View>
              <Text style={[sh.fieldLabel, { color: c.textMuted }]}>NAAM MONSTER</Text>
              <View style={[sh.inputWrap, { backgroundColor: c.glassInput, borderColor: primaryAlpha(0.2) }]}>
                <TextInput
                  style={[sh.input, { color: c.textPrimary }]}
                  value={editMonsterName}
                  onChangeText={setEditMonsterName}
                  placeholder="Naam van het monster"
                  placeholderTextColor={c.placeholder}
                  autoCorrect={false} maxLength={30}
                />
              </View>
              {!!editError && <Text style={sh.errorText}>{editError}</Text>}
              <View style={sh.row}>
                <TouchableOpacity style={[sh.cancelBtn, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]} onPress={() => { setEditChild(null); setEditError(''); }} activeOpacity={0.8}>
                  <Text style={[sh.cancelText, { color: c.textMuted }]}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[sh.saveBtn, !editName.trim() && sh.saveBtnDim]} onPress={handleEdit} disabled={!editName.trim() || editSaving} activeOpacity={0.85}>
                  {editSaving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={sh.saveText}>Opslaan</Text>}
                </TouchableOpacity>
              </View>
            </Pressable>
          </MotiView>
        </Pressable>
      </Modal>

      {/* ── Edit family name modal ─────────────────────────────────────────── */}
      <Modal visible={editFamOpen} transparent animationType="fade" onRequestClose={() => { setEditFamOpen(false); setEditFamError(''); }}>
        <Pressable style={sh.backdrop} onPress={() => { setEditFamOpen(false); setEditFamError(''); }}>
          <MotiView
            from={{ opacity: 0, translateY: 40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 130 }}
            style={[sh.panel, { backgroundColor: c.sheetBg }]}
          >
            <Pressable>
              <View style={sh.handle} />
              <Text style={[sh.title, { color: c.textPrimary }]}>Gezinsnaam bewerken</Text>
              <Text style={[sh.fieldLabel, { color: c.textMuted }]}>NAAM VAN HET GEZIN</Text>
              <View style={[sh.inputWrap, { backgroundColor: c.glassInput, borderColor: editFamError ? '#fc6b6b' : primaryAlpha(0.2) }]}>
                <TextInput
                  style={[sh.input, { color: c.textPrimary }]}
                  value={editFamName}
                  onChangeText={t => { setEditFamName(t); setEditFamError(''); }}
                  placeholder="bijv. Familie Janssen"
                  placeholderTextColor={c.placeholder}
                  autoFocus autoCapitalize="words" autoCorrect={false} maxLength={40}
                />
              </View>
              {!!editFamError && <Text style={sh.errorText}>{editFamError}</Text>}
              <View style={sh.row}>
                <TouchableOpacity style={[sh.cancelBtn, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]} onPress={() => { setEditFamOpen(false); setEditFamError(''); }} activeOpacity={0.8}>
                  <Text style={[sh.cancelText, { color: c.textMuted }]}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[sh.saveBtn, !editFamName.trim() && sh.saveBtnDim]} onPress={handleEditFam} disabled={!editFamName.trim() || editFamSaving} activeOpacity={0.85}>
                  {editFamSaving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={sh.saveText}>Opslaan</Text>}
                </TouchableOpacity>
              </View>
            </Pressable>
          </MotiView>
        </Pressable>
      </Modal>

    </Box>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll:      { paddingHorizontal: 24, paddingTop: 8 },
  pageTitle:   { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  pageSub:     { fontSize: 13, marginBottom: 24 },
  sectionHeader: { fontSize: 11, fontWeight: '600', color: PRIMARY, letterSpacing: 0.8, marginBottom: 10 },

  // Family identity card
  identityCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 20, padding: 16, marginBottom: 10, borderWidth: 1,
  },
  familyIconBox: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  familyNameText:  { fontSize: 16, fontWeight: '700' },
  familyEmailText: { fontSize: 12, marginTop: 2 },
  rolePill:        { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  rolePillText:    { fontSize: 10, color: PRIMARY, fontWeight: '600' },

  // Code card
  codeCard:      { borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1 },
  codeHint:      { fontSize: 12, lineHeight: 18, marginBottom: 14 },
  codeBox:       { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, marginBottom: 12 },
  codeValueText: { fontSize: 18, fontWeight: '700', letterSpacing: 1, flex: 1 },
  codeIconBtn:   { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  copyPill:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: PRIMARY, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, flexShrink: 0 },
  copyPillText:  { fontSize: 12, color: '#fff', fontWeight: '600' },
  codeBottomRow: { flexDirection: 'row', gap: 10 },
  codePillBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 12, paddingVertical: 11, borderWidth: 1 },
  codePillText:  { fontSize: 12, fontWeight: '500' },

  // List cards
  listCard: { borderRadius: 20, marginBottom: 20, borderWidth: 1, overflow: 'hidden' },
  sep: { height: 1, marginHorizontal: 16 },

  // Children
  childRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  childAvatar:   { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  childNameText: { fontSize: 14, fontWeight: '600' },
  childMetaText: { fontSize: 11, marginTop: 2 },
  childBtns:     { flexDirection: 'row', gap: 6 },
  smallBtn:      { width: 32, height: 32, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  // Members
  memberRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  memberAvatar:    { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  memberNameText:  { fontSize: 14, fontWeight: '600' },
  memberEmailText: { fontSize: 11, marginTop: 2 },
  pill:     { borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 },
  pillText: { fontSize: 10, fontWeight: '600' },

  // Empty
  emptyCard: { borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1 },
  emptyText: { fontSize: 13, lineHeight: 19 },

  // Plan
  planCard:     { borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1 },
  planIconBox:  { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  upgradeBtn:   { borderRadius: 14, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  upgradeBtnText: { fontSize: 14, color: '#fff', fontWeight: '700' },

  // Account settings rows
  settingRow:   { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  settingIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  settingLabel: { flex: 1, fontSize: 14, fontWeight: '500' },

  // Bottom actions
  signOutBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  signOutText: { fontSize: 14, color: '#fc6b6b', fontWeight: '500' },
  deleteAcctBtn: { alignItems: 'center', paddingVertical: 10 },
  deleteAcctText: { fontSize: 12, color: 'rgba(252,107,107,0.5)' },
});

const sh = StyleSheet.create({
  backdrop:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  panel:      { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  handle:     { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(128,128,128,0.3)', alignSelf: 'center', marginBottom: 24 },
  title:      { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  sub:        { fontSize: 13, marginBottom: 20 },
  fieldLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.8, marginBottom: 10 },
  inputWrap:  { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1.5, marginBottom: 22 },
  input:      { flex: 1, fontSize: 15, padding: 0 },
  row:        { flexDirection: 'row', gap: 10 },
  cancelBtn:  { flex: 1, height: 50, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 14, fontWeight: '500' },
  saveBtn:    { flex: 2, height: 50, backgroundColor: PRIMARY, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  saveBtnDim: { backgroundColor: primaryAlpha(0.35) },
  saveText:   { fontSize: 14, color: '#fff', fontWeight: '700' },
  errorText:  { fontSize: 12, color: '#fc6b6b', marginTop: -14, marginBottom: 14 },
});
