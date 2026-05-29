import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { useAppStore } from '@/store/useAppStore';
import { useThemePreference } from '@/store/useThemePreference';
import { getChildren } from '@/services/children';
import { getRoutines } from '@/services/routines';
import { getTodayMoodForChild } from '@/services/mood';
import { PRIMARY, primaryAlpha } from '@/constants/palette';
import { lightTheme, darkTheme } from '@/constants/restyleTheme';
import type { ChildRow, RoutineWithTasks, MoodEntryRow } from '@/lib/database.types';

type MoodKey = MoodEntryRow['mood'];

const MOOD_MAP: Record<MoodKey, { emoji: string; label: string; color: string }> = {
  great: { emoji: '😁', label: 'Super',    color: '#48bb78' },
  good:  { emoji: '🙂', label: 'Goed',     color: PRIMARY   },
  okay:  { emoji: '😐', label: 'Neutraal', color: '#f6c644' },
  sad:   { emoji: '😒', label: 'Meh',      color: '#9ca3af' },
  angry: { emoji: '😔', label: 'Slecht',   color: '#fc6b6b' },
};

export default function ParentOverview() {
  const insets = useSafeAreaInsets();
  const { isDark } = useThemePreference();
  const c = isDark ? darkTheme.colors : lightTheme.colors;
  const { session } = useAppStore();
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [routines, setRoutines] = useState<RoutineWithTasks[]>([]);
  const [todayMood, setTodayMood] = useState<MoodKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [childDataLoading, setChildDataLoading] = useState(false);

  const firstName = session?.user.user_metadata?.first_name
    ?? session?.user.email?.split('@')[0]
    ?? 'ouder';

  const loadChildren = useCallback(async () => {
    try {
      const data = await getChildren();
      setChildren(data);
      // Keep current selection if still valid, otherwise pick first child
      setActiveChildId(prev =>
        prev && data.some(c => c.id === prev) ? prev : (data[0]?.id ?? null)
      );
    } catch {
      // show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadChildren(); }, [loadChildren]));

  useEffect(() => {
    if (!activeChildId) return;
    setChildDataLoading(true);
    Promise.all([
      getRoutines(activeChildId),
      getTodayMoodForChild(activeChildId),
    ])
      .then(([r, mood]) => {
        setRoutines(r);
        setTodayMood(mood);
      })
      .catch(() => {})
      .finally(() => setChildDataLoading(false));
  }, [activeChildId]);

  const activeChild = children.find(ch => ch.id === activeChildId);
  const allTasks = routines.flatMap(r => r.tasks);
  const doneCount = allTasks.filter(t => t.completed).length;

  return (
    <Box flex={1} backgroundColor="background">

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

      <Box style={{ height: insets.top + 8 }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 60 }}
          style={styles.headerRow}
        >
          <View>
            <Text variant="label">OUDER PORTAAL</Text>
            <Text style={[styles.pageTitle, { color: c.textPrimary }]}>Dag {firstName}!</Text>
          </View>
          <TouchableOpacity
            style={[styles.planBadge, { backgroundColor: primaryAlpha(0.06), borderColor: PRIMARY }]}
            activeOpacity={0.8}
          >
            <Text style={styles.planText}>Gratis plan</Text>
          </TouchableOpacity>
        </MotiView>

        {loading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginTop: 40 }} />
        ) : children.length === 0 ? (
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 160 }}
          >
            <View style={[styles.emptyCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
              <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>Nog geen kinderen</Text>
              <Text style={[styles.emptyBody, { color: c.textMuted }]}>
                Deel de uitnodigingscode met je kind zodat hij kan inloggen op zijn toestel.
              </Text>
            </View>
          </MotiView>
        ) : (
          <>
            {/* Child selector */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 340, delay: 140 }}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.childScroll}
                contentContainerStyle={styles.childScrollContent}
              >
                {children.map((child) => {
                  const isActive = child.id === activeChildId;
                  return (
                    <TouchableOpacity
                      key={child.id}
                      style={[
                        styles.childCard,
                        { backgroundColor: c.glassCard, borderColor: isActive ? PRIMARY : c.glassCardBorder },
                      ]}
                      onPress={() => setActiveChildId(child.id)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.childAvatar, { backgroundColor: isActive ? PRIMARY : primaryAlpha(0.08) }]}>
                        <Text style={styles.childAvatarEmoji}>🧒</Text>
                      </View>
                      <Text style={[styles.childName, { color: isActive ? c.textPrimary : c.textMuted }]} numberOfLines={1}>
                        {child.name}
                      </Text>
                      {isActive && allTasks.length > 0 ? (
                        <Text style={styles.childProgress}>{doneCount}/{allTasks.length} gedaan</Text>
                      ) : (
                        <Text style={styles.childProgressEmpty}>Geen taken</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </MotiView>

            {/* Routines section */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 340, delay: 180 }}
            >
              <View style={styles.sectionRow}>
                <Text style={styles.sectionHeader}>ROUTINES VANDAAG</Text>
                <TouchableOpacity onPress={() => router.push('/(parent)/routines')}>
                  <Text style={styles.sectionLink}>Beheer →</Text>
                </TouchableOpacity>
              </View>

              {childDataLoading ? (
                <ActivityIndicator color={PRIMARY} style={{ marginVertical: 16 }} />
              ) : allTasks.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
                  <Text style={[styles.emptyBody, { color: c.textMuted }]}>
                    Nog geen taken voor {activeChild?.name ?? 'dit kind'}.
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/(parent)/routines')}>
                    <Text style={styles.sectionLink}>Voeg routines toe →</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.taskList, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
                  {allTasks.map((t, i) => {
                    const routineName = routines.find(r => r.id === t.routine_id)?.name ?? '';
                    return (
                      <View
                        key={t.id}
                        style={[styles.taskRow, i < allTasks.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.glassCardBorder }]}
                      >
                        <View style={styles.taskIconBox}>
                          <Text style={styles.taskEmoji}>{t.emoji}</Text>
                        </View>
                        <View style={styles.taskMeta}>
                          <Text style={[styles.taskTitle, { color: c.textPrimary }]}>{t.title}</Text>
                          <Text style={[styles.taskTime, { color: c.textMuted }]}>{routineName}</Text>
                        </View>
                        <View style={styles.taskStatus}>
                          <View style={[styles.statusDot, { backgroundColor: t.completed ? '#48bb78' : '#f6c644' }]} />
                          <Text style={[styles.statusText, { color: t.completed ? '#48bb78' : '#f6c644' }]}>
                            {t.completed ? 'Klaar' : 'Nog niet'}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </MotiView>

            {/* Gevoel section */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 340, delay: 220 }}
            >
              <View style={styles.sectionRow}>
                <Text style={styles.sectionHeader}>GEVOEL VANDAAG</Text>
                <TouchableOpacity onPress={() => router.push('/(parent)/gevoel')}>
                  <Text style={styles.sectionLink}>Historiek →</Text>
                </TouchableOpacity>
              </View>

              {todayMood ? (
                <View style={[styles.moodCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder, flexDirection: 'row', alignItems: 'center', gap: 14 }]}>
                  <Text style={styles.moodEmoji}>{MOOD_MAP[todayMood].emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.moodName, { color: c.textMuted }]}>{activeChild?.name} voelt zich vandaag</Text>
                    <Text style={[styles.moodLabel, { color: MOOD_MAP[todayMood].color }]}>{MOOD_MAP[todayMood].label}</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/(parent)/gevoel')}>
                    <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.moodCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
                  <Ionicons name="happy-outline" size={28} color={c.textMuted} style={{ marginBottom: 8 }} />
                  <Text style={[styles.moodEmpty, { color: c.textMuted }]}>
                    {activeChild?.name ?? 'Je kind'} heeft vandaag nog geen gevoel ingecheckt.
                  </Text>
                </View>
              )}
            </MotiView>
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 8 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  pageTitle: { fontSize: 28, fontWeight: '700', marginTop: 2 },
  planBadge: { borderWidth: 1.5, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5, marginTop: 6 },
  planText: { fontSize: 11, color: PRIMARY, fontWeight: '500' },

  childScroll: { marginHorizontal: -24, marginBottom: 20 },
  childScrollContent: { paddingHorizontal: 24, gap: 10 },
  childCard: {
    width: 100, borderRadius: 18, padding: 14,
    alignItems: 'center', gap: 6, borderWidth: 1.5,
  },
  childAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  childAvatarEmoji: { fontSize: 22 },
  childName: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  childProgress: { fontSize: 11, color: PRIMARY, fontWeight: '500' },
  childProgressEmpty: { fontSize: 11, color: 'transparent' },

  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionHeader: { fontSize: 11, fontWeight: '600', color: PRIMARY, letterSpacing: 0.8 },
  sectionLink: { fontSize: 12, color: PRIMARY, fontWeight: '500' },

  taskList: { borderRadius: 20, marginBottom: 20, borderWidth: 1, overflow: 'hidden' },
  taskRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  taskIconBox: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: primaryAlpha(0.08),
    alignItems: 'center', justifyContent: 'center',
  },
  taskEmoji: { fontSize: 17 },
  taskMeta: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: '600' },
  taskTime: { fontSize: 11, marginTop: 1 },
  taskStatus: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '500' },

  moodCard: { borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1, alignItems: 'center' },
  moodEmoji: { fontSize: 36 },
  moodName: { fontSize: 12, marginBottom: 2 },
  moodLabel: { fontSize: 18, fontWeight: '700' },
  moodEmpty: { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  emptyCard: {
    borderRadius: 20, padding: 24, marginBottom: 20,
    borderWidth: 1, alignItems: 'center', gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  emptyBody: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
