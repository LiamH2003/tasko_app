import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MonsterSvg } from '@/components/monster/MonsterSvg';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

const MOODS = [
  { key: 'great', emoji: '😁', label: 'Super' },
  { key: 'good', emoji: '🙂', label: 'Goed' },
  { key: 'okay', emoji: '😐', label: 'Zo-zo' },
  { key: 'sad', emoji: '😒', label: 'Meh' },
  { key: 'angry', emoji: '😔', label: 'Slecht' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'GOEDEMORGEN';
  if (h < 18) return 'GOEDEMIDDAG';
  return 'GOEDENAVOND';
}

const MOCK = {
  name: 'Emma',
  monster: { name: 'Blub', level: 4, xp: 340, xpToNextLevel: 500 },
  done: 3, todo: 2, streak: 5,
};

export default function HomeScreen() {
  const { child, logMood } = useAppStore();
  const [selectedMood, setSelectedMood] = useState<string | null>('good');

  const name = child?.name ?? MOCK.name;
  const monster = child?.monster ?? MOCK.monster;
  const xpProgress = monster.xp / monster.xpToNextLevel;

  function handleMood(key: string) {
    setSelectedMood(key);
    logMood(key as any);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>Hallo, {name}!</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelStar}>⭐</Text>
            <Text style={styles.levelText}>Niveau {monster.level} · {monster.name}</Text>
          </View>
        </View>

        {/* Monster */}
        <View style={styles.monsterSection}>
          <MonsterSvg size={130} />
          <Ionicons name="chevron-down" size={16} color={Colors.text.muted} style={{ marginTop: 4 }} />
          <Text style={styles.monsterName}>{monster.name}</Text>
        </View>

        {/* Quote card */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            "Vandaag gaan we er samen voor, toch? Ik geloof in jou! 💪"
          </Text>
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* XP bar */}
        <View style={styles.xpCard}>
          <View style={styles.xpRow}>
            <Text style={styles.xpLabel}>
              {monster.name} · <Text style={styles.xpAmount}>{monster.xp} / {monster.xpToNextLevel} EXP</Text>
            </Text>
            <TouchableOpacity onPress={() => router.push('/(child)/tasko')}>
              <Text style={styles.xpLink}>Mijn monster →</Text>
            </TouchableOpacity>
          </View>
          <ProgressBar progress={xpProgress} color={Colors.status.success} height={6} />
        </View>

        {/* Routines stats */}
        <Text style={styles.sectionTitle}>Routines</Text>
        <View style={styles.statsRow}>
          {[
            { value: MOCK.done, label: 'Gedaan' },
            { value: MOCK.todo, label: 'Te doen' },
            { value: MOCK.streak, label: 'Streak' },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statNumber}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Mood */}
        <Text style={styles.sectionTitle}>Hoe voel je je?</Text>
        <View style={styles.moodCard}>
          <Text style={styles.moodHint}>Vertel het aan {monster.name} — hij luistert</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[styles.moodItem, selectedMood === m.key && styles.moodItemActive]}
                onPress={() => handleMood(m.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={styles.moodLabel}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Next task */}
        <View style={styles.nextRow}>
          <Text style={styles.sectionTitle}>Volgende taak</Text>
          <TouchableOpacity onPress={() => router.push('/(child)/routines')}>
            <Text style={styles.xpLink}>Alles zien →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.nextCard}>
          <View style={styles.nextIconBox}>
            <Ionicons name="star-outline" size={20} color={Colors.primary} />
          </View>
          <View style={styles.nextInfo}>
            <Text style={styles.nextTitle}>Huiswerk maken</Text>
            <Text style={styles.nextMeta}>16:00 · 45 min</Text>
          </View>
          <View style={styles.xpPill}>
            <Text style={styles.xpPillText}>+30 EXP</Text>
          </View>
        </View>

        <View style={{ height: Spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  greeting: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.primary, letterSpacing: 1, textTransform: 'uppercase' },
  name: { fontSize: 26, fontWeight: FontWeight.bold, color: Colors.text.primary, marginTop: 2 },
  levelBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6, gap: 4, marginTop: 4, borderWidth: 1, borderColor: Colors.border },
  levelStar: { fontSize: 12 },
  levelText: { fontSize: FontSize.xs, color: Colors.text.primary, fontWeight: FontWeight.medium },

  // Monster
  monsterSection: { alignItems: 'center', marginVertical: Spacing.sm },
  monsterName: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text.primary, marginTop: 4 },

  // Quote
  quoteCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  quoteText: { fontSize: FontSize.md, color: Colors.text.primary, lineHeight: 22, textAlign: 'center', fontStyle: 'italic' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: Spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.text.muted },
  dotActive: { backgroundColor: Colors.text.primary },

  // XP
  xpCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  xpLabel: { fontSize: FontSize.sm, color: Colors.text.secondary },
  xpAmount: { color: Colors.primary, fontWeight: FontWeight.semibold },
  xpLink: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },

  // Stats
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: Spacing.sm },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statNumber: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },

  // Mood
  moodCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  moodHint: { fontSize: FontSize.sm, color: Colors.text.muted, marginBottom: Spacing.sm },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodItem: { alignItems: 'center', padding: 8, borderRadius: Radius.md, flex: 1 },
  moodItemActive: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.primary },
  moodEmoji: { fontSize: 24 },
  moodLabel: { fontSize: FontSize.xs, color: Colors.text.secondary, marginTop: 4 },

  // Next task
  nextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  nextCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  nextIconBox: { width: 40, height: 40, borderRadius: Radius.sm, backgroundColor: Colors.iconBg, alignItems: 'center', justifyContent: 'center' },
  nextInfo: { flex: 1 },
  nextTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  nextMeta: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },
  xpPill: { backgroundColor: 'rgba(72,187,120,0.15)', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  xpPillText: { fontSize: FontSize.xs, color: Colors.status.success, fontWeight: FontWeight.semibold },
});
