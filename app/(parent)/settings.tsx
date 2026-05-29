import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Clipboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { useAppStore } from '@/store/useAppStore';
import { useThemePreference } from '@/store/useThemePreference';
import { getChildren } from '@/services/children';
import { PRIMARY, primaryAlpha } from '@/constants/palette';
import { lightTheme, darkTheme } from '@/constants/restyleTheme';
import type { ChildRow } from '@/lib/database.types';

export default function ParentSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useThemePreference();
  const c = isDark ? darkTheme.colors : lightTheme.colors;
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
    <Box flex={1} backgroundColor="background">

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <AnimatedBlob
          size={260} color={primaryAlpha(0.13)}
          duration={3500} opacityFrom={0.65} opacityTo={1} scaleTarget={1.12}
          style={{ top: -50, right: -50 }}
        />
        <AnimatedBlob
          size={160} color={primaryAlpha(0.08)}
          duration={2700} delay={600} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07}
          style={{ bottom: 120, left: -50 }}
        />
      </View>

      <Box style={{ height: insets.top + 8 }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 60 }}
          style={styles.header}
        >
          <Text style={[styles.title, { color: c.textPrimary }]}>Instellingen</Text>
          <Text style={[styles.subtitle, { color: c.textMuted }]}>Beheer je gezin en account</Text>
        </MotiView>

        {/* Family profile card */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 100 }}
        >
          <View style={[styles.profileCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            <View style={[styles.profileAvatar, { backgroundColor: primaryAlpha(0.1), borderColor: primaryAlpha(0.2) }]}>
              <Text style={styles.profileAvatarEmoji}>👨‍👩‍👧‍👦</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: c.textPrimary }]}>{familyName || 'Jouw gezin'}</Text>
              <Text style={[styles.profileEmail, { color: c.textMuted }]}>{email}</Text>
            </View>
          </View>
        </MotiView>

        {/* Invite codes */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 140 }}
        >
          <Text style={styles.sectionHeader}>CODE VOOR KIND & PARTNER</Text>
          {loading ? (
            <ActivityIndicator color={PRIMARY} style={{ marginBottom: 20 }} />
          ) : children.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
              <Text style={[styles.emptyCardText, { color: c.textMuted }]}>Nog geen kinderen. Maak een gezin aan tijdens de setup.</Text>
            </View>
          ) : (
            <View style={[styles.codeCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
              <Text style={[styles.codeInfo, { color: c.textMuted }]}>
                Kinderen voeren deze code in bij eerste aanmelding op hun toestel.
              </Text>
              {children.map((child, i) => (
                <View key={child.id}>
                  {i > 0 && <View style={[styles.codeDivider, { backgroundColor: c.glassCardBorder }]} />}
                  <View style={[styles.codeRow, { backgroundColor: c.glassInput }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.codeChildName, { color: c.textMuted }]}>{child.name}</Text>
                      <Text style={[styles.codeText, { color: c.textPrimary }]}>{child.invite_code ?? '—'}</Text>
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
        </MotiView>

        {/* Subscription */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 180 }}
        >
          <Text style={styles.sectionHeader}>SUBSCRIPTIE</Text>
          <View style={[styles.section, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            <TouchableOpacity style={styles.linkRow} activeOpacity={0.8}>
              <View style={[styles.linkIconBox, { backgroundColor: primaryAlpha(0.08) }]}>
                <Ionicons name="lock-closed-outline" size={18} color={c.textMuted} />
              </View>
              <View style={styles.linkText}>
                <Text style={[styles.linkLabel, { color: c.textPrimary }]}>Subscriptie aanpassen</Text>
                <Text style={[styles.linkSub, { color: c.textMuted }]}>Gratis plan</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* Children */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 220 }}
        >
          <Text style={styles.sectionHeader}>KINDEREN</Text>
          {loading ? (
            <ActivityIndicator color={PRIMARY} style={{ marginBottom: 20 }} />
          ) : children.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
              <Text style={[styles.emptyCardText, { color: c.textMuted }]}>Nog geen kinderen toegevoegd.</Text>
            </View>
          ) : (
            <View style={[styles.section, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
              {children.map((child, i) => (
                <View key={child.id}>
                  {i > 0 && <View style={[styles.divider, { backgroundColor: c.glassCardBorder }]} />}
                  <View style={styles.memberRow}>
                    <View style={[styles.memberAvatar, { backgroundColor: primaryAlpha(0.1), borderColor: primaryAlpha(0.2) }]}>
                      <Text style={styles.memberAvatarEmoji}>🧒</Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={[styles.memberName, { color: c.textPrimary }]}>{child.name}</Text>
                      <Text style={[styles.memberSub, { color: c.textMuted }]}>Niveau {child.level} · {child.xp} XP</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.editBtn, { backgroundColor: c.glassInput, borderColor: c.glassCardBorder }]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.editBtnText, { color: c.textMuted }]}>Bewerken</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </MotiView>

        {/* Parents */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 260 }}
        >
          <Text style={styles.sectionHeader}>OUDERS</Text>
          <View style={[styles.section, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            <View style={styles.memberRow}>
              <View style={[styles.memberAvatar, { backgroundColor: primaryAlpha(0.1), borderColor: primaryAlpha(0.2) }]}>
                <Text style={styles.memberAvatarEmoji}>👤</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: c.textPrimary }]}>{firstName || email.split('@')[0]}</Text>
                <Text style={[styles.memberSub, { color: c.textMuted }]}>Admin (Uw account)</Text>
              </View>
              <TouchableOpacity
                style={[styles.editBtn, { backgroundColor: c.glassInput, borderColor: c.glassCardBorder }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.editBtnText, { color: c.textMuted }]}>Bewerken</Text>
              </TouchableOpacity>
            </View>
          </View>
        </MotiView>

        {/* Sign out */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 300 }}
        >
          <TouchableOpacity style={styles.signOutBtn} onPress={signOut} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color="#fc6b6b" />
            <Text style={styles.signOutText}>Uitloggen</Text>
          </TouchableOpacity>
        </MotiView>

        <View style={{ height: 24 }} />
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 8 },

  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4 },

  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    borderRadius: 20, padding: 18, marginBottom: 24, borderWidth: 1,
  },
  profileAvatar: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  profileAvatarEmoji: { fontSize: 24 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700' },
  profileEmail: { fontSize: 12, marginTop: 2 },

  sectionHeader: { fontSize: 11, fontWeight: '600', color: PRIMARY, letterSpacing: 0.8, marginBottom: 10 },

  section: { borderRadius: 20, marginBottom: 20, borderWidth: 1, overflow: 'hidden' },
  divider: { height: 1, marginHorizontal: 16 },

  codeCard: { borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1, gap: 12 },
  codeInfo: { fontSize: 11, lineHeight: 18, marginBottom: 4 },
  codeDivider: { height: 1 },
  codeRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, gap: 12 },
  codeChildName: { fontSize: 11, marginBottom: 2 },
  codeText: { fontSize: 20, fontWeight: '700', letterSpacing: 2 },
  copyBtn: { backgroundColor: PRIMARY, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  copyBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },

  linkRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  linkIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  linkText: { flex: 1 },
  linkLabel: { fontSize: 14, fontWeight: '500' },
  linkSub: { fontSize: 11, marginTop: 2 },

  memberRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  memberAvatarEmoji: { fontSize: 20 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: '600' },
  memberSub: { fontSize: 11, marginTop: 2 },
  editBtn: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  editBtnText: { fontSize: 11, fontWeight: '500' },

  emptyCard: { borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1 },
  emptyCardText: { fontSize: 13 },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(252,107,107,0.35)',
    backgroundColor: 'rgba(252,107,107,0.08)',
  },
  signOutText: { fontSize: 14, color: '#fc6b6b', fontWeight: '500' },
});
