import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MonsterDisplay } from '@/components/monster/MonsterDisplay';
import { TaskItem } from '@/components/tasks/TaskItem';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

export default function HomeScreen() {
  const { child, toggleTask } = useAppStore();

  if (!child) return null;

  const { monster, routines } = child;
  const todayTasks = routines[0]?.tasks ?? [];
  const completedCount = todayTasks.filter((t) => t.completed).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Hoi {child.name}! 👋</Text>

      <MonsterDisplay monster={monster} />

      <View style={styles.xpSection}>
        <View style={styles.xpRow}>
          <Text style={styles.monsterName}>{monster.name}</Text>
          <Text style={styles.xpText}>{monster.xp} / {monster.xpToNextLevel} XP</Text>
        </View>
        <ProgressBar progress={monster.xp / monster.xpToNextLevel} />
      </View>

      <View style={styles.taskSection}>
        <View style={styles.taskRow}>
          <Text style={styles.taskTitle}>Vandaag</Text>
          <Text style={styles.taskCount}>{completedCount}/{todayTasks.length}</Text>
        </View>
        {todayTasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={() => toggleTask(task.id)} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingTop: Spacing.xxl },
  greeting: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text.primary, marginBottom: Spacing.xl },
  xpSection: { marginTop: Spacing.lg, marginBottom: Spacing.xl },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  monsterName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  xpText: { fontSize: FontSize.sm, color: Colors.text.secondary },
  taskSection: { gap: Spacing.sm },
  taskRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  taskTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  taskCount: { fontSize: FontSize.sm, color: Colors.text.secondary },
});
