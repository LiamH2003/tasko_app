import { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { PRIMARY, primaryAlpha } from '@/constants/palette';

const DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const DAY_STATE: Array<'done' | 'missed' | 'today' | 'future'> = [
  'done', 'done', 'missed', 'done', 'done', 'today', 'future',
];

const SEGMENTS = ['Ochtend', 'Middag', 'Avond'] as const;
type Segment = typeof SEGMENTS[number];

interface RoutineTask {
  id: string;
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  time: string;
  duration: number;
  xp: number;
  completed: boolean;
  isNow?: boolean;
}

const ROUTINE_DATA: Record<Segment, RoutineTask[]> = {
  Ochtend: [
    { id: 'o1', title: 'Ontbijt eten', icon: 'cafe-outline', time: '7:30', duration: 15, xp: 20, completed: true },
    { id: 'o2', title: 'Tanden poetsen', icon: 'sparkles-outline', time: '7:50', duration: 5, xp: 10, completed: true },
    { id: 'o3', title: 'Rugzak inpakken', icon: 'bag-outline', time: '8:00', duration: 10, xp: 20, completed: false },
  ],
  Middag: [
    { id: 'm1', title: 'Lunch eten', icon: 'cafe-outline', time: '12:30', duration: 20, xp: 20, completed: true },
    { id: 'm2', title: 'Schermvrije tijd', icon: 'desktop-outline', time: '13:00', duration: 30, xp: 20, completed: true },
    { id: 'm3', title: 'Huiswerk maken', icon: 'star-outline', time: '16:00', duration: 45, xp: 30, completed: false, isNow: true },
    { id: 'm4', title: 'Buiten spelen', icon: 'heart-outline', time: '17:30', duration: 30, xp: 20, completed: false },
  ],
  Avond: [
    { id: 'a1', title: 'Tanden poetsen', icon: 'refresh-outline', time: '20:00', duration: 5, xp: 10, completed: false },
  ],
};

function DayCircle({ label, state }: { label: string; state: typeof DAY_STATE[number] }) {
  const isDone = state === 'done';
  const isToday = state === 'today';
  const isMissed = state === 'missed';

  return (
    <View style={styles.dayCol}>
      <View style={[
        styles.dayCircle,
        isDone && styles.dayCircleDone,
        isToday && styles.dayCircleToday,
        isMissed && styles.dayCircleMissed,
      ]}>
        {isDone && <Ionicons name="checkmark" size={14} color="#fff" />}
        {isMissed && <Ionicons name="close" size={12} color="#fc6b6b" />}
      </View>
      <Text style={[styles.dayLabel, isToday && { color: PRIMARY }]}>{label}</Text>
    </View>
  );
}

function TaskCard({ task, onToggle }: { task: RoutineTask; onToggle: () => void }) {
  return (
    <View style={[styles.taskCard, task.isNow && styles.taskCardNow]}>
      {task.isNow && (
        <View style={styles.nowBadge}>
          <Text style={styles.nowText}>NU</Text>
        </View>
      )}
      <View style={styles.taskIconBox}>
        <Ionicons name={task.icon} size={18} color={PRIMARY} />
      </View>
      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <View style={styles.taskMeta}>
          <Text style={styles.taskTime}>{task.time} · {task.duration} min</Text>
          <View style={task.completed ? styles.xpPillGreen : styles.xpPill}>
            <Text style={styles.xpPillText}>{task.completed ? `+${task.xp} EXP ✓` : `+${task.xp} EXP`}</Text>
          </View>
        </View>
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
  const [activeSegment, setActiveSegment] = useState<Segment>('Middag');
  const [tasks, setTasks] = useState(ROUTINE_DATA);

  function toggle(segment: Segment, id: string) {
    setTasks((prev) => ({
      ...prev,
      [segment]: prev[segment].map((t) => t.id === id ? { ...t, completed: !t.completed } : t),
    }));
  }

  const current = tasks[activeSegment];
  const doneCount = current.filter((t) => t.completed).length;

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
          <View>
            <Text style={styles.title}>Routines</Text>
            <Text style={styles.subtitle}>Zaterdag 29 maart · {doneCount} van {current.length} gedaan</Text>
          </View>
        </MotiView>

        {/* Week row */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 120 }}
        >
          <View style={styles.weekCard}>
            {DAYS.map((d, i) => <DayCircle key={d} label={d} state={DAY_STATE[i]} />)}
          </View>
        </MotiView>

        {/* Segment control */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 160 }}
        >
          <View style={styles.segmentRow}>
            {SEGMENTS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.segmentBtn, activeSegment === s && styles.segmentBtnActive]}
                onPress={() => setActiveSegment(s)}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentText, activeSegment === s && styles.segmentTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </MotiView>

        {/* Section header */}
        <Text style={styles.sectionHeader}>
          {activeSegment.toUpperCase()} — {doneCount} VAN {current.length} GEDAAN
        </Text>

        {/* Tasks */}
        <View style={styles.taskList}>
          {current.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={() => toggle(activeSegment, task.id)} />
          ))}
        </View>

        {/* Avond peek when on Middag */}
        {activeSegment === 'Middag' && (
          <>
            <Text style={styles.sectionHeader}>
              AVOND — {tasks.Avond.filter(t => t.completed).length} TAAK
            </Text>
            <View style={styles.taskList}>
              {tasks.Avond.map((task) => (
                <TaskCard key={task.id} task={task} onToggle={() => toggle('Avond', task.id)} />
              ))}
            </View>
          </>
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
  dayCircleDone: { backgroundColor: '#48bb78', borderColor: '#48bb78' },
  dayCircleToday: { backgroundColor: 'transparent', borderColor: PRIMARY, borderWidth: 2 },
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
    position: 'relative',
  },
  taskCardNow: { borderColor: '#c8a84b' },
  nowBadge: {
    position: 'absolute', top: -1, right: 12,
    backgroundColor: '#c8a84b', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  nowText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  taskIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: primaryAlpha(0.1),
    alignItems: 'center', justifyContent: 'center',
  },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: '600', color: '#1a1918' },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  taskTime: { fontSize: 11, color: '#8a8885' },
  xpPill: { backgroundColor: primaryAlpha(0.1), borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  xpPillGreen: { backgroundColor: 'rgba(72,187,120,0.15)', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  xpPillText: { fontSize: 11, color: '#48bb78', fontWeight: '600' },
  checkbox: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: '#48bb78', borderColor: '#48bb78' },
});
