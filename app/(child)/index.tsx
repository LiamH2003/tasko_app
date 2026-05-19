import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MonsterSvg } from '@/components/monster/MonsterSvg';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { fetchChildProfile, fetchChildRoutines, submitMood } from '@/services/child-device';
import type { ChildProfile, ChildRoutine } from '@/services/child-device';

const MOODS = [
  { key: 'great', emoji: '😁', label: 'Super' },
  { key: 'good',  emoji: '🙂', label: 'Goed' },
  { key: 'okay',  emoji: '😐', label: 'Zo-zo' },
  { key: 'sad',   emoji: '😒', label: 'Meh' },
  { key: 'angry', emoji: '😔', label: 'Slecht' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'GOEDEMORGEN';
  if (h < 18) return 'GOEDEMIDDAG';
  return 'GOEDENAVOND';
}

export default function HomeScreen() {
  const { childId } = useAppStore();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [routines, setRoutines] = useState<ChildRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodSaved, setMoodSaved] = useState(false);

  const load = useCallback(async () => {
    if (!childId) return;
    try {
      const [p, r] = await Promise.all([
        fetchChildProfile(childId),
        fetchChildRoutines(childId),
      ]);
      setProfile(p);
      setRoutines(r);
    } catch {
      // handled by empty state
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => { load(); }, [load]);

  const allTasks = routines.flatMap(r => r.tasks);
  const doneCount = allTasks.filter(t => t.completed).length;
  const todoCount = allTasks.filter(t => !t.completed).length;
  const nextTask = allTasks.find(t => !t.completed) ?? null;
  const xpProgress = profile ? profile.xp / profile.xp_to_next_level : 0;

  async function handleMood(key: string) {
    setSelectedMood(key);
    if (!childId) return;
    try {
      await submitMood(childId, key);
      setMoodSaved(true);
    } catch {
      // non-fatal
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>Hallo, {profile?.name ?? 'daar'}!</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelStar}>⭐</Text>
            <Text style={styles.levelText}>
              Niveau {profile?.level ?? 1} · {profile?.monster_name ?? 'Monster'}
            </Text>
          </View>
        </View>

        {/* Monster */}
        <View style={styles.monsterSection}>
          <MonsterSvg size={130} />
          <Ionicons name="chevron-down" size={16} color={Colors.text.muted} style={{ marginTop: 4 }} />
          <Text style={styles.monsterName}>{profile?.monster_name ?? 'Monster'}</Text>
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
              {profile?.monster_name ?? 'Monster'} ·{' '}
              <Text style={styles.xpAmount}>
                {profile?.xp ?? 0} / {profile?.xp_to_next_level ?? 100} EXP
              </Text>
            </Text>
            <TouchableOpacity onPress={() => router.push('/(child)/tasko')}>
              <Text style={styles.xpLink}>Mijn monster →</Text>
            </TouchableOpacity>
          </View>
          <ProgressBar progress={xpProgress} color={Colors.status.success} height={6} />
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Routines</Text>
        <View style={styles.statsRow}>
          {[
            { value: doneCount, label: 'Gedaan' },
            { value: todoCount, label: 'Te doen' },
            { value: allTasks.length, label: 'Totaal' },
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
          {moodSaved ? (
            <Text style={styles.moodSaved}>
              ✓ Opgeslagen! {profile?.monster_name ?? 'Je monster'} weet hoe je je voelt.
            </Text>
          ) : (
            <>
              <Text style={styles.moodHint}>
                Vertel het aan {profile?.monster_name ?? 'je monster'} — hij luistert
              </Text>
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
            </>
          )}
        </View>

        {/* Next task */}
        <View style={styles.nextRow}>
          <Text style={styles.sectionTitle}>Volgende taak</Text>
          <TouchableOpacity onPress={() => router.push('/(child)/routines')}>
            <Text style={styles.xpLink}>Alles zien →</Text>
          </TouchableOpacity>
        </View>

        {nextTask ? (
          <View style={styles.nextCard}>
            <View style={styles.nextIconBox}>
              <Text style={{ fontSize: 20 }}>{nextTask.emoji}</Text>
            </View>
            <View style={styles.nextInfo}>
              <Text style={styles.nextTitle}>{nextTask.title}</Text>
              <Text style={styles.nextMeta}>
                {routines.find(r => r.tasks.some(t => t.id === nextTask.id))?.name ?? ''}
              </Text>
            </View>
            <View style={styles.xpPill}>
              <Text style={styles.xpPillText}>+20 EXP</Text>
            </View>
          </View>
        ) : allTasks.length > 0 ? (
          <View style={styles.allDoneCard}>
            <Text style={styles.allDoneText}>🎉 Alle taken gedaan! Goed bezig!</Text>
          </View>
        ) : (
          <View style={styles.allDoneCard}>
            <Text style={styles.allDoneText}>Nog geen taken. Vraag je ouder om routines aan te maken.</Text>
          </View>
        )}

        <View style={{ height: Spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  greeting: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.primary, letterSpacing: 1, textTransform: 'uppercase' },
  name: { fontSize: 26, fontWeight: FontWeight.bold, color: Colors.text.primary, marginTop: 2 },
  levelBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6, gap: 4, marginTop: 4, borderWidth: 1, borderColor: Colors.border },
  levelStar: { fontSize: 12 },
  levelText: { fontSize: FontSize.xs, color: Colors.text.primary, fontWeight: FontWeight.medium },

  monsterSection: { alignItems: 'center', marginVertical: Spacing.sm },
  monsterName: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text.primary, marginTop: 4 },

  quoteCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  quoteText: { fontSize: FontSize.md, color: Colors.text.primary, lineHeight: 22, textAlign: 'center', fontStyle: 'italic' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: Spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.text.muted },
  dotActive: { backgroundColor: Colors.text.primary },

  xpCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  xpLabel: { fontSize: FontSize.sm, color: Colors.text.secondary },
  xpAmount: { color: Colors.primary, fontWeight: FontWeight.semibold },
  xpLink: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },

  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: Spacing.sm },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statNumber: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },

  moodCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  moodHint: { fontSize: FontSize.sm, color: Colors.text.muted, marginBottom: Spacing.sm },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodItem: { alignItems: 'center', padding: 8, borderRadius: Radius.md, flex: 1 },
  moodItemActive: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.primary },
  moodEmoji: { fontSize: 24 },
  moodLabel: { fontSize: FontSize.xs, color: Colors.text.secondary, marginTop: 4 },
  moodSaved: { fontSize: FontSize.sm, color: Colors.status.success, textAlign: 'center', paddingVertical: 8 },

  nextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  nextCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  nextIconBox: { width: 40, height: 40, borderRadius: Radius.sm, backgroundColor: Colors.iconBg, alignItems: 'center', justifyContent: 'center' },
  nextInfo: { flex: 1 },
  nextTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  nextMeta: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },
  xpPill: { backgroundColor: 'rgba(72,187,120,0.15)', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  xpPillText: { fontSize: FontSize.xs, color: Colors.status.success, fontWeight: FontWeight.semibold },

  allDoneCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  allDoneText: { fontSize: FontSize.sm, color: Colors.text.secondary, textAlign: 'center' },
});
