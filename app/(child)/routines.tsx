import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@shopify/restyle';
import { fetchChildRoutines, fetchChildProfile, completeTask, uncompleteTask, getWeekCompletion } from '@/services/child-device';
import { LevelUpOverlay } from '@/components/ui/LevelUpOverlay';
import { PRIMARY, primaryAlpha, SUCCESS, ERROR } from '@/constants/palette';
import type { AppTheme } from '@/constants/restyleTheme';
import { DAYS_NL as DAYS } from '@/constants/locale';
import type { ChildRoutine, ChildTask, WeekDay, ChildProfile } from '@/services/child-device';

type Category = 'ochtend' | 'middag' | 'avond' | 'overig';

const CATEGORY_LABEL: Record<Category, string> = {
  ochtend: 'OCHTEND',
  middag:  'MIDDAG',
  avond:   'AVOND',
  overig:  'OVERIG',
};
const CATEGORY_ORDER: Category[] = ['ochtend', 'middag', 'avond', 'overig'];

function getCategory(scheduledTime: string | null): Category {
  if (!scheduledTime) return 'overig';
  const hour = parseInt(scheduledTime.split(':')[0], 10);
  if (hour < 12) return 'ochtend';
  if (hour < 18) return 'middag';
  return 'avond';
}

function getDayState(weekDay: WeekDay): 'done' | 'missed' | 'today' | 'future' {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(weekDay.date + 'T00:00:00');
  day.setHours(0, 0, 0, 0);
  if (day.getTime() === today.getTime()) {
    if (weekDay.total > 0 && weekDay.done >= weekDay.total) return 'done';
    return 'today';
  }
  if (day > today) return 'future';
  if (weekDay.done > 0) return 'done';
  if (weekDay.total === 0) return 'future';
  return 'missed';
}

function dateToLabel(dateStr: string): string {
  const day = new Date(dateStr + 'T00:00:00');
  return DAYS[(day.getDay() + 6) % 7];
}

// ── Week row ──────────────────────────────────────────────────────────────────

function DayCircle({
  label, state, c,
}: {
  label: string; state: 'done' | 'missed' | 'today' | 'future'; c: AppTheme['colors'];
}) {
  return (
    <View style={styles.dayCol}>
      <View style={[
        styles.dayCircle,
        { backgroundColor: c.glassInput, borderColor: primaryAlpha(0.25) },
        state === 'done'   && styles.dayDone,
        state === 'today'  && styles.dayToday,
        state === 'missed' && styles.dayMissed,
      ]}>
        {state === 'done'   && <Ionicons name="checkmark" size={14} color="#fff" />}
        {state === 'missed' && <Ionicons name="close"     size={12} color={ERROR} />}
      </View>
      <Text style={[styles.dayLabel, { color: c.textMuted }, state === 'today' && { color: PRIMARY }]}>
        {label}
      </Text>
    </View>
  );
}

// ── Routine card ──────────────────────────────────────────────────────────────

function RoutineCard({
  routine, isExpanded, onToggle, onCompleteAll, onTaskToggle, pendingTaskId, c,
}: {
  routine: ChildRoutine;
  isExpanded: boolean;
  onToggle: () => void;
  onCompleteAll: () => void;
  onTaskToggle: (task: ChildTask) => void;
  pendingTaskId: string | null;
  c: AppTheme['colors'];
}) {
  const done     = routine.tasks.filter(t => t.completed).length;
  const total    = routine.tasks.length;
  const allDone  = total > 0 && done === total;
  const progress = total > 0 ? done / total : 0;

  return (
    <View style={[
      styles.card,
      { backgroundColor: c.glassCard, borderColor: allDone ? 'rgba(72,187,120,0.45)' : c.glassCardBorder },
    ]}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <TouchableOpacity style={styles.cardHeader} onPress={onToggle} activeOpacity={0.75}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardName, { color: c.textPrimary }]}>{routine.name}</Text>
          <View style={styles.cardMeta}>
            {routine.scheduled_time ? (
              <View style={[styles.timeChip, { backgroundColor: primaryAlpha(0.08), borderColor: primaryAlpha(0.2) }]}>
                <Ionicons name="time-outline" size={10} color={PRIMARY} />
                <Text style={[styles.timeChipText, { color: PRIMARY }]}>{routine.scheduled_time}</Text>
              </View>
            ) : null}
            <Text style={[styles.cardProgressText, { color: allDone ? SUCCESS : c.textMuted }]}>
              {allDone ? 'Klaar!' : `${done} van ${total}`}
            </Text>
          </View>
        </View>

        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={c.textMuted}
          style={{ marginRight: 10 }}
        />

        {/* Complete-all button */}
        <TouchableOpacity
          style={[styles.completeBtn, allDone && styles.completeBtnDone]}
          onPress={onCompleteAll}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        >
          {allDone
            ? <Ionicons name="checkmark" size={18} color="#fff" />
            : <Ionicons name="checkmark-outline" size={16} color={PRIMARY} />}
        </TouchableOpacity>
      </TouchableOpacity>

      {/* ── Progress bar ───────────────────────────────────────────────────── */}
      <View style={[styles.progressTrack, { backgroundColor: primaryAlpha(0.07) }]}>
        <View style={[
          styles.progressFill,
          {
            width: `${Math.round(progress * 100)}%` as any,
            backgroundColor: allDone ? SUCCESS : PRIMARY,
          },
        ]} />
      </View>

      {/* ── Step list ──────────────────────────────────────────────────────── */}
      {isExpanded && total > 0 && (
        <>
          <View style={[styles.sectionDivider, { backgroundColor: c.glassCardBorder }]} />
          <View style={styles.stepList}>
            {/* Vertical connector line */}
            <View style={[styles.connector, { backgroundColor: c.glassCardBorder }]} />

            {routine.tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.stepRow}
                onPress={() => onTaskToggle(task)}
                disabled={pendingTaskId === task.id}
                activeOpacity={pendingTaskId === task.id ? 1 : 0.55}
              >
                <View style={styles.dotWrap}>
                  <View style={[
                    styles.dot,
                    task.completed
                      ? { backgroundColor: SUCCESS, borderColor: SUCCESS }
                      : { backgroundColor: 'transparent', borderColor: primaryAlpha(0.35) },
                  ]}>
                    {task.completed && <Ionicons name="checkmark" size={8} color="#fff" />}
                  </View>
                </View>
                <Text style={[
                  styles.stepTitle,
                  { color: task.completed ? c.textMuted : c.textPrimary },
                  task.completed && styles.stepDone,
                ]}>
                  {task.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function RoutinesScreen() {
  const insets = useSafeAreaInsets();
  const { colors: c } = useTheme<AppTheme>();
  const { childId } = useAppStore();
  const [routines,     setRoutines]     = useState<ChildRoutine[]>([]);
  const [weekDays,     setWeekDays]     = useState<WeekDay[]>([]);
  const [collapsedIds,  setCollapsedIds]  = useState<Set<string>>(new Set());
  const [activeFilter,  setActiveFilter]  = useState<Category | 'all'>('all');
  const [loading,       setLoading]       = useState(true);
  const [loadError,     setLoadError]     = useState<string | null>(null);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [levelUpData,   setLevelUpData]   = useState<{ newLevel: number; newStage: string; prevStage: string } | null>(null);
  const profileRef = useRef<ChildProfile | null>(null);

  function toggleRoutine(id: string) {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const load = useCallback(async () => {
    if (!childId) return;
    setLoadError(null);
    const [r, w, p] = await Promise.allSettled([
      fetchChildRoutines(childId),
      getWeekCompletion(childId),
      fetchChildProfile(childId),
    ]);
    if (r.status === 'fulfilled') {
      const loaded = r.value ?? [];
      setRoutines(loaded);
      // Reset filter if the active category no longer contains any routines
      setActiveFilter(prev =>
        prev === 'all' || loaded.some(rt => getCategory(rt.scheduled_time) === prev)
          ? prev
          : 'all'
      );
    } else {
      setLoadError((r.reason as Error)?.message ?? 'Laden mislukt');
    }
    if (w.status === 'fulfilled') setWeekDays(w.value ?? []);
    if (p.status === 'fulfilled' && p.value) profileRef.current = p.value;
    setLoading(false);
  }, [childId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  async function handleToggle(task: ChildTask) {
    if (!childId || pendingTaskId === task.id) return;
    setPendingTaskId(task.id);
    const today = todayStr();
    const delta = task.completed ? -1 : 1;
    setRoutines(prev => prev.map(r => ({
      ...r,
      tasks: r.tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t),
    })));
    setWeekDays(prev => prev.map(wd =>
      wd.date === today ? { ...wd, done: Math.max(0, wd.done + delta) } : wd
    ));
    try {
      if (task.completed) {
        await uncompleteTask(task.id, childId);
      } else {
        await completeTask(task.id, childId);
        // Detect level-up by comparing the fresh profile to the last known one.
        // profileRef.current may be null on the very first tap if load() is still
        // in-flight — in that case we still store the profile for the next check.
        const updated = await fetchChildProfile(childId);
        if (updated) {
          if (profileRef.current && updated.level > profileRef.current.level) {
            setLevelUpData({
              newLevel:  updated.level,
              newStage:  updated.stage,
              prevStage: profileRef.current.stage,
            });
          }
          profileRef.current = updated;
        }
      }
    } catch {
      setRoutines(prev => prev.map(r => ({
        ...r,
        tasks: r.tasks.map(t => t.id === task.id ? { ...t, completed: task.completed } : t),
      })));
      setWeekDays(prev => prev.map(wd =>
        wd.date === today ? { ...wd, done: Math.max(0, wd.done - delta) } : wd
      ));
    } finally {
      setPendingTaskId(null);
    }
  }

  async function handleCompleteAll(routine: ChildRoutine) {
    if (!childId) return;
    const today    = todayStr();
    const allDone  = routine.tasks.every(t => t.completed);

    // Snapshot for rollback
    const prevRoutines = routines;
    const prevWeekDays = weekDays;

    if (allDone) {
      const delta = routine.tasks.length;
      setRoutines(prev => prev.map(r =>
        r.id === routine.id
          ? { ...r, tasks: r.tasks.map(t => ({ ...t, completed: false })) }
          : r
      ));
      setWeekDays(prev => prev.map(wd =>
        wd.date === today ? { ...wd, done: Math.max(0, wd.done - delta) } : wd
      ));
      try {
        await Promise.all(routine.tasks.map(t => uncompleteTask(t.id, childId)));
      } catch {
        setRoutines(prevRoutines);
        setWeekDays(prevWeekDays);
        Alert.alert('Niet gelukt', 'De routine kon niet worden hersteld. Probeer het opnieuw.');
      }
    } else {
      const incomplete = routine.tasks.filter(t => !t.completed);
      setRoutines(prev => prev.map(r =>
        r.id === routine.id
          ? { ...r, tasks: r.tasks.map(t => ({ ...t, completed: true })) }
          : r
      ));
      setWeekDays(prev => prev.map(wd =>
        wd.date === today ? { ...wd, done: wd.done + incomplete.length } : wd
      ));
      try {
        await Promise.all(incomplete.map(t => completeTask(t.id, childId)));
        // Detect level-up after batch completion
        const updated = await fetchChildProfile(childId);
        if (updated) {
          if (profileRef.current && updated.level > profileRef.current.level) {
            setLevelUpData({
              newLevel:  updated.level,
              newStage:  updated.stage,
              prevStage: profileRef.current.stage,
            });
          }
          profileRef.current = updated;
        }
      } catch {
        setRoutines(prevRoutines);
        setWeekDays(prevWeekDays);
        Alert.alert('Niet gelukt', 'De routine kon niet worden voltooid. Probeer het opnieuw.');
      }
    }
  }

  const totalDone = routines.reduce((s, r) => s + r.tasks.filter(t => t.completed).length, 0);
  const totalAll  = routines.reduce((s, r) => s + r.tasks.length, 0);

  const today     = new Date();
  const dateLabel = today.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
  const dateCap   = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  if (loading) {
    return (
      <Box flex={1} backgroundColor="background" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={PRIMARY} />
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="background">

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <AnimatedBlob size={280} color={primaryAlpha(0.13)} duration={3500} opacityFrom={0.65} opacityTo={1}   scaleTarget={1.12} style={{ top: -50, right: -60 }} />
        <AnimatedBlob size={160} color={primaryAlpha(0.08)} duration={2700} delay={600} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07} style={{ bottom: 100, left: -50 }} />
      </View>

      <Box style={{ height: insets.top + 8 }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 60 }}
          style={styles.header}
        >
          <Text style={[styles.pageTitle, { color: c.textPrimary }]}>Routines</Text>
          <Text style={[styles.pageSubtitle, { color: c.textMuted }]}>
            {dateCap}{routines.length > 0 ? ` · ${totalDone} van ${totalAll} gedaan` : ''}
          </Text>
        </MotiView>

        {/* Week row */}
        {weekDays.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 120 }}
          >
            <View style={[styles.weekCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
              {weekDays.map(wd => (
                <DayCircle key={wd.date} label={dateToLabel(wd.date)} state={getDayState(wd)} c={c} />
              ))}
            </View>
          </MotiView>
        )}

        {/* Category filter tabs */}
        {!loadError && routines.length > 0 && (() => {
          const available = CATEGORY_ORDER.filter(cat =>
            routines.some(r => getCategory(r.scheduled_time) === cat)
          );
          if (available.length < 2) return null;
          const tabs: Array<{ key: Category | 'all'; label: string }> = [
            { key: 'all', label: 'Alles' },
            ...available.map(cat => ({
              key: cat,
              label: cat.charAt(0).toUpperCase() + cat.slice(1),
            })),
          ];
          return (
            <MotiView
              from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 300, delay: 130 }}
            >
              <View style={styles.filterRow}>
                {tabs.map(tab => {
                  const isActive = activeFilter === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      style={[
                        styles.filterTab,
                        { backgroundColor: isActive ? PRIMARY : c.glassCard, borderColor: isActive ? PRIMARY : c.glassCardBorder },
                      ]}
                      onPress={() => setActiveFilter(tab.key)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.filterTabText, { color: isActive ? '#fff' : c.textMuted }]}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </MotiView>
          );
        })()}

        {/* Routine cards grouped by time of day */}
        {!loadError && routines.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 160 }}
          >
            {CATEGORY_ORDER.map(cat => {
              if (activeFilter !== 'all' && activeFilter !== cat) return null;
              const catRoutines = routines.filter(r => getCategory(r.scheduled_time) === cat);
              if (catRoutines.length === 0) return null;
              return (
                <View key={cat}>
                  <Text style={[styles.categoryLabel, { color: PRIMARY }]}>
                    {CATEGORY_LABEL[cat]}
                  </Text>
                  {catRoutines.map(routine => (
                    <RoutineCard
                      key={routine.id}
                      routine={routine}
                      isExpanded={!collapsedIds.has(routine.id)}
                      onToggle={() => toggleRoutine(routine.id)}
                      onCompleteAll={() => handleCompleteAll(routine)}
                      onTaskToggle={handleToggle}
                      pendingTaskId={pendingTaskId}
                      c={c}
                    />
                  ))}
                </View>
              );
            })}
          </MotiView>
        )}

        {loadError && (
          <View style={[styles.emptyCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            <Text style={[styles.emptyTitle, { color: ERROR }]}>Laden mislukt</Text>
            <Text style={[styles.emptyBody,  { color: c.textMuted }]}>{loadError}</Text>
          </View>
        )}

        {!loadError && routines.length === 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 160 }}
          >
            <View style={[styles.emptyCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
              <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>Nog geen routines</Text>
              <Text style={[styles.emptyBody,  { color: c.textMuted }]}>Vraag je ouder om routines aan te maken.</Text>
            </View>
          </MotiView>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {levelUpData && (
        <LevelUpOverlay
          visible
          newLevel={levelUpData.newLevel}
          newStage={levelUpData.newStage}
          prevStage={levelUpData.prevStage}
          onDismiss={() => setLevelUpData(null)}
        />
      )}
    </Box>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 8 },

  header:       { marginBottom: 16 },
  pageTitle:    { fontSize: 28, fontWeight: '700', color: '#1a1918' },
  pageSubtitle: { fontSize: 13, color: '#8a8885', marginTop: 4 },

  // Week row
  weekCard: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1,
  },
  dayCol:    { alignItems: 'center', gap: 6 },
  dayCircle: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  dayDone:   { backgroundColor: SUCCESS, borderColor: SUCCESS },
  dayToday:  { backgroundColor: 'transparent', borderColor: PRIMARY, borderWidth: 2 },
  dayMissed: { backgroundColor: 'rgba(252,107,107,0.08)', borderColor: 'rgba(252,107,107,0.3)' },
  dayLabel:  { fontSize: 11 },

  // Category
  categoryLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10, marginTop: 4 },

  // Routine card shell
  card: {
    borderRadius: 20, borderWidth: 1,
    marginBottom: 14, overflow: 'hidden',
  },

  // Card header
  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12,
  },
  cardName:         { fontSize: 16, fontWeight: '700', color: '#1a1918' },
  cardMeta:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  cardProgressText: { fontSize: 12, color: '#8a8885', fontWeight: '500' },

  // Time chip
  timeChip:     { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1 },
  timeChipText: { fontSize: 10, fontWeight: '600', color: PRIMARY },

  // Complete-all button
  completeBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 2, borderColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  completeBtnDone: { backgroundColor: SUCCESS, borderColor: SUCCESS },

  // Progress bar
  progressTrack: { height: 3, marginHorizontal: 16, marginBottom: 0, borderRadius: 1.5, overflow: 'hidden' },
  progressFill:  { height: 3, borderRadius: 1.5 },

  // Category filter tabs
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  filterTab: {
    borderRadius: 99, borderWidth: 1.5,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  filterTabText: { fontSize: 13, fontWeight: '600' },

  // Divider between header and steps
  sectionDivider: { height: 1, marginTop: 8 },

  // Step list
  stepList: {
    paddingTop: 4, paddingBottom: 12,
    position: 'relative',
  },

  // Vertical connecting line
  connector: {
    position: 'absolute',
    left: 26,
    top: 14,    // ≈ first dot vertical center
    bottom: 14, // ≈ last dot vertical center
    width: 1.5,
  },

  stepRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 7, paddingHorizontal: 16,
  },
  dotWrap: { width: 22, alignItems: 'center', flexShrink: 0 },
  dot: {
    width: 10, height: 10, borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  stepTitle: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1a1918', marginLeft: 10 },
  stepDone:  { textDecorationLine: 'line-through' },

  // Empty / error states
  emptyCard:  { borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1a1918', marginBottom: 6 },
  emptyBody:  { fontSize: 13, color: '#8a8885', textAlign: 'center' },
});
