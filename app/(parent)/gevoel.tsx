import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { getChildren } from '@/services/children';
import type { ChildRow } from '@/lib/database.types';

const DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

type MoodKey = 'great' | 'good' | 'okay' | 'sad' | 'bad' | null;

const DAY_MOODS: { mood: MoodKey; time: string }[] = [
  { mood: 'great', time: '08:12' },
  { mood: 'good', time: '07:55' },
  { mood: 'okay', time: '16:30' },
  { mood: 'great', time: '08:05' },
  { mood: 'sad', time: '17:10' },
  { mood: 'good', time: '15:44' },
  { mood: null, time: '' },
];

const MOOD_EMOJI: Record<NonNullable<MoodKey>, string> = {
  great: '😁', good: '🙂', okay: '😐', sad: '😒', bad: '😢',
};

const MOOD_COLOR: Record<NonNullable<MoodKey>, string> = {
  great: Colors.status.success,
  good: Colors.primary,
  okay: Colors.status.warning,
  sad: Colors.text.muted,
  bad: Colors.status.error,
};

const DISTRIBUTION = [
  { key: 'great' as const, label: 'Super', emoji: '😁', pct: 45 },
  { key: 'good' as const, label: 'Goed', emoji: '🙂', pct: 30 },
  { key: 'okay' as const, label: 'Zo-zo', emoji: '😐', pct: 15 },
  { key: 'sad' as const, label: 'Meh', emoji: '😒', pct: 7 },
  { key: 'bad' as const, label: 'Slecht', emoji: '😢', pct: 3 },
];

const INSIGHTS = [
  { icon: '💡', title: 'Vrijdag valt op', body: 'Emma voelt zich op vrijdagmiddag vaker minder goed.\nDit patroon is al 3 weken zichtbaar.' },
  { icon: '📈', title: 'Positieve week', body: '75% positief gevoel deze week — beter dan vorige week (62%).' },
];

export default function GevoelScreen() {
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [activeChild, setActiveChild] = useState<string | null>(null);

  useEffect(() => {
    getChildren().then((data) => {
      setChildren(data);
      if (data.length > 0) setActiveChild(data[0].id);
    }).catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color={Colors.primary} />
          <Text style={styles.backText}>Terug</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Gevoel</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Child selector */}
        <View style={styles.childSelector}>
          {children.map((c) => (
            <TouchableOpacity key={c.id} style={[styles.childBtn, activeChild === c.id && styles.childBtnActive]} onPress={() => setActiveChild(c.id)} activeOpacity={0.8}>
              <Text style={styles.childAvatar}>🧒</Text>
              <Text style={[styles.childName, activeChild === c.id && styles.childNameActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Week navigator */}
        <View style={styles.weekNav}>
          <TouchableOpacity style={styles.navArrow}>
            <Ionicons name="chevron-back" size={18} color={Colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.weekLabel}>24 – 30 mrt 2025</Text>
          <TouchableOpacity style={styles.navArrow}>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Day mood row */}
        <View style={styles.dayMoodRow}>
          {DAYS.map((d, i) => {
            const entry = DAY_MOODS[i];
            const bg = entry.mood ? `${MOOD_COLOR[entry.mood]}33` : Colors.surface;
            return (
              <View key={d} style={styles.dayMoodCol}>
                <Text style={styles.dayMoodLabel}>{d}</Text>
                <View style={[styles.dayMoodCircle, { backgroundColor: bg, borderColor: entry.mood ? MOOD_COLOR[entry.mood] : Colors.border }]}>
                  {entry.mood ? <Text style={styles.dayMoodEmoji}>{MOOD_EMOJI[entry.mood]}</Text> : null}
                </View>
                {entry.time ? <Text style={styles.dayMoodTime}>{entry.time}</Text> : null}
              </View>
            );
          })}
        </View>

        {/* Distribution */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verdeling deze week</Text>
          {DISTRIBUTION.map((m) => (
            <View key={m.key} style={styles.distRow}>
              <Text style={styles.distEmoji}>{m.emoji}</Text>
              <Text style={styles.distLabel}>{m.label}</Text>
              <View style={styles.distBarWrapper}>
                <ProgressBar progress={m.pct / 100} color={MOOD_COLOR[m.key]} height={6} />
              </View>
              <Text style={styles.distPct}>{m.pct}%</Text>
            </View>
          ))}
        </View>

        {/* Insights */}
        <Text style={styles.sectionTitle}>Inzichten</Text>
        {INSIGHTS.map((ins, i) => (
          <View key={i} style={styles.insightCard}>
            <Text style={styles.insightIcon}>{ins.icon}</Text>
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>{ins.title}</Text>
              <Text style={styles.insightBody}>{ins.body}</Text>
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
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  childSelector: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 4, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  childBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: Radius.md },
  childBtnActive: { backgroundColor: Colors.card },
  childAvatar: { fontSize: 16 },
  childName: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text.muted },
  childNameActive: { color: Colors.text.primary },
  weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.sm, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  navArrow: { padding: 4 },
  weekLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text.primary },
  dayMoodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  dayMoodCol: { alignItems: 'center', gap: 4 },
  dayMoodLabel: { fontSize: FontSize.xs, color: Colors.text.muted },
  dayMoodCircle: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dayMoodEmoji: { fontSize: 18 },
  dayMoodTime: { fontSize: 9, color: Colors.text.muted },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: 4 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  distEmoji: { fontSize: 16, width: 22 },
  distLabel: { fontSize: FontSize.sm, color: Colors.text.secondary, width: 44 },
  distBarWrapper: { flex: 1 },
  distPct: { fontSize: FontSize.xs, color: Colors.text.muted, width: 32, textAlign: 'right' },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: Spacing.sm },
  insightCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, flexDirection: 'row', gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  insightIcon: { fontSize: 22 },
  insightText: { flex: 1 },
  insightTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary, marginBottom: 4 },
  insightBody: { fontSize: FontSize.sm, color: Colors.text.muted, lineHeight: 18 },
});
