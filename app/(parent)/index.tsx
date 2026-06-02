import { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { MonsterSvg } from '@/components/ui/MonsterSvg';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@shopify/restyle';
import { useParentChildren } from '@/store/useParentChildren';
import { getRoutinesForDate } from '@/services/routines';
import { getTodayMoodForChild } from '@/services/mood';
import { PRIMARY, primaryAlpha, SUCCESS, WARNING, ERROR } from '@/constants/palette';
import type { AppTheme } from '@/constants/restyleTheme';
import { STAGE_LABELS } from '@/utils/xp';
import { PLAN_LABEL } from '@/constants/locale';
import type { ChildRow, RoutineWithTasks, MoodEntryRow } from '@/lib/database.types';

type MoodKey = MoodEntryRow['mood'];

const MOOD_MAP: Record<MoodKey, { emoji: string; label: string; color: string }> = {
  great: { emoji: '😁', label: 'Super',    color: SUCCESS },
  good:  { emoji: '🙂', label: 'Goed',     color: PRIMARY   },
  okay:  { emoji: '😐', label: 'Neutraal', color: WARNING },
  sad:   { emoji: '😒', label: 'Meh',      color: '#9ca3af' },
  angry: { emoji: '😔', label: 'Slecht',   color: ERROR },
};

export default function ParentOverview() {
  const insets = useSafeAreaInsets();
  const { colors: c } = useTheme<AppTheme>();
  const { session } = useAppStore();

  const { children, childrenLoading, refreshChildren } = useParentChildren();
  const [refreshing, setRefreshing] = useState(false);
  const [activeChildId, setActiveChildId]   = useState<string | null>(null);
  const [routines, setRoutines]             = useState<RoutineWithTasks[]>([]);
  const [todayMood, setTodayMood]           = useState<MoodKey | null>(null);
  const [childDataLoading, setChildDataLoading] = useState(false);

  // Ref so the polling effect always reads the latest activeChildId without re-subscribing
  const activeChildIdRef = useRef<string | null>(null);
  useEffect(() => { activeChildIdRef.current = activeChildId; }, [activeChildId]);

  const firstName = session?.user.user_metadata?.first_name
    ?? session?.user.email?.split('@')[0]
    ?? 'ouder';

  // Keep active child in sync when the shared list updates
  useEffect(() => {
    if (!children.length) return;
    setActiveChildId(prev =>
      prev && children.some(ch => ch.id === prev) ? prev : children[0].id
    );
  }, [children]);

  useFocusEffect(useCallback(() => { refreshChildren(); }, [refreshChildren]));

  // Poll every 30 s while focused — child task and mood changes surface without a manual refresh
  useFocusEffect(useCallback(() => {
    const poll = setInterval(() => {
      const id = activeChildIdRef.current;
      if (!id) return;
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      getRoutinesForDate(id, today)
        .then(r => { if (activeChildIdRef.current === id) setRoutines(r); })
        .catch(() => {});
      getTodayMoodForChild(id)
        .then(m => { if (activeChildIdRef.current === id) setTodayMood(m); })
        .catch(() => {});
    }, 30_000);
    return () => clearInterval(poll);
  }, []));

  useEffect(() => {
    if (!activeChildId) return;
    setChildDataLoading(true);
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    Promise.all([
      getRoutinesForDate(activeChildId, today),
      getTodayMoodForChild(activeChildId),
    ])
      .then(([r, mood]) => { setRoutines(r); setTodayMood(mood); })
      .catch(() => {})
      .finally(() => setChildDataLoading(false));
  }, [activeChildId]);

  async function onRefresh() {
    setRefreshing(true);
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    await Promise.allSettled([
      refreshChildren(),
      ...(activeChildId ? [
        getRoutinesForDate(activeChildId, today).then(setRoutines).catch(() => {}),
        getTodayMoodForChild(activeChildId).then(setTodayMood).catch(() => {}),
      ] : []),
    ]);
    setRefreshing(false);
  }

  const activeChild = children.find(ch => ch.id === activeChildId) ?? null;
  const allTasks    = routines.flatMap(r => r.tasks);
  const doneCount   = allTasks.filter(t => t.completed).length;
  const xpProgress  = activeChild
    ? Math.min(activeChild.xp / (activeChild.xp_to_next_level || 1), 1)
    : 0;

  return (
    <Box flex={1} backgroundColor="background">

      {/* Background blobs */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <AnimatedBlob
          size={320} color={primaryAlpha(0.12)}
          duration={3500} opacityFrom={0.6} opacityTo={1} scaleTarget={1.12}
          style={{ top: -80, right: -80 }}
        />
        <AnimatedBlob
          size={200} color={primaryAlpha(0.07)}
          duration={2700} delay={600} opacityFrom={0.3} opacityTo={0.65} scaleTarget={1.07}
          style={{ bottom: 180, left: -70 }}
        />
      </View>

      <Box style={{ height: insets.top + 8 }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />}
      >

        {/* ── Header ── */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 40 }}
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
            <Text style={styles.planText}>{PLAN_LABEL}</Text>
          </TouchableOpacity>
        </MotiView>

        {/* ── Loading / empty ── */}
        {childrenLoading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginTop: 48 }} />
        ) : children.length === 0 ? (
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 120 }}
          >
            <View style={[styles.emptyHero, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
              <MonsterSvg size={90} />
              <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>Nog geen kinderen</Text>
              <Text style={[styles.emptyBody, { color: c.textMuted }]}>
                Deel de uitnodigingscode met je kind zodat hij kan inloggen op zijn toestel.
              </Text>
            </View>
          </MotiView>
        ) : (
          <>
            {/* ── Child tabs (only when 2+ children) ── */}
            {children.length > 1 && (
              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 300, delay: 80 }}
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.tabScroll}
                  contentContainerStyle={styles.tabScrollContent}
                >
                  {children.map((child) => {
                    const isActive = child.id === activeChildId;
                    return (
                      <TouchableOpacity
                        key={child.id}
                        style={[
                          styles.childTab,
                          { backgroundColor: isActive ? PRIMARY : c.glassCard, borderColor: isActive ? PRIMARY : c.glassCardBorder },
                        ]}
                        onPress={() => setActiveChildId(child.id)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.childTabDot, { backgroundColor: isActive ? 'rgba(255,255,255,0.55)' : primaryAlpha(0.3) }]} />
                        <Text style={[styles.childTabText, { color: isActive ? '#fff' : c.textMuted }]}>
                          {child.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </MotiView>
            )}

            {/* ── Monster hero card ── */}
            {activeChild && (
              <MotiView
                from={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 16, stiffness: 120, delay: 120 }}
              >
                <View style={[styles.heroCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
                  <View style={styles.heroContent}>

                    {/* Monster / avatar */}
                    <View style={[styles.heroMonsterBg, { backgroundColor: primaryAlpha(0.07) }]}>
                      {activeChild.avatar_url
                        ? <Image source={{ uri: activeChild.avatar_url }} style={styles.heroAvatar} />
                        : <MonsterSvg size={110} />
                      }
                    </View>

                    {/* Info */}
                    <View style={styles.heroInfo}>
                      <Text style={[styles.heroMonsterName, { color: c.textPrimary }]} numberOfLines={1}>
                        {activeChild.monster_name}
                      </Text>
                      <Text style={[styles.heroChildTag, { color: c.textMuted }]}>
                        {activeChild.name}'s monster
                      </Text>

                      <View style={styles.heroBadgeRow}>
                        <View style={[styles.heroBadge, { backgroundColor: primaryAlpha(0.08), borderColor: primaryAlpha(0.2) }]}>
                          <Ionicons name="trophy-outline" size={10} color={PRIMARY} />
                          <Text style={styles.heroBadgeText}>Niveau {activeChild.level}</Text>
                        </View>
                        <View style={[styles.heroBadge, { backgroundColor: primaryAlpha(0.08), borderColor: primaryAlpha(0.2) }]}>
                          <Ionicons name="sparkles-outline" size={10} color={PRIMARY} />
                          <Text style={styles.heroBadgeText}>{STAGE_LABELS[activeChild.stage]}</Text>
                        </View>
                      </View>

                      <View style={styles.xpSection}>
                        <View style={styles.xpLabelRow}>
                          <Text style={[styles.xpLabel, { color: c.textMuted }]}>EXP</Text>
                          <Text style={[styles.xpValue, { color: c.textPrimary }]}>
                            {activeChild.xp}
                            <Text style={[styles.xpMax, { color: c.textMuted }]}>/{activeChild.xp_to_next_level}</Text>
                          </Text>
                        </View>
                        <ProgressBar progress={xpProgress} color={SUCCESS} height={5} />
                      </View>
                    </View>
                  </View>
                </View>
              </MotiView>
            )}

            {/* ── Routines section ── */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 340, delay: 200 }}
            >
              <View style={styles.sectionRow}>
                <Text style={styles.sectionHeader}>ROUTINES VANDAAG</Text>
                <TouchableOpacity onPress={() => router.push({ pathname: '/(parent)/routines', params: { childId: activeChildId ?? '' } })}>
                  <Text style={styles.sectionLink}>Alle routines →</Text>
                </TouchableOpacity>
              </View>

              {childDataLoading ? (
                <ActivityIndicator color={PRIMARY} style={{ marginVertical: 20 }} />
              ) : allTasks.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
                  <Text style={[styles.emptyBody, { color: c.textMuted }]}>
                    Nog geen taken voor {activeChild?.name ?? 'dit kind'}.
                  </Text>
                  <TouchableOpacity onPress={() => router.push({ pathname: '/(parent)/routines', params: { childId: activeChildId ?? '' } })}>
                    <Text style={styles.sectionLink}>Voeg routines toe →</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.statsRow}>
                  <View style={[styles.statChip, { backgroundColor: `${SUCCESS}12`, borderColor: `${SUCCESS}40` }]}>
                    <Ionicons name="checkmark-circle" size={18} color={SUCCESS} />
                    <Text style={[styles.statNum, { color: SUCCESS }]}>{doneCount}</Text>
                    <Text style={[styles.statLbl, { color: SUCCESS }]}>Gedaan</Text>
                  </View>
                  <View style={[styles.statChip, { backgroundColor: primaryAlpha(0.06), borderColor: primaryAlpha(0.2) }]}>
                    <Ionicons name="ellipse-outline" size={18} color={PRIMARY} />
                    <Text style={[styles.statNum, { color: PRIMARY }]}>{allTasks.length - doneCount}</Text>
                    <Text style={[styles.statLbl, { color: PRIMARY }]}>Te doen</Text>
                  </View>
                </View>
              )}
            </MotiView>

            {/* ── Gevoel section ── */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 340, delay: 260 }}
            >
              <View style={styles.sectionRow}>
                <Text style={styles.sectionHeader}>GEVOEL VANDAAG</Text>
                <TouchableOpacity onPress={() => router.push('/(parent)/gevoel')}>
                  <Text style={styles.sectionLink}>Historiek →</Text>
                </TouchableOpacity>
              </View>

              {todayMood ? (
                <TouchableOpacity
                  style={[styles.moodCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}
                  onPress={() => router.push('/(parent)/gevoel')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.moodEmojiBox, { backgroundColor: `${MOOD_MAP[todayMood].color}20` }]}>
                    <Text style={styles.moodEmoji}>{MOOD_MAP[todayMood].emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.moodChild, { color: c.textMuted }]}>{activeChild?.name} voelt zich vandaag</Text>
                    <Text style={[styles.moodLabel, { color: MOOD_MAP[todayMood].color }]}>
                      {MOOD_MAP[todayMood].label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
                </TouchableOpacity>
              ) : (
                <View style={[styles.moodCardEmpty, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
                  <Ionicons name="happy-outline" size={26} color={c.textMuted} />
                  <Text style={[styles.moodEmpty, { color: c.textMuted }]}>
                    {activeChild?.name ?? 'Je kind'} heeft nog niet ingecheckt vandaag.
                  </Text>
                </View>
              )}
            </MotiView>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 8 },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  pageTitle: { fontSize: 28, fontWeight: '700', marginTop: 2 },
  planBadge: { borderWidth: 1.5, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5, marginTop: 6 },
  planText: { fontSize: 11, color: PRIMARY, fontWeight: '500' },

  // Child tabs (multi-child only)
  tabScroll: { marginHorizontal: -24, marginBottom: 16 },
  tabScrollContent: { paddingHorizontal: 24, gap: 8 },
  childTab: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5 },
  childTabDot: { width: 6, height: 6, borderRadius: 3 },
  childTabText: { fontSize: 13, fontWeight: '600' },

  // Monster hero card
  heroCard: { borderRadius: 24, borderWidth: 1, marginBottom: 24, overflow: 'hidden' },
  heroContent: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 18 },
  heroMonsterBg: {
    width: 120, height: 120, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  heroAvatar: { width: 90, height: 90, borderRadius: 14 },
  heroInfo: { flex: 1, gap: 6 },
  heroMonsterName: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  heroChildTag: { fontSize: 12, marginTop: -2 },
  heroBadgeRow: { flexDirection: 'row', gap: 6, marginTop: 2 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1,
  },
  heroBadgeText: { fontSize: 10, color: PRIMARY, fontWeight: '600' },
  xpSection: { gap: 5, marginTop: 2 },
  xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  xpLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  xpValue: { fontSize: 13, fontWeight: '700' },
  xpMax: { fontSize: 11, fontWeight: '400' },

  // Section rows
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionHeader: { fontSize: 11, fontWeight: '600', color: PRIMARY, letterSpacing: 0.8 },
  sectionLink: { fontSize: 12, color: PRIMARY, fontWeight: '500' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statChip: { flex: 1, borderRadius: 16, borderWidth: 1, paddingVertical: 14, alignItems: 'center', gap: 3 },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLbl: { fontSize: 10, fontWeight: '500' },

  // Mood
  moodCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1,
  },
  moodEmojiBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  moodEmoji: { fontSize: 26 },
  moodChild: { fontSize: 12, marginBottom: 2 },
  moodLabel: { fontSize: 18, fontWeight: '700' },
  moodCardEmpty: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1,
  },
  moodEmpty: { fontSize: 13, flex: 1, lineHeight: 19 },

  // Empty states
  emptyHero: { borderRadius: 24, padding: 36, borderWidth: 1, alignItems: 'center', gap: 12, marginBottom: 20 },
  emptyCard: { borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyBody: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
