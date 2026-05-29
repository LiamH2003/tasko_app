import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useThemePreference } from '@/store/useThemePreference';
import { getChildren } from '@/services/children';
import { PRIMARY, primaryAlpha } from '@/constants/palette';
import { lightTheme, darkTheme } from '@/constants/restyleTheme';
import type { ChildRow } from '@/lib/database.types';

const DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

type MoodKey = 'great' | 'good' | 'okay' | 'sad' | 'bad' | null;

const DAY_MOODS: { mood: MoodKey; time: string }[] = [
  { mood: 'great', time: '08:12' },
  { mood: 'good',  time: '07:55' },
  { mood: 'okay',  time: '16:30' },
  { mood: 'great', time: '08:05' },
  { mood: 'sad',   time: '17:10' },
  { mood: 'good',  time: '15:44' },
  { mood: null,    time: '' },
];

const MOOD_EMOJI: Record<NonNullable<MoodKey>, string> = {
  great: '😁', good: '🙂', okay: '😐', sad: '😒', bad: '😢',
};

const MOOD_COLOR: Record<NonNullable<MoodKey>, string> = {
  great: '#48bb78',
  good:  PRIMARY,
  okay:  '#f6c644',
  sad:   '#9ca3af',
  bad:   '#fc6b6b',
};

const DISTRIBUTION = [
  { key: 'great' as const, label: 'Super',  emoji: '😁', pct: 45 },
  { key: 'good'  as const, label: 'Goed',   emoji: '🙂', pct: 30 },
  { key: 'okay'  as const, label: 'Zo-zo',  emoji: '😐', pct: 15 },
  { key: 'sad'   as const, label: 'Meh',    emoji: '😒', pct: 7  },
  { key: 'bad'   as const, label: 'Slecht', emoji: '😢', pct: 3  },
];

const INSIGHTS = [
  { icon: '💡', title: 'Vrijdag valt op', body: 'Emma voelt zich op vrijdagmiddag vaker minder goed.\nDit patroon is al 3 weken zichtbaar.' },
  { icon: '📈', title: 'Positieve week',  body: '75% positief gevoel deze week — beter dan vorige week (62%).' },
];

export default function GevoelScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useThemePreference();
  const c = isDark ? darkTheme.colors : lightTheme.colors;
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [activeChild, setActiveChild] = useState<string | null>(null);

  useEffect(() => {
    getChildren().then((data) => {
      setChildren(data);
      if (data.length > 0) setActiveChild(data[0].id);
    }).catch(() => {});
  }, []);

  return (
    <Box flex={1} backgroundColor="background">

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <AnimatedBlob
          size={280} color={primaryAlpha(0.13)}
          duration={3500} opacityFrom={0.65} opacityTo={1} scaleTarget={1.12}
          style={{ top: -50, left: -60 }}
        />
        <AnimatedBlob
          size={160} color={primaryAlpha(0.08)}
          duration={2700} delay={600} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07}
          style={{ bottom: 120, right: -40 }}
        />
      </View>

      <Box style={{ height: insets.top + 8 }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 60 }}
          style={styles.header}
        >
          <Text style={[styles.title, { color: c.textPrimary }]}>Gevoel</Text>
          <Text style={[styles.subtitle, { color: c.textMuted }]}>Hoe voelt je kind zich deze week?</Text>
        </MotiView>

        {/* Child selector */}
        {children.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 120 }}
          >
            <View style={[styles.segmentRow, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={[styles.segmentBtn, activeChild === child.id && styles.segmentBtnActive]}
                  onPress={() => setActiveChild(child.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentText, { color: c.textMuted }, activeChild === child.id && styles.segmentTextActive]}>
                    {child.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </MotiView>
        )}

        {/* Week navigator */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 160 }}
        >
          <View style={[styles.weekNav, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            <TouchableOpacity style={styles.navArrow}>
              <Ionicons name="chevron-back" size={18} color={c.textMuted} />
            </TouchableOpacity>
            <Text style={[styles.weekLabel, { color: c.textPrimary }]}>24 – 30 mrt 2025</Text>
            <TouchableOpacity style={styles.navArrow}>
              <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* Day mood row */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 200 }}
        >
          <View style={[styles.dayMoodCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            {DAYS.map((d, i) => {
              const entry = DAY_MOODS[i];
              const moodColor = entry.mood ? MOOD_COLOR[entry.mood] : null;
              return (
                <View key={d} style={styles.dayMoodCol}>
                  <Text style={[styles.dayMoodLabel, { color: c.textMuted }]}>{d}</Text>
                  <View style={[
                    styles.dayMoodCircle,
                    {
                      backgroundColor: moodColor ? `${moodColor}33` : c.glassInput,
                      borderColor: moodColor ?? c.glassCardBorder,
                    },
                  ]}>
                    {entry.mood ? <Text style={styles.dayMoodEmoji}>{MOOD_EMOJI[entry.mood]}</Text> : null}
                  </View>
                  {entry.time ? <Text style={[styles.dayMoodTime, { color: c.textMuted }]}>{entry.time}</Text> : null}
                </View>
              );
            })}
          </View>
        </MotiView>

        {/* Distribution */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 240 }}
        >
          <Text style={styles.sectionHeader}>VERDELING DEZE WEEK</Text>
          <View style={[styles.card, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            {DISTRIBUTION.map((m) => (
              <View key={m.key} style={styles.distRow}>
                <Text style={styles.distEmoji}>{m.emoji}</Text>
                <Text style={[styles.distLabel, { color: c.textMuted }]}>{m.label}</Text>
                <View style={styles.distBarWrapper}>
                  <ProgressBar progress={m.pct / 100} color={MOOD_COLOR[m.key]} height={6} />
                </View>
                <Text style={[styles.distPct, { color: c.textMuted }]}>{m.pct}%</Text>
              </View>
            ))}
          </View>
        </MotiView>

        {/* Insights */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 280 }}
        >
          <Text style={styles.sectionHeader}>INZICHTEN</Text>
          {INSIGHTS.map((ins, i) => (
            <View key={i} style={[styles.insightCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
              <View style={styles.insightIconBox}>
                <Text style={styles.insightIconEmoji}>{ins.icon}</Text>
              </View>
              <View style={styles.insightText}>
                <Text style={[styles.insightTitle, { color: c.textPrimary }]}>{ins.title}</Text>
                <Text style={[styles.insightBody, { color: c.textMuted }]}>{ins.body}</Text>
              </View>
            </View>
          ))}
        </MotiView>

        <View style={{ height: 24 }} />
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 8 },

  header: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4 },

  segmentRow: { flexDirection: 'row', borderRadius: 99, padding: 3, marginBottom: 16, borderWidth: 1 },
  segmentBtn: { flex: 1, paddingVertical: 8, borderRadius: 99, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: PRIMARY },
  segmentText: { fontSize: 13, fontWeight: '500' },
  segmentTextActive: { color: '#fff', fontWeight: '600' },

  weekNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 16, padding: 12, marginBottom: 16, borderWidth: 1,
  },
  navArrow: { padding: 4 },
  weekLabel: { fontSize: 13, fontWeight: '500' },

  dayMoodCard: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1,
  },
  dayMoodCol: { alignItems: 'center', gap: 4 },
  dayMoodLabel: { fontSize: 11 },
  dayMoodCircle: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dayMoodEmoji: { fontSize: 18 },
  dayMoodTime: { fontSize: 9 },

  sectionHeader: { fontSize: 11, fontWeight: '600', color: PRIMARY, letterSpacing: 0.8, marginBottom: 10 },

  card: { borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1, gap: 12 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  distEmoji: { fontSize: 16, width: 22 },
  distLabel: { fontSize: 12, width: 44 },
  distBarWrapper: { flex: 1 },
  distPct: { fontSize: 11, width: 32, textAlign: 'right' },

  insightCard: { borderRadius: 20, padding: 16, marginBottom: 10, flexDirection: 'row', gap: 14, borderWidth: 1 },
  insightIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: primaryAlpha(0.08),
    alignItems: 'center', justifyContent: 'center',
  },
  insightIconEmoji: { fontSize: 18 },
  insightText: { flex: 1 },
  insightTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  insightBody: { fontSize: 12, lineHeight: 18 },
});
