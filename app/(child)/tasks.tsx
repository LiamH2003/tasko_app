import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { fetchChildRoutines, completeTask } from '@/services/child-device';
import type { ChildRoutine, ChildTask } from '@/services/child-device';
import { TouchableOpacity } from 'react-native';

export default function TasksScreen() {
  const { childId } = useAppStore();
  const [routines, setRoutines] = useState<ChildRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!childId) return;
    if (!silent) setLoading(true);
    try {
      const data = await fetchChildRoutines(childId);
      setRoutines(data);
    } catch {
      // handled by empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [childId]);

  useEffect(() => { load(); }, [load]);

  async function handleToggle(task: ChildTask) {
    if (task.completed || !childId) return;

    // Optimistic update
    setRoutines(prev =>
      prev.map(r => ({
        ...r,
        tasks: r.tasks.map(t => t.id === task.id ? { ...t, completed: true } : t),
      }))
    );

    try {
      await completeTask(task.id, childId);
    } catch {
      // Roll back on failure
      setRoutines(prev =>
        prev.map(r => ({
          ...r,
          tasks: r.tasks.map(t => t.id === task.id ? { ...t, completed: false } : t),
        }))
      );
    }
  }

  const allTasks = routines.flatMap(r => r.tasks);
  const doneCount = allTasks.filter(t => t.completed).length;
  const total = allTasks.length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(true); }}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>Mijn routines</Text>
          {total > 0 && (
            <View style={styles.progressPill}>
              <Text style={styles.progressText}>{doneCount}/{total}</Text>
            </View>
          )}
        </View>

        {routines.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nog geen routines. Vraag je ouder om routines aan te maken.</Text>
          </View>
        ) : (
          routines.map(routine => (
            <View key={routine.id} style={styles.routineSection}>
              <View style={styles.routineHeader}>
                <Text style={styles.routineName}>{routine.name}</Text>
                {routine.scheduled_time && (
                  <Text style={styles.routineTime}>{routine.scheduled_time}</Text>
                )}
              </View>
              <View style={styles.tasks}>
                {routine.tasks.length === 0 ? (
                  <Text style={styles.noTasksText}>Geen taken in deze routine.</Text>
                ) : (
                  routine.tasks.map(task => (
                    <TaskRow key={task.id} task={task} onToggle={() => handleToggle(task)} />
                  ))
                )}
              </View>
            </View>
          ))
        )}

        <View style={{ height: Spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TaskRow({ task, onToggle }: { task: ChildTask; onToggle: () => void }) {
  return (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={onToggle}
      activeOpacity={task.completed ? 1 : 0.7}
    >
      <View style={styles.taskContent}>
        <Text style={styles.taskEmoji}>{task.emoji}</Text>
        <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]}>
          {task.title}
        </Text>
      </View>
      <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
        {task.completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  header: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  progressPill: { backgroundColor: Colors.surface, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  progressText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },

  emptyCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  emptyText: { fontSize: FontSize.sm, color: Colors.text.secondary, textAlign: 'center' },

  routineSection: { marginBottom: Spacing.xl },
  routineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  routineName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 1 },
  routineTime: { fontSize: FontSize.xs, color: Colors.text.muted },
  noTasksText: { fontSize: FontSize.sm, color: Colors.text.muted, paddingLeft: Spacing.sm },

  tasks: { gap: Spacing.sm },
  taskCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  taskContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  taskEmoji: { fontSize: 22 },
  taskTitle: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text.primary, flex: 1 },
  taskTitleDone: { color: Colors.text.muted, textDecorationLine: 'line-through' },
  checkbox: { width: 24, height: 24, borderRadius: Radius.sm, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark: { color: Colors.background, fontSize: 14, fontWeight: FontWeight.bold },
});
