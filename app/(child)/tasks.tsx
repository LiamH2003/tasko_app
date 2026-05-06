import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { TaskItem } from '@/components/tasks/TaskItem';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

export default function TasksScreen() {
  const { child, toggleTask } = useAppStore();

  if (!child) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Mijn routines</Text>
      {child.routines.map((routine) => (
        <View key={routine.id} style={styles.routineSection}>
          <Text style={styles.routineName}>{routine.name}</Text>
          <View style={styles.tasks}>
            {routine.tasks.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={() => toggleTask(task.id)} />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingTop: Spacing.xxl },
  header: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: Spacing.xl },
  routineSection: { marginBottom: Spacing.xl },
  routineName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  tasks: { gap: Spacing.sm },
});
