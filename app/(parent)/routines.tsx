import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { useThemePreference } from '@/store/useThemePreference';
import { getChildren } from '@/services/children';
import { getRoutines } from '@/services/routines';
import { PRIMARY, primaryAlpha } from '@/constants/palette';
import { lightTheme, darkTheme, type AppTheme } from '@/constants/restyleTheme';
import type { ChildRow, TaskRow, RoutineWithTasks } from '@/lib/database.types';

function StatusBadge({ status }: { status: 'done' | 'pending' }) {
  const color = status === 'done' ? '#48bb78' : '#9ca3af';
  const label = status === 'done' ? '✓ Klaar' : '— Nog niet';
  return (
    <View style={[styles.statusBadge, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
      <Text style={[styles.statusBadgeText, { color }]}>{label}</Text>
    </View>
  );
}

function TaskCard({ task, c }: { task: TaskRow; c: AppTheme['colors'] }) {
  return (
    <View style={[styles.taskCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
      <View style={styles.taskCardHeader}>
        <View style={styles.taskIconBox}>
          <Text style={styles.taskEmoji}>{task.emoji}</Text>
        </View>
        <View style={styles.taskInfo}>
          <Text style={[styles.taskTitle, { color: c.textPrimary }]}>{task.title}</Text>
        </View>
        <StatusBadge status={task.completed ? 'done' : 'pending'} />
        <TouchableOpacity hitSlop={8}>
          <Ionicons name="create-outline" size={18} color={c.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ParentRoutinesScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useThemePreference();
  const c = isDark ? darkTheme.colors : lightTheme.colors;
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [routines, setRoutines] = useState<RoutineWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [routinesLoading, setRoutinesLoading] = useState(false);

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

  return (
    <Box flex={1} backgroundColor="background">

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <AnimatedBlob
          size={280} color={primaryAlpha(0.13)}
          duration={3500} opacityFrom={0.65} opacityTo={1} scaleTarget={1.12}
          style={{ top: -50, right: -60 }}
        />
        <AnimatedBlob
          size={160} color={primaryAlpha(0.08)}
          duration={2700} delay={600} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07}
          style={{ bottom: 100, left: -50 }}
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={[styles.title, { color: c.textPrimary }]}>Routines</Text>
              <Text style={[styles.subtitle, { color: c.textMuted }]}>Beheer de dagelijkse routines</Text>
            </View>
            <TouchableOpacity style={styles.addBtn}>
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </MotiView>

        {loading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginTop: 40 }} />
        ) : children.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>Geen kinderen gevonden</Text>
            <Text style={[styles.emptyBody, { color: c.textMuted }]}>Voeg eerst een kind toe via de instellingen.</Text>
          </View>
        ) : (
          <>
            {/* Child selector */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 340, delay: 120 }}
            >
              <View style={[styles.segmentRow, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
                {children.map((child) => (
                  <TouchableOpacity
                    key={child.id}
                    style={[styles.segmentBtn, activeChildId === child.id && styles.segmentBtnActive]}
                    onPress={() => setActiveChildId(child.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.segmentText, { color: c.textMuted }, activeChildId === child.id && styles.segmentTextActive]}>
                      {child.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </MotiView>

            {routinesLoading ? (
              <ActivityIndicator color={PRIMARY} style={{ marginTop: 24 }} />
            ) : routines.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
                <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>Geen routines</Text>
                <Text style={[styles.emptyBody, { color: c.textMuted }]}>Druk op + om een eerste routine aan te maken.</Text>
              </View>
            ) : (
              <MotiView
                from={{ opacity: 0, translateY: 12 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 340, delay: 160 }}
              >
                {routines.map((routine) => (
                  <View key={routine.id} style={styles.routineBlock}>
                    <View style={styles.routineHeader}>
                      <Text style={styles.routineLabel}>{routine.name.toUpperCase()}</Text>
                      {routine.scheduled_time && (
                        <Text style={[styles.routineTime, { color: c.textMuted }]}>{routine.scheduled_time}</Text>
                      )}
                    </View>
                    <View style={styles.taskList}>
                      {routine.tasks.length === 0 ? (
                        <View style={[styles.emptyTaskCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
                          <Text style={[styles.emptyBody, { color: c.textMuted }]}>Geen taken in deze routine.</Text>
                        </View>
                      ) : (
                        [...routine.tasks]
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map((task) => <TaskCard key={task.id} task={task} c={c} />)
                      )}
                    </View>
                  </View>
                ))}
              </MotiView>
            )}
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 8 },

  addBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', marginTop: 4 },

  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4 },

  segmentRow: { flexDirection: 'row', borderRadius: 99, padding: 3, marginBottom: 20, borderWidth: 1 },
  segmentBtn: { flex: 1, paddingVertical: 8, borderRadius: 99, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: PRIMARY },
  segmentText: { fontSize: 13, fontWeight: '500' },
  segmentTextActive: { color: '#fff', fontWeight: '600' },

  routineBlock: { marginBottom: 20 },
  routineHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  routineLabel: { fontSize: 11, fontWeight: '600', color: PRIMARY, letterSpacing: 0.8 },
  routineTime: { fontSize: 12 },

  taskList: { gap: 10 },
  taskCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  taskCardHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  taskIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: primaryAlpha(0.08),
    alignItems: 'center', justifyContent: 'center',
  },
  taskEmoji: { fontSize: 18 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: '600' },
  statusBadge: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1 },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },

  emptyCard: { borderRadius: 20, padding: 24, marginBottom: 20, borderWidth: 1, alignItems: 'center', gap: 8 },
  emptyTaskCard: { borderRadius: 16, padding: 16, borderWidth: 1, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptyBody: { fontSize: 13, textAlign: 'center' },
});
