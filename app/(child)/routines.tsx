import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';

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
  const isFuture = state === 'future';

  return (
    <View style={styles.dayCol}>
      <View style={[
        styles.dayCircle,
        isDone && styles.dayCircleDone,
        isToday && styles.dayCircleToday,
        isFuture && styles.dayCircleFuture,
      ]}>
        {isDone ? (
          <Ionicons name="checkmark" size={14} color="#fff" />
        ) : null}
      </View>
      <Text style={[styles.dayLabel, isToday && styles.dayLabelActive]}>{label}</Text>
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
        <Ionicons name={task.icon} size={18} color={Colors.primary} />
      </View>
      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <View style={styles.taskMeta}>
          <Text style={styles.taskTime}>{task.time} · {task.duration} min</Text>
          {task.completed ? (
            <View style={styles.xpPillGreen}>
              <Text style={styles.xpPillText}>+{task.xp} EXP ✓</Text>
            </View>
          ) : (
            <View style={styles.xpPill}>
              <Text style={styles.xpPillText}>+{task.xp} EXP</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity style={[styles.checkbox, task.completed && styles.checkboxDone]} onPress={onToggle} activeOpacity={0.7}>
        {task.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
      </TouchableOpacity>
    </View>
  );
}

export default function RoutinesScreen() {
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Routines</Text>
            <Text style={styles.subtitle}>Zaterdag 29 maart · 3 van 5 gedaan</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
            <Ionicons name="add" size={22} color={Colors.background} />
          </TouchableOpacity>
        </View>

        {/* Week row */}
        <View style={styles.weekRow}>
          {DAYS.map((d, i) => <DayCircle key={d} label={d} state={DAY_STATE[i]} />)}
        </View>

        {/* Segment control */}
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
            <Text style={styles.sectionHeader}>AVOND — {tasks.Avond.filter(t => t.completed).length} TAAK</Text>
            <View style={styles.taskList}>
              {tasks.Avond.map((task) => (
                <TaskCard key={task.id} task={task} onToggle={() => toggle('Avond', task.id)} />
              ))}
            </View>
          </>
        )}

        <View style={{ height: Spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  title: { fontSize: 28, fontWeight: FontWeight.bold, color: Colors.text.primary },
  subtitle: { fontSize: FontSize.sm, color: Colors.text.muted, marginTop: 4 },
  addBtn: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },

  // Week
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.lg },
  dayCol: { alignItems: 'center', gap: 4 },
  dayCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  dayCircleDone: { backgroundColor: Colors.status.success, borderColor: Colors.status.success },
  dayCircleToday: { backgroundColor: 'transparent', borderColor: Colors.primary },
  dayCircleFuture: { backgroundColor: Colors.card, borderColor: Colors.card },
  dayLabel: { fontSize: FontSize.xs, color: Colors.text.muted },
  dayLabelActive: { color: Colors.primary },

  // Segment
  segmentRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.full, padding: 3, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  segmentBtn: { flex: 1, paddingVertical: 8, borderRadius: Radius.full, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: Colors.primary },
  segmentText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text.muted },
  segmentTextActive: { color: Colors.background },

  // Section
  sectionHeader: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.primary, letterSpacing: 0.8, marginBottom: Spacing.sm },

  // Task list
  taskList: { gap: Spacing.sm, marginBottom: Spacing.lg },
  taskCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  taskCardNow: { borderColor: '#c8a84b' },
  nowBadge: { position: 'absolute', top: -1, right: 12, backgroundColor: '#c8a84b', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  nowText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: '#fff' },
  taskIconBox: { width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: Colors.iconBg, alignItems: 'center', justifyContent: 'center' },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  taskTime: { fontSize: FontSize.xs, color: Colors.text.muted },
  xpPill: { backgroundColor: Colors.iconBg, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  xpPillGreen: { backgroundColor: 'rgba(72,187,120,0.15)', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  xpPillText: { fontSize: FontSize.xs, color: Colors.status.success, fontWeight: FontWeight.semibold },
  checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: Colors.status.success, borderColor: Colors.status.success },
});
