import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const CHILDREN = [
  { id: 'emma', name: 'Emma', avatar: '👧', done: 3, total: 5 },
  { id: 'luca', name: 'Luca', avatar: '👦', done: 1, total: 4 },
];

const TASKS: { icon: IconName; title: string; time: string; period: string; done: boolean }[] = [
  { icon: 'sparkles-outline', title: 'Tanden poetsen', time: '07:15', period: 'Ochtend', done: true },
  { icon: 'cafe-outline', title: 'Ontbijt eten', time: '07:30', period: 'Ochtend', done: true },
  { icon: 'star-outline', title: 'Huiswerk maken', time: '16:00', period: 'Middag', done: false },
  { icon: 'heart-outline', title: 'Buiten spelen', time: '17:30', period: 'Middag', done: false },
];

const PAST_MOODS = ['😁', '🙂', '😐', '😁', '😒', '🙂'];

export default function ParentOverview() {
  const [activeChild, setActiveChild] = useState('emma');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.portalLabel}>OUDER PORTAAL</Text>
            <Text style={styles.pageTitle}>Dag Jan!</Text>
          </View>
          <TouchableOpacity style={styles.planBadge} activeOpacity={0.8}>
            <Text style={styles.planText}>Gratis plan</Text>
          </TouchableOpacity>
        </View>

        {/* Ouder weergave pill */}
        <TouchableOpacity style={styles.viewPill} activeOpacity={0.8}>
          <View style={styles.viewDot} />
          <Text style={styles.viewPillText}>Ouder weergave</Text>
        </TouchableOpacity>

        {/* Child selector */}
        <View style={styles.childRow}>
          {CHILDREN.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.childCard, activeChild === c.id && styles.childCardActive]}
              onPress={() => setActiveChild(c.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.childAvatar}>{c.avatar}</Text>
              <View>
                <Text style={[styles.childName, activeChild === c.id && styles.childNameActive]}>{c.name}</Text>
                <Text style={[styles.childProgress, activeChild === c.id && styles.childProgressActive]}>
                  {c.done}/{c.total} gedaan
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Honesty alert */}
        <TouchableOpacity style={styles.alertBanner} activeOpacity={0.8} onPress={() => router.push('/(parent)/eerlijkheid')}>
          <Ionicons name="warning-outline" size={18} color={Colors.status.warning} />
          <View style={styles.alertText}>
            <Text style={styles.alertTitle}>Mogelijke oneerlijkheid</Text>
            <Text style={styles.alertSub}>Emma vinkte "Tanden poetsen" af in 3 sec.</Text>
          </View>
          <Text style={styles.alertLink}>Bekijk →</Text>
        </TouchableOpacity>

        {/* Routines vandaag */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Routines vandaag</Text>
          <TouchableOpacity onPress={() => router.push('/(parent)/routines')}>
            <Text style={styles.sectionLink}>Beheer →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.taskList}>
          {TASKS.map((t, i) => (
            <View key={i} style={[styles.taskRow, i < TASKS.length - 1 && styles.taskRowBorder]}>
              <View style={styles.taskIconBox}>
                <Ionicons name={t.icon} size={16} color={Colors.primary} />
              </View>
              <View style={styles.taskMeta}>
                <Text style={styles.taskTitle}>{t.title}</Text>
                <Text style={styles.taskTime}>{t.time} — {t.period}</Text>
              </View>
              <View style={styles.taskStatus}>
                <View style={[styles.statusDot, { backgroundColor: t.done ? Colors.status.success : Colors.status.warning }]} />
                <Text style={[styles.statusText, { color: t.done ? Colors.status.success : Colors.status.warning }]}>
                  {t.done ? 'Klaar' : 'Nog niet'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Gevoel vandaag */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Gevoel vandaag</Text>
          <TouchableOpacity onPress={() => router.push('/(parent)/gevoel')}>
            <Text style={styles.sectionLink}>Historiek →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.moodCard}>
          <View style={styles.moodCardHeader}>
            <Text style={styles.moodCardTitle}>Hoe voelt Emma zich?</Text>
            <Text style={styles.moodCardTime}>15:44</Text>
          </View>
          <View style={styles.moodMainRow}>
            <Text style={styles.moodEmoji}>🙂</Text>
            <Text style={styles.moodLabel}>Goed</Text>
          </View>
          <Text style={styles.moodDescription}>Emma checkte in na het huiswerk</Text>
          <View style={styles.moodHistory}>
            {PAST_MOODS.map((m, i) => (
              <View key={i} style={styles.moodHistoryBubble}>
                <Text style={styles.moodHistoryEmoji}>{m}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  portalLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.primary, letterSpacing: 1, textTransform: 'uppercase' },
  pageTitle: { fontSize: 28, fontWeight: FontWeight.bold, color: Colors.text.primary, marginTop: 2 },
  planBadge: { borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 5, marginTop: 6 },
  planText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },

  // View pill
  viewPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.surface, alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  viewDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary },
  viewPillText: { fontSize: FontSize.sm, color: Colors.text.primary, fontWeight: FontWeight.medium },

  // Child selector
  childRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  childCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.sm, borderWidth: 1.5, borderColor: Colors.border },
  childCardActive: { backgroundColor: Colors.primaryDeepest, borderColor: Colors.primary },
  childAvatar: { fontSize: 22 },
  childName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.secondary },
  childNameActive: { color: Colors.text.primary },
  childProgress: { fontSize: FontSize.xs, color: Colors.text.muted },
  childProgressActive: { color: Colors.primaryLight },

  // Alert banner
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(246,198,68,0.10)', borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: 'rgba(246,198,68,0.30)', borderLeftWidth: 3, borderLeftColor: Colors.status.warning },
  alertText: { flex: 1 },
  alertTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  alertSub: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },
  alertLink: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },

  // Section
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  sectionLink: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },

  // Task list
  taskList: { backgroundColor: Colors.surface, borderRadius: Radius.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  taskRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  taskRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  taskIconBox: { width: 32, height: 32, borderRadius: Radius.sm, backgroundColor: Colors.iconBg, alignItems: 'center', justifyContent: 'center' },
  taskMeta: { flex: 1 },
  taskTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  taskTime: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 1 },
  taskStatus: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },

  // Mood
  moodCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  moodCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  moodCardTitle: { fontSize: FontSize.sm, color: Colors.text.muted },
  moodCardTime: { fontSize: FontSize.xs, color: Colors.text.muted },
  moodMainRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  moodEmoji: { fontSize: 32 },
  moodLabel: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  moodDescription: { fontSize: FontSize.sm, color: Colors.text.muted, marginBottom: Spacing.sm },
  moodHistory: { flexDirection: 'row', gap: 6 },
  moodHistoryBubble: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  moodHistoryEmoji: { fontSize: 16 },
});
