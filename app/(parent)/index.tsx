import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

export default function ParentDashboard() {
  const { child, moodHistory } = useAppStore();

  const todayTasks = child?.routines[0]?.tasks ?? [];
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const latestMood = moodHistory[moodHistory.length - 1];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Voortgang vandaag</Text>
        <Text style={styles.cardValue}>{completedCount} / {todayTasks.length} taken</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Stemming vandaag</Text>
        <Text style={styles.cardValue}>{latestMood ? latestMood.mood : 'Nog niet ingevuld'}</Text>
      </View>

      {child && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Monster niveau</Text>
          <Text style={styles.cardValue}>Level {child.monster.level} — {child.monster.name}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingTop: Spacing.xxl, gap: Spacing.md },
  header: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: Spacing.md },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardLabel: { fontSize: FontSize.sm, color: Colors.text.secondary, marginBottom: Spacing.xs },
  cardValue: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary },
});
