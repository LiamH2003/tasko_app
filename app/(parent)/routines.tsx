import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const CHILDREN = [
  { id: 'emma', name: 'Emma', avatar: '👧' },
  { id: 'luca', name: 'Luca', avatar: '👦' },
];

const DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

type TaskStatus = 'done' | 'bezig' | 'pending';

interface ParentTask {
  id: string;
  icon: IconName;
  title: string;
  time: string;
  duration: number;
  xp: number;
  status: TaskStatus;
  statusTime?: string;
  activeDays: boolean[];
}

const SECTIONS: { label: string; tasks: ParentTask[] }[] = [
  {
    label: 'Ochtend',
    tasks: [
      { id: 't1', icon: 'sparkles-outline', title: 'Tanden poetsen', time: '07:15', duration: 5, xp: 20, status: 'done', statusTime: '07:17', activeDays: [true, true, true, true, true, true, true] },
      { id: 't2', icon: 'cafe-outline', title: 'Ontbijt eten', time: '07:30', duration: 15, xp: 20, status: 'done', statusTime: '07:44', activeDays: [true, true, true, true, true, true, true] },
    ],
  },
  {
    label: 'Middag',
    tasks: [
      { id: 't3', icon: 'star-outline', title: 'Huiswerk maken', time: '16:00', duration: 45, xp: 30, status: 'bezig', activeDays: [true, true, false, true, true, true, false] },
      { id: 't4', icon: 'heart-outline', title: 'Buiten spelen', time: '17:30', duration: 30, xp: 20, status: 'pending', activeDays: [true, true, true, true, true, false, false] },
    ],
  },
];

const STATUS_COLORS: Record<TaskStatus, string> = {
  done: Colors.status.success,
  bezig: Colors.status.warning,
  pending: Colors.text.muted,
};

function StatusBadge({ status, time }: { status: TaskStatus; time?: string }) {
  const color = STATUS_COLORS[status];
  const label = status === 'done' && time ? `✓ Klaar (${time})` : status === 'bezig' ? '⏱ Bezig' : '— Nog niet';
  return (
    <View style={[styles.statusBadge, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
      <Text style={[styles.statusBadgeText, { color }]}>{label}</Text>
    </View>
  );
}

function TaskCard({ task }: { task: ParentTask }) {
  const [expanded, setExpanded] = useState(true);
  const [enabled, setEnabled] = useState(true);

  return (
    <View style={styles.taskCard}>
      <TouchableOpacity style={styles.taskCardHeader} onPress={() => setExpanded((e) => !e)} activeOpacity={0.8}>
        <View style={styles.taskIconBox}>
          <Ionicons name={task.icon} size={18} color={Colors.primary} />
        </View>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskMeta}>{task.time} · {task.duration} min · +{task.xp} EXP</Text>
        </View>
        <Switch value={enabled} onValueChange={setEnabled} trackColor={{ false: Colors.border, true: Colors.primary }} thumbColor="#fff" ios_backgroundColor={Colors.card} style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} />
        <TouchableOpacity hitSlop={8}>
          <Ionicons name="create-outline" size={18} color={Colors.text.muted} />
        </TouchableOpacity>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.taskCardBody}>
          <View style={styles.bodyRow}>
            <Text style={styles.statusLabel}>Status vandaag</Text>
            <StatusBadge status={task.status} time={task.statusTime} />
          </View>
          <View style={styles.dayRow}>
            {DAYS.map((d, i) => (
              <View key={d} style={[styles.dayPill, task.activeDays[i] && styles.dayPillActive]}>
                <Text style={[styles.dayPillText, task.activeDays[i] && styles.dayPillTextActive]}>{d}</Text>
              </View>
            ))}
            <View style={styles.xpBadge}>
              <Text style={styles.xpBadgeText}>+{task.xp} EXP</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

export default function ParentRoutinesScreen() {
  const [activeChild, setActiveChild] = useState('emma');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color={Colors.primary} />
          <Text style={styles.backText}>Terug</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Routines</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={22} color={Colors.background} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.childSelector}>
          {CHILDREN.map((c) => (
            <TouchableOpacity key={c.id} style={[styles.childBtn, activeChild === c.id && styles.childBtnActive]} onPress={() => setActiveChild(c.id)} activeOpacity={0.8}>
              <Text style={styles.childAvatar}>{c.avatar}</Text>
              <Text style={[styles.childName, activeChild === c.id && styles.childNameActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {SECTIONS.map((section) => (
          <View key={section.label}>
            <Text style={styles.sectionLabel}>{section.label}</Text>
            <View style={styles.taskList}>
              {section.tasks.map((task) => <TaskCard key={task.id} task={task} />)}
            </View>
          </View>
        ))}

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
  addBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  childSelector: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 4, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  childBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: Radius.md },
  childBtnActive: { backgroundColor: Colors.card },
  childAvatar: { fontSize: 16 },
  childName: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text.muted },
  childNameActive: { color: Colors.text.primary },
  sectionLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: Spacing.sm },
  taskList: { gap: Spacing.sm, marginBottom: Spacing.lg },
  taskCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  taskCardHeader: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  taskIconBox: { width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: Colors.iconBg, alignItems: 'center', justifyContent: 'center' },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  taskMeta: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },
  taskCardBody: { borderTopWidth: 1, borderTopColor: Colors.border, padding: Spacing.md, gap: Spacing.sm },
  bodyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { fontSize: FontSize.xs, color: Colors.text.muted },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1 },
  statusBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  dayRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  dayPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.sm, backgroundColor: Colors.card },
  dayPillActive: { backgroundColor: Colors.primary },
  dayPillText: { fontSize: FontSize.xs, color: Colors.text.muted },
  dayPillTextActive: { color: Colors.background, fontWeight: FontWeight.semibold },
  xpBadge: { marginLeft: 'auto', backgroundColor: 'rgba(72,187,120,0.15)', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  xpBadgeText: { fontSize: FontSize.xs, color: Colors.status.success, fontWeight: FontWeight.semibold },
});
