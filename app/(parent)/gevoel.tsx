import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useTheme } from '@shopify/restyle';
import { useParentChildren } from '@/store/useParentChildren';
import { getMoodHistory } from '@/services/mood';
import { PRIMARY, primaryAlpha, SUCCESS, WARNING, ERROR } from '@/constants/palette';
import { PLAN_LABEL } from '@/constants/locale';
import type { AppTheme } from '@/constants/restyleTheme';
import type { ChildRow, MoodEntryRow } from '@/lib/database.types';

// ── Constants ─────────────────────────────────────────────────────────────────

type MoodKey = MoodEntryRow['mood'];

const MOOD_META: Record<MoodKey, { emoji: string; label: string; color: string }> = {
  great: { emoji: '😁', label: 'Super',    color: SUCCESS },
  good:  { emoji: '🙂', label: 'Goed',     color: PRIMARY   },
  okay:  { emoji: '😐', label: 'Neutraal', color: WARNING },
  sad:   { emoji: '😒', label: 'Meh',      color: '#9ca3af' },
  angry: { emoji: '😔', label: 'Slecht',   color: ERROR },
};

const MOOD_ORDER: MoodKey[] = ['great', 'good', 'okay', 'sad', 'angry'];
const DAYS_NL       = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const MONTHS_NL     = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
const WEEKDAYS_FULL = ['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day  = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getDate()     === b.getDate()
      && a.getMonth()    === b.getMonth()
      && a.getFullYear() === b.getFullYear();
}

function weekLabel(monday: Date): string {
  const sunday = addDays(monday, 6);
  if (monday.getMonth() === sunday.getMonth()) {
    return `${monday.getDate()} – ${sunday.getDate()} ${MONTHS_NL[monday.getMonth()]}`;
  }
  return `${monday.getDate()} ${MONTHS_NL[monday.getMonth()]} – ${sunday.getDate()} ${MONTHS_NL[sunday.getMonth()]}`;
}

function entryDateLabel(iso: string): string {
  const d         = new Date(iso);
  const today     = new Date();
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  if (sameDay(d, today))     return 'Vandaag';
  if (sameDay(d, yesterday)) return 'Gisteren';
  const dow = (d.getDay() + 6) % 7;
  return `${WEEKDAYS_FULL[dow]} ${d.getDate()} ${MONTHS_NL[d.getMonth()]}`;
}

function timeStr(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function GevoelScreen() {
  const insets = useSafeAreaInsets();
  const { colors: c } = useTheme<AppTheme>();

  const { children, childrenLoading, refreshChildren } = useParentChildren();
  const [refreshing, setRefreshing] = useState(false);
  const [activeChildId,  setActiveChildId]  = useState<string | null>(null);
  const [entries,        setEntries]        = useState<MoodEntryRow[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [weekStart,      setWeekStart]      = useState(() => getMonday(new Date()));

  // ── Data ──────────────────────────────────────────────────────────────────

  const loadEntries = useCallback(async (childId: string) => {
    setEntriesLoading(true);
    try {
      // Fetch exactly 8 weeks back — matches the navigation cap in the UI
      const earliest = addDays(getMonday(new Date()), -8 * 7);
      const fromDate = `${earliest.getFullYear()}-${String(earliest.getMonth() + 1).padStart(2, '0')}-${String(earliest.getDate()).padStart(2, '0')}`;
      setEntries(await getMoodHistory(childId, fromDate));
    } catch {
      setEntries([]);
    } finally {
      setEntriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!children.length) return;
    setActiveChildId(prev =>
      prev && children.some(ch => ch.id === prev) ? prev : children[0].id
    );
  }, [children]);

  useFocusEffect(useCallback(() => { refreshChildren(); }, [refreshChildren]));

  useEffect(() => {
    if (activeChildId) loadEntries(activeChildId);
  }, [activeChildId, loadEntries]);

  // ── Week navigation ───────────────────────────────────────────────────────

  const currentMonday = getMonday(new Date());
  const isCurrentWeek = sameDay(weekStart, currentMonday);
  const atMinWeek     = weekStart.getTime() <= addDays(currentMonday, -8 * 7).getTime();

  function prevWeek() { if (!atMinWeek)     setWeekStart(w => addDays(w, -7)); }
  function nextWeek() { if (!isCurrentWeek) setWeekStart(w => addDays(w,  7)); }

  // ── Derived ───────────────────────────────────────────────────────────────

  const weekEnd = new Date(addDays(weekStart, 6));
  weekEnd.setHours(23, 59, 59, 999);

  const weekEntries = entries.filter(e => {
    const d = new Date(e.created_at);
    return d >= weekStart && d <= weekEnd;
  });

  const dayMoods: (MoodEntryRow | null)[] = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    return weekEntries.find(e => sameDay(new Date(e.created_at), day)) ?? null;
  });

  const distribution = MOOD_ORDER
    .map(key => ({
      key,
      count: weekEntries.filter(e => e.mood === key).length,
      pct:   weekEntries.length > 0
        ? Math.round(weekEntries.filter(e => e.mood === key).length / weekEntries.length * 100)
        : 0,
    }))
    .filter(d => d.count > 0);

  // Group entries by date for history (most recent first)
  const historyGroups: { label: string; items: MoodEntryRow[] }[] = [];
  for (const entry of entries) {
    const label = entryDateLabel(entry.created_at);
    const last  = historyGroups[historyGroups.length - 1];
    if (last && last.label === label) last.items.push(entry);
    else historyGroups.push({ label, items: [entry] });
  }
  const recentGroups = historyGroups.slice(0, 14);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.allSettled([
      refreshChildren(),
      activeChildId ? loadEntries(activeChildId) : Promise.resolve(),
    ]);
    setRefreshing(false);
  }

  const activeChild = children.find(ch => ch.id === activeChildId) ?? null;

  return (
    <Box flex={1} backgroundColor="background">

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <AnimatedBlob size={280} color={primaryAlpha(0.13)} duration={3500} opacityFrom={0.65} opacityTo={1} scaleTarget={1.12} style={{ top: -50, left: -60 }} />
        <AnimatedBlob size={160} color={primaryAlpha(0.08)} duration={2700} delay={600} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07} style={{ bottom: 120, right: -40 }} />
      </View>

      <Box style={{ height: insets.top + 8 }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />}
      >

        {/* Header */}
        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 340, delay: 40 }}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: c.textPrimary }]}>Gevoel</Text>
              <Text style={[styles.subtitle, { color: c.textMuted }]}>
                {activeChild ? `${activeChild.name} · stemming historiek` : 'Stemming van je kind'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.planBadge, { backgroundColor: primaryAlpha(0.06), borderColor: PRIMARY }]}
              activeOpacity={0.8}
            >
              <Text style={styles.planText}>{PLAN_LABEL}</Text>
            </TouchableOpacity>
          </View>
        </MotiView>

        {childrenLoading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginTop: 48 }} />
        ) : children.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            <Ionicons name="people-outline" size={30} color={c.textMuted} />
            <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>Geen kinderen gevonden</Text>
            <Text style={[styles.emptyBody, { color: c.textMuted }]}>Voeg een kind toe via Instellingen.</Text>
          </View>
        ) : (
          <>
            {/* Child tabs */}
            {children.length > 1 && (
              <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 80 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContent}>
                  {children.map(child => {
                    const isActive = child.id === activeChildId;
                    return (
                      <TouchableOpacity key={child.id} style={[styles.tab, { backgroundColor: isActive ? PRIMARY : c.glassCard, borderColor: isActive ? PRIMARY : c.glassCardBorder }]} onPress={() => setActiveChildId(child.id)} activeOpacity={0.8}>
                        <View style={[styles.tabDot, { backgroundColor: isActive ? 'rgba(255,255,255,0.55)' : primaryAlpha(0.3) }]} />
                        <Text style={[styles.tabText, { color: isActive ? '#fff' : c.textMuted }]}>{child.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </MotiView>
            )}

            {/* Week navigator */}
            <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 100 }}>
              <View style={[styles.weekNav, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
                <TouchableOpacity onPress={prevWeek} style={styles.navArrow} activeOpacity={atMinWeek ? 1 : 0.7} disabled={atMinWeek}>
                  <Ionicons name="chevron-back" size={20} color={atMinWeek ? primaryAlpha(0.25) : c.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setWeekStart(getMonday(new Date()))} activeOpacity={0.7} style={styles.weekLabelWrap}>
                  <Text style={[styles.weekLabel, { color: c.textPrimary }]}>{weekLabel(weekStart)}</Text>
                  {!isCurrentWeek && <Text style={[styles.weekBack, { color: PRIMARY }]}>Terug naar nu</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={nextWeek} style={styles.navArrow} activeOpacity={isCurrentWeek ? 1 : 0.7} disabled={isCurrentWeek}>
                  <Ionicons name="chevron-forward" size={20} color={isCurrentWeek ? primaryAlpha(0.25) : c.textMuted} />
                </TouchableOpacity>
              </View>
            </MotiView>

            {/* Day mood circles */}
            <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 120 }}>
              <View style={[styles.dayMoodCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
                {DAYS_NL.map((day, i) => {
                  const entry   = dayMoods[i];
                  const isToday = sameDay(addDays(weekStart, i), new Date());
                  const meta    = entry ? MOOD_META[entry.mood] : null;
                  return (
                    <View key={day} style={styles.dayMoodCol}>
                      <Text style={[styles.dayMoodLabel, { color: isToday ? PRIMARY : c.textMuted, fontWeight: isToday ? '700' : '400' }]}>
                        {day}
                      </Text>
                      <View style={[
                        styles.dayMoodCircle,
                        {
                          backgroundColor: meta ? `${meta.color}25` : c.glassInput,
                          borderColor:     meta ? meta.color : (isToday ? primaryAlpha(0.5) : c.glassCardBorder),
                          borderStyle:     (!meta && isToday) ? 'dashed' : 'solid',
                        },
                      ]}>
                        {meta ? <Text style={styles.dayMoodEmoji}>{meta.emoji}</Text> : null}
                      </View>
                      <Text style={[styles.dayMoodTime, { color: c.textMuted }]}>
                        {entry ? timeStr(entry.created_at) : ' '}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </MotiView>

            {/* Distribution this week */}
            {!entriesLoading && distribution.length > 0 && (
              <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 140 }}>
                <Text style={styles.sectionHeader}>VERDELING DEZE WEEK</Text>
                <View style={[styles.card, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
                  {distribution.map(d => (
                    <View key={d.key} style={styles.distRow}>
                      <Text style={styles.distEmoji}>{MOOD_META[d.key].emoji}</Text>
                      <Text style={[styles.distLabel, { color: c.textMuted }]}>{MOOD_META[d.key].label}</Text>
                      <View style={styles.distBarWrapper}>
                        <ProgressBar progress={d.pct / 100} color={MOOD_META[d.key].color} height={6} />
                      </View>
                      <Text style={[styles.distPct, { color: c.textMuted }]}>{d.pct}%</Text>
                    </View>
                  ))}
                </View>
              </MotiView>
            )}

            {/* History */}
            <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 160 }}>
              <Text style={styles.sectionHeader}>HISTORIEK</Text>
              {entriesLoading ? (
                <ActivityIndicator color={PRIMARY} style={{ marginTop: 16 }} />
              ) : recentGroups.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
                  <Ionicons name="happy-outline" size={28} color={c.textMuted} />
                  <Text style={[styles.emptyBody, { color: c.textMuted }]}>
                    {activeChild?.name ?? 'Je kind'} heeft nog geen gevoel ingecheckt.
                  </Text>
                </View>
              ) : (
                recentGroups.map(group => (
                  <View key={group.label} style={styles.historyGroup}>
                    <Text style={[styles.historyDate, { color: c.textMuted }]}>{group.label}</Text>
                    <View style={[styles.historyCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
                      {group.items.map((entry, i) => {
                        const meta = MOOD_META[entry.mood];
                        return (
                          <View key={entry.id}>
                            {i > 0 && <View style={[styles.historyDivider, { backgroundColor: c.glassCardBorder }]} />}
                            <View style={styles.historyRow}>
                              <View style={[styles.historyEmojiBg, { backgroundColor: `${meta.color}20` }]}>
                                <Text style={styles.historyEmoji}>{meta.emoji}</Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={[styles.historyMood, { color: meta.color }]}>{meta.label}</Text>
                                {entry.note ? (
                                  <Text style={[styles.historyNote, { color: c.textMuted }]} numberOfLines={2}>
                                    {entry.note}
                                  </Text>
                                ) : null}
                              </View>
                              <Text style={[styles.historyTime, { color: c.textMuted }]}>{timeStr(entry.created_at)}</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))
              )}
            </MotiView>

          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </Box>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll:    { paddingHorizontal: 24, paddingTop: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  planBadge: { borderWidth: 1.5, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5, marginTop: 4 },
  planText:  { fontSize: 11, color: PRIMARY, fontWeight: '500' },
  title:     { fontSize: 28, fontWeight: '700' },
  subtitle:  { fontSize: 13, marginTop: 4 },

  tabScroll:  { marginHorizontal: -24, marginBottom: 16 },
  tabContent: { paddingHorizontal: 24, gap: 8 },
  tab:     { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5 },
  tabDot:  { width: 6, height: 6, borderRadius: 3 },
  tabText: { fontSize: 13, fontWeight: '600' },

  weekNav:       { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  navArrow:      { padding: 12 },
  weekLabelWrap: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  weekLabel:     { fontSize: 14, fontWeight: '700' },
  weekBack:      { fontSize: 11, marginTop: 2, fontWeight: '500' },

  dayMoodCard:   { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 20, padding: 14, marginBottom: 20, borderWidth: 1 },
  dayMoodCol:    { alignItems: 'center', gap: 5 },
  dayMoodLabel:  { fontSize: 11 },
  dayMoodCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dayMoodEmoji:  { fontSize: 18 },
  dayMoodTime:   { fontSize: 9 },

  sectionHeader: { fontSize: 11, fontWeight: '600', color: PRIMARY, letterSpacing: 0.8, marginBottom: 10 },

  card:           { borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1, gap: 12 },
  distRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  distEmoji:      { fontSize: 16, width: 22 },
  distLabel:      { fontSize: 12, width: 52 },
  distBarWrapper: { flex: 1 },
  distPct:        { fontSize: 11, width: 32, textAlign: 'right' },

  historyGroup:   { marginBottom: 16 },
  historyDate:    { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' },
  historyCard:    { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  historyDivider: { height: 1 },
  historyRow:     { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  historyEmojiBg: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  historyEmoji:   { fontSize: 20 },
  historyMood:    { fontSize: 14, fontWeight: '700' },
  historyNote:    { fontSize: 12, marginTop: 2, lineHeight: 17 },
  historyTime:    { fontSize: 12, fontWeight: '500' },

  emptyCard:  { borderRadius: 20, padding: 32, borderWidth: 1, alignItems: 'center', gap: 10, marginBottom: 20 },
  emptyTitle: { fontSize: 17, fontWeight: '700' },
  emptyBody:  { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
