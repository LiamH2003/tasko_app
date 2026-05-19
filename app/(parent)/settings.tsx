import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { getChildren } from '@/services/children';
import type { ChildRow } from '@/lib/database.types';

function SectionHeader({ label }: { label: string }) {
  return <Text style={styles.sectionHeader}>{label}</Text>;
}

export default function ParentSettingsScreen() {
  const { session, signOut } = useAppStore();
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [loading, setLoading] = useState(true);

  const email = session?.user.email ?? '';
  const familyName = session?.user.user_metadata?.family_name ?? '';
  const firstName = session?.user.user_metadata?.first_name ?? '';

  useEffect(() => {
    getChildren()
      .then(setChildren)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color={Colors.primary} />
          <Text style={styles.backText}>Terug</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Instellingen</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Family profile */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarEmoji}>👨‍👩‍👧‍👦</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{familyName || 'Jouw gezin'}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
          </View>
        </View>

        {/* Access codes per child */}
        <SectionHeader label="UITNODIGINGSCODES KINDEREN" />
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginBottom: Spacing.lg }} />
        ) : children.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>Nog geen kinderen. Maak een gezin aan tijdens de setup.</Text>
          </View>
        ) : (
          <View style={styles.codeCard}>
            <Text style={styles.codeInfo}>
              Kinderen voeren deze code in bij eerste aanmelding op hun toestel.
            </Text>
            {children.map((child, i) => (
              <View key={child.id}>
                {i > 0 && <View style={styles.codeDivider} />}
                <View style={styles.codeRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.codeChildName}>{child.name}</Text>
                    <Text style={styles.codeText}>{child.invite_code ?? '—'}</Text>
                  </View>
                  {child.invite_code && (
                    <TouchableOpacity
                      style={styles.copyBtn}
                      activeOpacity={0.8}
                      onPress={() => Clipboard.setString(child.invite_code!)}
                    >
                      <Text style={styles.copyBtnText}>Kopieer</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Subscription */}
        <SectionHeader label="SUBSCRIPTIE" />
        <View style={styles.section}>
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.8}>
            <View style={styles.linkIconBox}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.text.muted} />
            </View>
            <View style={styles.linkText}>
              <Text style={styles.linkLabel}>Subscriptie aanpassen</Text>
              <Text style={styles.linkSub}>Gratis plan</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.text.muted} />
          </TouchableOpacity>
        </View>

        {/* Children */}
        <SectionHeader label="KINDEREN" />
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginBottom: Spacing.lg }} />
        ) : children.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>Nog geen kinderen toegevoegd.</Text>
          </View>
        ) : (
          <View style={styles.section}>
            {children.map((child, i) => (
              <View key={child.id}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.memberRow}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarEmoji}>🧒</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{child.name}</Text>
                    <Text style={styles.memberSub}>Niveau {child.level} · {child.xp} XP</Text>
                  </View>
                  <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
                    <Text style={styles.editBtnText}>Bewerken</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Parents */}
        <SectionHeader label="OUDERS" />
        <View style={styles.section}>
          <View style={styles.memberRow}>
            <View style={styles.memberAvatar}>
              <Text style={styles.memberAvatarEmoji}>👤</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{firstName || email.split('@')[0]}</Text>
              <Text style={styles.memberSub}>Admin (Uw account)</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
              <Text style={styles.editBtnText}>Bewerken</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={signOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={Colors.status.error} />
          <Text style={styles.signOutText}>Uitloggen</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 60 },
  backText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.medium },
  navTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },

  profileCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  profileAvatar: { width: 52, height: 52, borderRadius: 12, backgroundColor: Colors.primaryDeepest, alignItems: 'center', justifyContent: 'center' },
  profileAvatarEmoji: { fontSize: 26 },
  profileName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  profileEmail: { fontSize: FontSize.sm, color: Colors.text.muted, marginTop: 2 },

  sectionHeader: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.primary, letterSpacing: 0.8, marginBottom: Spacing.sm },
  section: { backgroundColor: Colors.surface, borderRadius: Radius.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.md },

  codeCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  codeInfo: { fontSize: FontSize.xs, color: Colors.text.muted, lineHeight: 18, marginBottom: 4 },
  codeDivider: { height: 1, backgroundColor: Colors.border },
  codeRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.md },
  codeChildName: { fontSize: FontSize.xs, color: Colors.text.muted, marginBottom: 2 },
  codeText: { fontSize: 20, fontWeight: FontWeight.bold, color: Colors.text.primary, letterSpacing: 2 },
  copyBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 8 },
  copyBtnText: { fontSize: FontSize.sm, color: Colors.background, fontWeight: FontWeight.semibold },

  linkRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  linkIconBox: { width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  linkText: { flex: 1 },
  linkLabel: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text.primary },
  linkSub: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },

  memberRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryDeepest, alignItems: 'center', justifyContent: 'center' },
  memberAvatarEmoji: { fontSize: 20 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  memberSub: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },
  editBtn: { backgroundColor: Colors.card, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border },
  editBtnText: { fontSize: FontSize.xs, color: Colors.text.secondary, fontWeight: FontWeight.medium },

  emptyCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  emptyCardText: { fontSize: FontSize.sm, color: Colors.text.muted },

  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(252,107,107,0.35)', backgroundColor: 'rgba(252,107,107,0.08)' },
  signOutText: { fontSize: FontSize.md, color: Colors.status.error, fontWeight: FontWeight.medium },
});
