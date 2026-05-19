import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { getChildren } from '@/services/children';
import { getRoutines } from '@/services/routines';
import type { ChildRow, TaskRow, RoutineWithTasks } from '@/lib/database.types';

type TaskStatus = 'done' | 'pending';

const STATUS_COLORS: Record<TaskStatus, string> = {
  done: Colors.status.success,
  pending: Colors.text.muted,
};

function StatusBadge({ status }: { status: TaskStatus }) {
  const color = STATUS_COLORS[status];
  const label = status === 'done' ? '✓ Klaar' : '— Nog niet';
  return (
    <View style={[styles.statusBadge, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
      <Text style={[styles.statusBadgeText, { color }]}>{label}</Text>
    </View>
  );
}

function TaskCard({ task }: { task: TaskRow }) {
  return (
    <View style={styles.taskCard}>
      <View style={styles.taskCardHeader}>
        <View style={styles.taskIconBox}>
          <Text style={styles.taskEmoji}>{task.emoji}</Text>
        </View>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{task.title}</Text>
        </View>
        <StatusBadge status={task.completed ? 'done' : 'pending'} />
        <TouchableOpacity hitSlop={8}>
          <Ionicons name="create-outline" size={18} color={Colors.text.muted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ParentRoutinesScreen() {
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [routines, setRoutines] = useState<RoutineWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [routinesLoading, setRoutinesLoading] = useState(false);

  useEffect(() => {
    getChildren()
      .then((data) => {
        setChildren(data);
        if (data.length > 0) setActiveChildId(data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeChildId) return;
    setRoutinesLoading(true);
    getRoutines(activeChildId)
      .then(setRoutines)
      .catch(() => {})
      .finally(() => setRoutinesLoading(false));
  }, [activeChildId]);

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
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : children.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Geen kinderen gevonden</Text>
            <Text style={styles.emptyBody}>Voeg eerst een kind toe via de instellingen.</Text>
          </View>
        ) : (
          <>
            <View style={styles.childSelector}>
              {children.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.childBtn, activeChildId === c.id && styles.childBtnActive]}
                  onPress={() => setActiveChildId(c.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.childAvatar}>🧒</Text>
                  <Text style={[styles.childName, activeChildId === c.id && styles.childNameActive]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {routinesLoading ? (
              <ActivityIndicator color={Colors.primary} style={{ marginTop: 24 }} />
            ) : routines.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Geen routines</Text>
                <Text style={styles.emptyBody}>Druk op + om een eerste routine aan te maken.</Text>
              </View>
            ) : (
              routines.map((routine) => (
                <View key={routine.id}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>{routine.name}</Text>
                    {routine.scheduled_time && (
                      <Text style={styles.sectionTime}>{routine.scheduled_time}</Text>
                    )}
                  </View>
                  <View style={styles.taskList}>
                    {routine.tasks.length === 0 ? (
                      <View style={styles.emptyTaskRow}>
                        <Text style={styles.emptyTaskText}>Geen taken in deze routine.</Text>
                      </View>
                    ) : (
                      [...routine.tasks]
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((task) => <TaskCard key={task.id} task={task} />)
                    )}
                  </View>
                </View>
              ))
            )}
          </>
        )}

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

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  sectionLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  sectionTime: { fontSize: FontSize.sm, color: Colors.text.muted },

  taskList: { gap: Spacing.sm, marginBottom: Spacing.lg },
  taskCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  taskCardHeader: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  taskIconBox: { width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: Colors.iconBg, alignItems: 'center', justifyContent: 'center' },
  taskEmoji: { fontSize: 18 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1 },
  statusBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },

  emptyState: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  emptyBody: { fontSize: FontSize.sm, color: Colors.text.muted, textAlign: 'center' },
  emptyTaskRow: { padding: Spacing.md },
  emptyTaskText: { fontSize: FontSize.sm, color: Colors.text.muted, textAlign: 'center' },
});
