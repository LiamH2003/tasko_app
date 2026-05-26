import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { useAppStore } from '@/store/useAppStore';
import { fetchChildRoutines, completeTask, uncompleteTask, getWeekCompletion } from '@/services/child-device';
import { PRIMARY, primaryAlpha } from '@/constants/palette';
import type { ChildRoutine, ChildTask, WeekDay } from '@/services/child-device';

const DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

function getDayState(weekDay: WeekDay): 'done' | 'missed' | 'today' | 'future' {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(weekDay.date);
  day.setHours(0, 0, 0, 0);
  if (day.getTime() === today.getTime()) return 'today';
  if (day > today) return 'future';
  if (weekDay.done > 0) return 'done';
  return 'missed';
}

function DayCircle({ label, state }: { label: string; state: 'done' | 'missed' | 'today' | 'future' }) {
  return (
    <View style={styles.dayCol}>
      <View style={[
        styles.dayCircle,
        state === 'done'   && styles.dayCircleDone,
        state === 'today'  && styles.dayCircleToday,
        state === 'missed' && styles.dayCircleMissed,
      ]}>
        {state === 'done'   && <Ionicons name="checkmark" size={14} color="#fff" />}
        {state === 'missed' && <Ionicons name="close" size={12} color="#fc6b6b" />}
      </View>
      <Text style={[styles.dayLabel, state === 'today' && { color: PRIMARY }]}>{label}</Text>
    </View>
  );
}

function TaskCard({ task, onToggle }: { task: ChildTask; onToggle: () => void }) {
  return (
    <View style={styles.taskCard}>
      <View style={styles.taskIconBox}>
        <Text style={styles.taskEmoji}>{task.emoji}</Text>
      </View>
      <View style={styles.taskInfo}>
        <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]}>
          {task.title}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.checkbox, task.completed && styles.checkboxDone]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        {task.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
      </TouchableOpacity>
    </View>
  );
}

export default function RoutinesScreen() {
  const insets = useSafeAreaInsets();
  const { childId } = useAppStore();
  const [routines, setRoutines] = useState<ChildRoutine[]>([]);
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!childId) return;
    try {
      const [r, w] = await Promise.all([
        fetchChildRoutines(childId),
        getWeekCompletion(childId),
      ]);
      setRoutines(r);
      setWeekDays(w);
      if (r.length > 0 && !activeRoutineId) setActiveRoutineId(r[0].id);
    } catch {
      // handled by empty state
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => { load(); }, [load]);

  async function handleToggle(task: ChildTask) {
    if (!childId) return;
    // Optimistic update
    setRoutines(prev => prev.map(r => ({
      ...r,
      tasks: r.tasks.map(t =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      ),
    })));
    try {
      if (task.completed) {
        await uncompleteTask(task.id, childId);
      } else {
        await completeTask(task.id, childId);
      }
    } catch {
      // Revert on failure
      setRoutines(prev => prev.map(r => ({
        ...r,
        tasks: r.tasks.map(t =>
          t.id === task.id ? { ...t, completed: task.completed } : t
        ),
      })));
    }
  }

  const activeRoutine = routines.find(r => r.id === activeRoutineId) ?? null;
  const allTasks = routines.flatMap(r => r.tasks);
  const doneCount = activeRoutine?.tasks.filter(t => t.completed).length ?? 0;
  const totalCount = activeRoutine?.tasks.length ?? 0;

  const today = new Date();
  const dateLabel = today.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
  const dateCapital = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

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
        <AnimatedBlob
          size={280} color={primaryAlpha(0.13)}
          duration={3500} opacityFrom={0.65} opacityTo={1} scaleTarget={1.12}
          style={{ top: -50, right: -60 }}
        />
        <AnimatedBlob
          size={160} color={primaryAlpha(0.08)}
          duration={2700} delay={600} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07}
          style={{ bottom: 100, left: -50 }}
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
          <Text style={styles.title}>Routines</Text>
          <Text style={styles.subtitle}>
            {dateCapital}{activeRoutine ? ` · ${doneCount} van ${totalCount} gedaan` : ''}
          </Text>
        </MotiView>

        {/* Week row */}
        {weekDays.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 120 }}
          >
            <View style={styles.weekCard}>
              {weekDays.map((wd, i) => (
                <DayCircle key={wd.date} label={DAYS[i]} state={getDayState(wd)} />
              ))}
            </View>
          </MotiView>
        )}

        {/* Segment control */}
        {routines.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 160 }}
          >
            <View style={styles.segmentRow}>
              {routines.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.segmentBtn, activeRoutineId === r.id && styles.segmentBtnActive]}
                  onPress={() => setActiveRoutineId(r.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentText, activeRoutineId === r.id && styles.segmentTextActive]}>
                    {r.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </MotiView>
        )}

        {/* Tasks */}
        {activeRoutine && (
          <>
            <Text style={styles.sectionHeader}>
              {activeRoutine.name.toUpperCase()}: {doneCount} VAN {totalCount} GEDAAN
            </Text>
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 340, delay: 200 }}
            >
              <View style={styles.taskList}>
                {activeRoutine.tasks.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>Geen taken in deze routine.</Text>
                  </View>
                ) : (
                  activeRoutine.tasks.map(task => (
                    <TaskCard key={task.id} task={task} onToggle={() => handleToggle(task)} />
                  ))
                )}
              </View>
            </MotiView>
          </>
        )}

        {/* Empty state */}
        {routines.length === 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 160 }}
          >
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nog geen routines</Text>
              <Text style={styles.emptyText}>Vraag je ouder om routines aan te maken.</Text>
            </View>
          </MotiView>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 8 },

  header: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1918' },
  subtitle: { fontSize: 13, color: '#8a8885', marginTop: 4 },

  weekCard: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 20,
    padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  dayCol: { alignItems: 'center', gap: 6 },
  dayCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1.5, borderColor: primaryAlpha(0.25),
    alignItems: 'center', justifyContent: 'center',
  },
  dayCircleDone:   { backgroundColor: '#48bb78', borderColor: '#48bb78' },
  dayCircleToday:  { backgroundColor: 'transparent', borderColor: PRIMARY, borderWidth: 2 },
  dayCircleMissed: { backgroundColor: 'rgba(252,107,107,0.08)', borderColor: 'rgba(252,107,107,0.3)' },
  dayLabel: { fontSize: 11, color: '#8a8885' },

  segmentRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 99, padding: 3,
    marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  segmentBtn: { flex: 1, paddingVertical: 8, borderRadius: 99, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: PRIMARY },
  segmentText: { fontSize: 13, fontWeight: '500', color: '#8a8885' },
  segmentTextActive: { color: '#fff', fontWeight: '600' },

  sectionHeader: {
    fontSize: 11, fontWeight: '600', color: PRIMARY,
    letterSpacing: 0.8, marginBottom: 10,
  },

  taskList: { gap: 10, marginBottom: 20 },
  taskCard: {
    backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  taskIconBox: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: primaryAlpha(0.08),
    alignItems: 'center', justifyContent: 'center',
  },
  taskEmoji: { fontSize: 20 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: '#1a1918' },
  taskTitleDone: { color: '#b0ada8', textDecorationLine: 'line-through' },
  checkbox: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: '#48bb78', borderColor: '#48bb78' },

  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 20, padding: 24,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1a1918', marginBottom: 6 },
  emptyText: { fontSize: 13, color: '#8a8885', textAlign: 'center' },
});
