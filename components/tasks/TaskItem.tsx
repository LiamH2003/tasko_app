import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import type { Task } from '@/types';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onToggle} activeOpacity={0.7}>
      <View style={styles.content}>
        <Text style={styles.emoji}>{task.emoji}</Text>
        <Text style={[styles.title, task.completed && styles.completedTitle]}>{task.title}</Text>
      </View>
      <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
        {task.completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  emoji: { fontSize: 22 },
  title: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text.primary, flex: 1 },
  completedTitle: { color: Colors.text.muted, textDecorationLine: 'line-through' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark: { color: Colors.background, fontSize: 14, fontWeight: FontWeight.bold },
});
