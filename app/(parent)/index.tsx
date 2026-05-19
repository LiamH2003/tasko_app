import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { getChildren } from '@/services/children';
import { getRoutines } from '@/services/routines';
import type { ChildRow, RoutineWithTasks } from '@/lib/database.types';

export default function ParentOverview() {
  const { session } = useAppStore();
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [routines, setRoutines] = useState<RoutineWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [routinesLoading, setRoutinesLoading] = useState(false);

  const firstName = session?.user.user_metadata?.first_name
    ?? session?.user.email?.split('@')[0]
    ?? 'ouder';

  useEffect(() => {
    getChildren()
      .then((data) => {
        setChildren(data);
        if (data.length > 0) setActiveChildId(data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeChildId) return;
    setRoutinesLoading(true);
    getRoutines(activeChildId)
      .then(setRoutines)
      .catch(() => {})
      .finally(() => setRoutinesLoading(false));
  }, [activeChildId]);

  const activeChild = children.find(c => c.id === activeChildId);
  const allTasks = routines.flatMap(r => r.tasks);
  const doneCount = allTasks.filter(t => t.completed).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.portalLabel}>OUDER PORTAAL</Text>
            <Text style={styles.pageTitle}>Dag {firstName}!</Text>
          </View>
          <TouchableOpacity style={styles.planBadge} activeOpacity={0.8}>
            <Text style={styles.planText}>Gratis plan</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.viewPill} activeOpacity={0.8}>
          <View style={styles.viewDot} />
          <Text style={styles.viewPillText}>Ouder weergave</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : children.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👨‍👩‍👧</Text>
            <Text style={styles.emptyTitle}>Nog geen kinderen</Text>
            <Text style={styles.emptyBody}>
              Deel de uitnodigingscode met je kind zodat hij kan inloggen op zijn toestel.
            </Text>
          </View>
        ) : (
          <>
            {/* Child selector */}
            <View style={styles.childRow}>
              {children.map((c) => {
                const isActive = c.id === activeChildId;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.childCard, isActive && styles.childCardActive]}
                    onPress={() => setActiveChildId(c.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.childAvatar}>🧒</Text>
                    <View>
                      <Text style={[styles.childName, isActive && styles.childNameActive]}>{c.name}</Text>
                      <Text style={[styles.childProgress, isActive && styles.childProgressActive]}>
                        {isActive && allTasks.length > 0
                          ? `${doneCount}/${allTasks.length} gedaan`
                          : isActive ? 'Geen taken' : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Routines vandaag */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Routines vandaag</Text>
              <TouchableOpacity onPress={() => router.push('/(parent)/routines')}>
                <Text style={styles.sectionLink}>Beheer →</Text>
              </TouchableOpacity>
            </View>

            {routinesLoading ? (
              <ActivityIndicator color={Colors.primary} style={{ marginVertical: 16 }} />
            ) : allTasks.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardText}>Nog geen taken voor {activeChild?.name ?? 'dit kind'}.</Text>
                <TouchableOpacity onPress={() => router.push('/(parent)/routines')}>
                  <Text style={styles.emptyCardLink}>Voeg routines toe →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.taskList}>
                {allTasks.map((t, i) => {
                  const routineName = routines.find(r => r.id === t.routine_id)?.name ?? '';
                  return (
                    <View key={t.id} style={[styles.taskRow, i < allTasks.length - 1 && styles.taskRowBorder]}>
                      <View style={styles.taskIconBox}>
                        <Text style={styles.taskEmoji}>{t.emoji}</Text>
                      </View>
                      <View style={styles.taskMeta}>
                        <Text style={styles.taskTitle}>{t.title}</Text>
                        <Text style={styles.taskTime}>{routineName}</Text>
                      </View>
                      <View style={styles.taskStatus}>
                        <View style={[styles.statusDot, { backgroundColor: t.completed ? Colors.status.success : Colors.status.warning }]} />
                        <Text style={[styles.statusText, { color: t.completed ? Colors.status.success : Colors.status.warning }]}>
                          {t.completed ? 'Klaar' : 'Nog niet'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Gevoel vandaag */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Gevoel vandaag</Text>
              <TouchableOpacity onPress={() => router.push('/(parent)/gevoel')}>
                <Text style={styles.sectionLink}>Historiek →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.moodCard}>
              <Ionicons name="happy-outline" size={28} color={Colors.text.muted} style={{ marginBottom: 8 }} />
              <Text style={styles.moodEmpty}>
                {activeChild?.name ?? 'Je kind'} heeft vandaag nog geen gevoel ingecheckt.
              </Text>
            </View>
          </>
        )}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  portalLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.primary, letterSpacing: 1, textTransform: 'uppercase' },
  pageTitle: { fontSize: 28, fontWeight: FontWeight.bold, color: Colors.text.primary, marginTop: 2 },
  planBadge: { borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 5, marginTop: 6 },
  planText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },

  viewPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.surface, alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  viewDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary },
  viewPillText: { fontSize: FontSize.sm, color: Colors.text.primary, fontWeight: FontWeight.medium },

  childRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  childCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.sm, borderWidth: 1.5, borderColor: Colors.border },
  childCardActive: { backgroundColor: Colors.primaryDeepest, borderColor: Colors.primary },
  childAvatar: { fontSize: 22 },
  childName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.secondary },
  childNameActive: { color: Colors.text.primary },
  childProgress: { fontSize: FontSize.xs, color: Colors.text.muted },
  childProgressActive: { color: Colors.primaryLight },

  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  sectionLink: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },

  taskList: { backgroundColor: Colors.surface, borderRadius: Radius.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  taskRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  taskRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  taskIconBox: { width: 32, height: 32, borderRadius: Radius.sm, backgroundColor: Colors.iconBg, alignItems: 'center', justifyContent: 'center' },
  taskEmoji: { fontSize: 16 },
  taskMeta: { flex: 1 },
  taskTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  taskTime: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 1 },
  taskStatus: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },

  moodCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  moodEmpty: { fontSize: FontSize.sm, color: Colors.text.muted, textAlign: 'center', lineHeight: 20 },

  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.lg },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: 8, textAlign: 'center' },
  emptyBody: { fontSize: FontSize.md, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22 },

  emptyCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', gap: 8 },
  emptyCardText: { fontSize: FontSize.sm, color: Colors.text.muted, textAlign: 'center' },
  emptyCardLink: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
});
