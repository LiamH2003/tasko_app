import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Modal, StyleSheet, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { MonsterSvg } from '@/components/monster/MonsterSvg';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { useAppStore } from '@/store/useAppStore';
import { useThemePreference } from '@/store/useThemePreference';
import { fetchChildProfile, fetchChildRoutines, submitMood, getTodayMood, getDailyQuote } from '@/services/child-device';
import { PRIMARY, primaryAlpha } from '@/constants/palette';
import { lightTheme, darkTheme } from '@/constants/restyleTheme';
import type { ChildProfile, ChildRoutine } from '@/services/child-device';

const MOODS = [
  { key: 'great', emoji: '😁', label: 'Super' },
  { key: 'good',  emoji: '🙂', label: 'Goed' },
  { key: 'okay',  emoji: '😐', label: 'Neutraal' },
  { key: 'sad',   emoji: '😒', label: 'Meh' },
  { key: 'angry', emoji: '😔', label: 'Slecht' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'GOEDEMORGEN';
  if (h < 18) return 'GOEDEMIDDAG';
  return 'GOEDENAVOND';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useThemePreference();
  const c = isDark ? darkTheme.colors : lightTheme.colors;
  const { childId, childName } = useAppStore();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [routines, setRoutines] = useState<ChildRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [moodOpen, setMoodOpen] = useState(false);
  const lastFetchRef = useRef(0);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [quote, setQuote] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!childId) return;
    try {
      const [p, r, mood, q] = await Promise.all([
        fetchChildProfile(childId),
        fetchChildRoutines(childId),
        getTodayMood(childId),
        getDailyQuote(),
      ]);
      setProfile(p);
      setRoutines(r);
      setSelectedMood(mood);
      setQuote(q);
    } catch {
      // handled by empty state
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useFocusEffect(useCallback(() => {
    const now = Date.now();
    if (now - lastFetchRef.current < 15_000) return;
    lastFetchRef.current = now;
    load();
  }, [load]));

  const allTasks = routines.flatMap(r => r.tasks);
  const doneCount = allTasks.filter(t => t.completed).length;
  const todoCount = allTasks.filter(t => !t.completed).length;
  const xpProgress = profile ? profile.xp / profile.xp_to_next_level : 0;
  const displayName = childName ?? profile?.name ?? 'daar';
  const monsterName = profile?.monster_name ?? 'Monster';

  async function handleMood(key: string) {
    setSelectedMood(key);
    setMoodOpen(false);
    if (!childId) return;
    try {
      await submitMood(childId, key);
    } catch { /* non-fatal */ }
  }

  if (loading) {
    return (
      <Box flex={1} backgroundColor="background" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={PRIMARY} />
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="background">

      {/* Background blobs */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <AnimatedBlob
          size={300} color={primaryAlpha(0.13)}
          duration={3500} opacityFrom={0.65} opacityTo={1} scaleTarget={1.12}
          style={{ top: -60, left: -70 }}
        />
        <AnimatedBlob
          size={180} color={primaryAlpha(0.08)}
          duration={2700} delay={600} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07}
          style={{ bottom: 160, right: -60 }}
        />
      </View>

      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>

        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 60 }}
          style={styles.header}
        >
          <View>
            <Text variant="label">{getGreeting()}</Text>
            <Text style={[styles.name, { color: c.textPrimary }]}>Hallo, {displayName}!</Text>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            <Ionicons name="trophy-outline" size={13} color={PRIMARY} />
            <Text style={[styles.levelText, { color: c.textPrimary }]}>Niveau {profile?.level ?? 1}</Text>
          </View>
        </MotiView>

        {/* Monster */}
        <MotiView
          from={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 100, delay: 100 }}
          style={styles.monsterSection}
        >
          <MonsterSvg size={160} />
          <Text style={[styles.monsterName, { color: c.textPrimary }]}>{monsterName}</Text>
          {quote ? (
            <View style={[styles.quoteCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
              <Text style={[styles.quoteText, { color: c.textMuted }]}>"{quote}"</Text>
            </View>
          ) : null}
        </MotiView>

        {/* Bottom section */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 200 }}
          style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom + 8, 16) }]}
        >
          {/* XP bar */}
          <View style={[styles.xpCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            <View style={styles.xpRow}>
              <Text style={[styles.xpLabel, { color: c.textMuted }]}>
                <Text style={styles.xpAmount}>{profile?.xp ?? 0}</Text>
                {' / '}{profile?.xp_to_next_level ?? 100} EXP
              </Text>
              <TouchableOpacity onPress={() => router.push('/(child)/tasko')}>
                <Text style={styles.link}>Mijn monster →</Text>
              </TouchableOpacity>
            </View>
            <ProgressBar progress={xpProgress} color="#48bb78" height={7} />
          </View>

          {/* Stat cards */}
          <View style={styles.statsRow}>
            {[
              { value: doneCount,       label: 'Gedaan',  color: '#48bb78' },
              { value: todoCount,       label: 'Te doen', color: PRIMARY },
              { value: allTasks.length, label: 'Totaal',  color: '#8a8885' },
            ].map((s) => (
              <TouchableOpacity
                key={s.label}
                style={[styles.statCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}
                onPress={() => router.push('/(child)/routines')}
                activeOpacity={0.8}
              >
                <Text style={[styles.statNumber, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: c.textMuted }]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Mood button */}
          <TouchableOpacity
            style={styles.moodBtn}
            onPress={() => setMoodOpen(true)}
            activeOpacity={0.85}
          >
            {selectedMood ? (
              <Text style={styles.moodBtnText}>
                {MOODS.find(m => m.key === selectedMood)?.emoji}{' '}
                {MOODS.find(m => m.key === selectedMood)?.label} (tik om te wijzigen)
              </Text>
            ) : (
              <Text style={styles.moodBtnText}>😊 Hoe voel je je vandaag?</Text>
            )}
          </TouchableOpacity>
        </MotiView>
      </View>

      {/* Mood popup */}
      <Modal
        visible={moodOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMoodOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setMoodOpen(false)}>
          <MotiView
            from={{ opacity: 0, translateY: 40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 120 }}
            style={[styles.sheet, { backgroundColor: c.sheetBg }]}
          >
            <Pressable>
              <View style={styles.sheetHandle} />
              <Text style={[styles.sheetTitle, { color: c.textPrimary }]}>Hoe voel je je?</Text>
              <Text style={[styles.sheetSub, { color: c.textMuted }]}>
                Vertel het aan {monsterName}, hij luistert altijd.
              </Text>
              <View style={styles.moodRow}>
                {MOODS.map((m) => (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.moodItem, selectedMood === m.key && styles.moodItemActive]}
                    onPress={() => handleMood(m.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.moodEmoji}>{m.emoji}</Text>
                    <Text style={[styles.moodLabel, { color: c.textMuted }]}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Pressable>
          </MotiView>
        </Pressable>
      </Modal>

    </Box>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 8,
  },
  name: { fontSize: 24, fontWeight: '700', color: '#1a1918', marginTop: 2 },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  levelText: { fontSize: 12, color: '#1a1918', fontWeight: '500' },

  monsterSection: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  monsterName: { fontSize: 18, fontWeight: '700', color: '#1a1918' },
  quoteCard: {
    backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 16,
    paddingHorizontal: 18, paddingVertical: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    marginTop: 4, width: '75%',
  },
  quoteText: { fontSize: 13, color: '#6b6560', textAlign: 'center', fontStyle: 'italic', lineHeight: 20 },

  xpCard: {
    backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 20,
    padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  xpLabel: { fontSize: 13, color: '#6b6560' },
  xpAmount: { color: PRIMARY, fontWeight: '700' },
  link: { fontSize: 12, color: PRIMARY, fontWeight: '500' },

  bottomSection: { gap: 18 },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 16,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  statNumber: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 11, color: '#8a8885', marginTop: 2 },

  moodBtn: {
    height: 52, backgroundColor: PRIMARY, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, shadowOpacity: 0.3, elevation: 6,
  },
  moodBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#f5f3ef', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.12)', alignSelf: 'center', marginBottom: 20,
  },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: '#1a1918', textAlign: 'center', marginBottom: 4 },
  sheetSub: { fontSize: 13, color: '#8a8885', textAlign: 'center', marginBottom: 24 },

  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodItem: { alignItems: 'center', flex: 1, paddingVertical: 10, borderRadius: 14 },
  moodItemActive: { backgroundColor: primaryAlpha(0.1), borderWidth: 1.5, borderColor: PRIMARY },
  moodEmoji: { fontSize: 30 },
  moodLabel: { fontSize: 11, color: '#6b6560', marginTop: 6, fontWeight: '500' },
});
