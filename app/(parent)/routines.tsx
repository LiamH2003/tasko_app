import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  View, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Modal, Pressable, TextInput, Alert, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { useThemePreference } from '@/store/useThemePreference';
import { useParentChildren } from '@/store/useParentChildren';
import { getRoutinesForDate, createRoutine, updateRoutine, addTask, deleteTask, deleteRoutine } from '@/services/routines';
import { PRIMARY, primaryAlpha } from '@/constants/palette';
import { lightTheme, darkTheme, type AppTheme } from '@/constants/restyleTheme';
import type { ChildRow, RoutineWithTasks } from '@/lib/database.types';

// ── Constants ─────────────────────────────────────────────────────────────────


const EMOJI_RULES: [string, RegExp][] = [
  ['🌅', /ochtend|opstaan|wakker/i],
  ['🌙', /avond|nacht|slaap|slapen|\bbed\b/i],
  ['🍽', /eten|ontbijt|lunch|diner|maaltijd|brood/i],
  ['🎒', /school|tas|rugzak/i],
  ['🏃', /sport|rennen|lopen|gymmen|voetbal|fietsen|buiten/i],
  ['🧴', /douchen|wassen|tanden|gezicht|haar/i],
  ['🛁', /badkamer|\bbad\b/i],
  ['📚', /lezen|leren|studeren|huiswerk|\bboek/i],
  ['💊', /medicijn|pil|vitamine/i],
  ['🎨', /tekenen|knutselen|kunst|schilderen|kleuren/i],
  ['💪', /fitness|training|oefening|gewichten/i],
  ['🌿', /natuur|tuin|planten|wandelen/i],
  ['🎵', /muziek|piano|gitaar|zingen|viool|drum|dans/i],
  ['🎮', /\bspelen\b|game|speeltijd/i],
  ['🌞', /middag/i],
];

function pickEmoji(name: string): string {
  for (const [emoji, pattern] of EMOJI_RULES) {
    if (pattern.test(name)) return emoji;
  }
  return '📋';
}

const DAYS_NL  = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const MONTHS_NL = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
const WEEKDAYS_NL = ['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag'];

// ── Helpers ───────────────────────────────────────────────────────────────────

type Category = 'Ochtend' | 'Middag' | 'Avond' | 'Geen tijd';

const CATEGORY_ICON: Record<Category, React.ComponentProps<typeof Ionicons>['name']> = {
  'Ochtend':   'sunny-outline',
  'Middag':    'partly-sunny-outline',
  'Avond':     'moon-outline',
  'Geen tijd': 'calendar-outline',
};

function getCategory(time: string | null): Category {
  if (!time) return 'Geen tijd';
  const h = parseInt(time.split(':')[0], 10);
  if (h < 12) return 'Ochtend';
  if (h < 18) return 'Middag';
  return 'Avond';
}

function groupRoutines(routines: RoutineWithTasks[]): { category: Category; items: RoutineWithTasks[] }[] {
  const map: Record<Category, RoutineWithTasks[]> = { Ochtend: [], Middag: [], Avond: [], 'Geen tijd': [] };
  routines.forEach(r => map[getCategory(r.scheduled_time)].push(r));
  const ORDER: Category[] = ['Ochtend', 'Middag', 'Avond', 'Geen tijd'];
  return ORDER.filter(cat => map[cat].length > 0).map(cat => ({ category: cat, items: map[cat] }));
}

/** Returns local YYYY-MM-DD for a Date object */
function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isToday(d: Date): boolean {
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
}

function isFuture(d: Date): boolean {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const cmp = new Date(d); cmp.setHours(0, 0, 0, 0);
  return cmp > t;
}

function formatDateLabel(d: Date): string {
  if (isToday(d)) return 'Vandaag';
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Gisteren';
  const dow = (d.getDay() + 6) % 7;
  return `${WEEKDAYS_NL[dow]} ${d.getDate()} ${MONTHS_NL[d.getMonth()]}`;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

// ── Routine card ──────────────────────────────────────────────────────────────

function RoutineCard({
  routine, c, onRefresh, onDelete, onEdit,
}: {
  routine: RoutineWithTasks;
  c: AppTheme['colors'];
  onRefresh: () => void;
  onDelete: (id: string) => void;
  onEdit: (routine: RoutineWithTasks) => void;
}) {
  const [expanded,   setExpanded]   = useState(false);
  const [newStep,    setNewStep]    = useState('');
  const [stepSaving, setStepSaving] = useState(false);
  const [stepError,  setStepError]  = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const tasks   = [...routine.tasks].sort((a, b) => a.sort_order - b.sort_order);
  const hasDays = routine.days_of_week && routine.days_of_week.length > 0;

  async function handleAddStep() {
    if (!newStep.trim() || stepSaving) return;
    setStepError('');
    setStepSaving(true);
    try {
      const nextOrder = tasks.length === 0 ? 0 : Math.max(...tasks.map(t => t.sort_order)) + 1;
      await addTask(routine.id, newStep.trim(), pickEmoji(newStep.trim()), nextOrder);
      setNewStep('');
      onRefresh();
    } catch {
      setStepError('Kon stap niet opslaan. Probeer opnieuw.');
    } finally {
      setStepSaving(false);
    }
  }

  async function handleDeleteStep(taskId: string) {
    setDeleteError('');
    setDeletingId(taskId);
    try {
      await deleteTask(taskId);
      onRefresh();
    } catch {
      setDeleteError('Kon stap niet verwijderen.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <View style={[rc.card, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>

      {/* Header — tap to expand */}
      <TouchableOpacity style={rc.header} onPress={() => setExpanded(e => !e)} activeOpacity={0.8}>
        <Text style={rc.emoji}>{routine.emoji ?? '📋'}</Text>
        <View style={rc.headerMid}>
          <Text style={[rc.name, { color: c.textPrimary }]} numberOfLines={1}>{routine.name}</Text>
          <View style={rc.meta}>
            {routine.scheduled_time ? (
              <View style={rc.metaChip}>
                <Ionicons name="time-outline" size={10} color={PRIMARY} />
                <Text style={[rc.metaText, { color: PRIMARY }]}>
                  {routine.scheduled_time} ±{routine.window_minutes ?? 15} min
                </Text>
              </View>
            ) : null}
            {hasDays ? (
              <View style={rc.metaChip}>
                <Ionicons name="repeat-outline" size={10} color={c.textMuted} />
                <Text style={[rc.metaText, { color: c.textMuted }]}>
                  {routine.days_of_week.map(d => DAYS_NL[d]).join(' · ')}
                </Text>
              </View>
            ) : (
              <View style={rc.metaChip}>
                <Ionicons name="sync-outline" size={10} color={c.textMuted} />
                <Text style={[rc.metaText, { color: c.textMuted }]}>Elke dag</Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={c.textMuted} />
      </TouchableOpacity>

      {/* Expanded */}
      {expanded && (
        <MotiView from={{ opacity: 0, translateY: -4 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 180 }}>

          {tasks.map((task) => (
            <View key={task.id}>
              <View style={[rc.divider, { backgroundColor: c.glassCardBorder }]} />
              <View style={rc.stepRow}>
                <View style={[rc.stepBullet, { backgroundColor: task.completed ? '#48bb78' : c.textMuted }]} />
                <Text style={[rc.stepTitle, { color: task.completed ? c.textMuted : c.textPrimary }, task.completed && rc.stepDone]} numberOfLines={2}>
                  {task.title}
                </Text>
                {deletingId === task.id ? (
                  <ActivityIndicator size="small" color="#fc6b6b" style={{ width: 20 }} />
                ) : (
                  <TouchableOpacity hitSlop={10} onPress={() => handleDeleteStep(task.id)}>
                    <Ionicons name="close" size={16} color={c.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {/* Always-visible inline add input */}
          <View style={[rc.divider, { backgroundColor: c.glassCardBorder }]} />
          <View style={rc.addRow}>
            <TextInput
              style={[rc.addInput, { color: c.textPrimary }]}
              value={newStep}
              onChangeText={t => { setNewStep(t); setStepError(''); }}
              placeholder="Nieuwe stap toevoegen..."
              placeholderTextColor={c.placeholder}
              onSubmitEditing={handleAddStep}
              returnKeyType="done"
              blurOnSubmit={false}
            />
            {stepSaving ? (
              <ActivityIndicator size="small" color={PRIMARY} style={{ width: 24 }} />
            ) : newStep.trim() ? (
              <TouchableOpacity onPress={handleAddStep}>
                <Ionicons name="checkmark-circle" size={22} color={PRIMARY} />
              </TouchableOpacity>
            ) : null}
          </View>
          {!!stepError && (
            <Text style={rc.actionError}>{stepError}</Text>
          )}
          {!!deleteError && (
            <Text style={rc.actionError}>{deleteError}</Text>
          )}

          {/* Edit + Delete routine */}
          <View style={[rc.divider, { backgroundColor: c.glassCardBorder }]} />
          <View style={rc.bottomRow}>
            <TouchableOpacity
              style={rc.editRow}
              onPress={() => onEdit(routine)}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={13} color={PRIMARY} />
              <Text style={[rc.editText, { color: PRIMARY }]}>Routine bewerken</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={rc.deleteRow}
              onPress={() => onDelete(routine.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={13} color="#fc6b6b" />
              <Text style={rc.deleteText}>Verwijderen</Text>
            </TouchableOpacity>
          </View>
        </MotiView>
      )}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ParentRoutinesScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useThemePreference();
  const c = isDark ? darkTheme.colors : lightTheme.colors;

  const { childId: paramChildId } = useLocalSearchParams<{ childId?: string }>();

  const { children, childrenLoading, refreshChildren } = useParentChildren();
  const [refreshing, setRefreshing] = useState(false);
  const [activeChildId, setActiveChildId] = useState<string | null>(paramChildId || null);
  const [routines,      setRoutines]      = useState<RoutineWithTasks[]>([]);
  const [routinesLoading, setRoutinesLoading] = useState(false);
  const [routinesError,   setRoutinesError]   = useState<string | null>(null);

  // Day navigation
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Add/edit-routine sheet
  const [addOpen,          setAddOpen]          = useState(false);
  const [editingRoutine,   setEditingRoutine]   = useState<RoutineWithTasks | null>(null);
  const [sheetChildIds,    setSheetChildIds]    = useState<string[]>([]);
  const [newName,          setNewName]          = useState('');
  const [useTime,          setUseTime]          = useState(false);
  const [timeHour,         setTimeHour]         = useState(7);
  const [timeMinute,       setTimeMinute]       = useState(0);
  const [specificDays,     setSpecificDays]     = useState(false);
  const [selectedDays,     setSelectedDays]     = useState<number[]>([]);
  const [windowMinutes,    setWindowMinutes]    = useState(15);
  const [addError,         setAddError]         = useState('');
  const [saving,           setSaving]           = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!children.length) return;
    setActiveChildId(prev =>
      prev && children.some(ch => ch.id === prev) ? prev : children[0].id
    );
  }, [children]);

  useFocusEffect(useCallback(() => { refreshChildren(); }, [refreshChildren]));

  const loadRoutines = useCallback(async (childId: string, date: Date) => {
    setRoutinesLoading(true);
    setRoutinesError(null);
    try {
      setRoutines(await getRoutinesForDate(childId, toDateStr(date)));
    } catch (e: unknown) {
      setRoutines([]);
      const msg = (e as { message?: string })?.message ?? String(e);
      setRoutinesError(msg);
      console.error('[loadRoutines]', e);
    } finally {
      setRoutinesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeChildId) loadRoutines(activeChildId, selectedDate);
  }, [activeChildId, selectedDate, loadRoutines]);

  function refresh() {
    if (activeChildId) loadRoutines(activeChildId, selectedDate);
  }

  async function onRefresh() {
    setRefreshing(true);
    await Promise.allSettled([
      refreshChildren(),
      activeChildId ? loadRoutines(activeChildId, selectedDate) : Promise.resolve(),
    ]);
    setRefreshing(false);
  }

  function handleDelete(id: string) {
    Alert.alert(
      'Routine verwijderen',
      'Wil je deze routine en alle stappen verwijderen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen', style: 'destructive',
          onPress: async () => {
            try {
              await deleteRoutine(id);
              if (activeChildId) loadRoutines(activeChildId, selectedDate);
            } catch {
              Alert.alert('Mislukt', 'De routine kon niet worden verwijderd. Probeer opnieuw.');
            }
          },
        },
      ],
    );
  }

  function prevDay() {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    const limit = new Date(); limit.setDate(limit.getDate() - 30); limit.setHours(0, 0, 0, 0);
    const dCmp  = new Date(d); dCmp.setHours(0, 0, 0, 0);
    if (dCmp >= limit) setSelectedDate(d);
  }
  function nextDay() {
    const d = new Date(selectedDate); d.setDate(d.getDate() + 1);
    const limit = new Date(); limit.setDate(limit.getDate() + 14); limit.setHours(23, 59, 59, 999);
    if (d <= limit) setSelectedDate(d);
  }

  function toggleDay(d: number) {
    setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  // ── Add / edit routine ─────────────────────────────────────────────────────

  function openAdd() {
    setEditingRoutine(null);
    setSheetChildIds(activeChildId ? [activeChildId] : []);
    setNewName('');
    setUseTime(false);
    setTimeHour(7);
    setTimeMinute(0);
    setWindowMinutes(15);
    setSpecificDays(false);
    setSelectedDays([]);
    setAddError('');
    setAddOpen(true);
  }

  function openEdit(routine: RoutineWithTasks) {
    setEditingRoutine(routine);
    setNewName(routine.name);
    const hasTime = !!routine.scheduled_time;
    setUseTime(hasTime);
    if (hasTime) {
      const [h, m] = routine.scheduled_time!.split(':').map(Number);
      setTimeHour(h);
      setTimeMinute(m);
    } else {
      setTimeHour(7); setTimeMinute(0);
    }
    setWindowMinutes(routine.window_minutes ?? 15);
    const hasDays = routine.days_of_week?.length > 0;
    setSpecificDays(hasDays);
    setSelectedDays(hasDays ? [...routine.days_of_week] : []);
    setAddError('');
    setAddOpen(true);
  }

  function toggleSheetChild(id: string) {
    setSheetChildIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    if (!editingRoutine && !sheetChildIds.length) return;
    setSaving(true);
    setAddError('');
    const scheduledTime = useTime ? `${pad(timeHour)}:${pad(timeMinute)}` : undefined;
    const emoji = pickEmoji(newName.trim());
    try {
      if (editingRoutine) {
        await updateRoutine(editingRoutine.id, {
          name: newName.trim(),
          emoji,
          scheduled_time: scheduledTime ?? null,
          days_of_week: specificDays ? selectedDays : [],
          window_minutes: windowMinutes,
        });
      } else {
        const results = await Promise.allSettled(
          sheetChildIds.map(childId =>
            createRoutine(childId, newName.trim(), emoji, scheduledTime, specificDays ? selectedDays : [], windowMinutes)
          )
        );
        const failed = results.filter(r => r.status === 'rejected').length;
        if (failed === sheetChildIds.length) { setAddError('Opslaan mislukt. Probeer opnieuw.'); return; }
        if (failed > 0) setAddError(`${failed} van ${sheetChildIds.length} routines mislukt.`);
      }
      setAddOpen(false);
      if (activeChildId) loadRoutines(activeChildId, selectedDate);
    } catch {
      setAddError('Opslaan mislukt. Probeer opnieuw.');
    } finally {
      setSaving(false);
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const activeChild   = children.find(ch => ch.id === activeChildId) ?? null;
  const allTasks      = routines.flatMap(r => r.tasks);
  const doneCount     = allTasks.filter(t => t.completed).length;
  const grouped       = groupRoutines(routines);
  const futureDate    = isFuture(selectedDate);
  const dateLabel     = formatDateLabel(selectedDate);
  const atMinDate     = (() => {
    const limit = new Date(); limit.setDate(limit.getDate() - 30); limit.setHours(0, 0, 0, 0);
    const cmp   = new Date(selectedDate); cmp.setHours(0, 0, 0, 0);
    return cmp <= limit;
  })();

  return (
    <Box flex={1} backgroundColor="background">

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <AnimatedBlob size={280} color={primaryAlpha(0.13)} duration={3500} opacityFrom={0.65} opacityTo={1} scaleTarget={1.12} style={{ top: -50, right: -60 }} />
        <AnimatedBlob size={160} color={primaryAlpha(0.08)} duration={2700} delay={600} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07} style={{ bottom: 100, left: -50 }} />
      </View>

      <Box style={{ height: insets.top + 8 }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />}
      >

        {/* Header */}
        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 340, delay: 40 }}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: c.textPrimary }]}>Routines</Text>
              <Text style={[styles.subtitle, { color: c.textMuted }]}>
                {activeChild ? `${activeChild.name} · ${routines.length} routine${routines.length !== 1 ? 's' : ''}` : 'Dagelijkse routines'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.planBadge, { backgroundColor: primaryAlpha(0.06), borderColor: PRIMARY }]}
              activeOpacity={0.8}
            >
              <Text style={styles.planText}>Gratis plan</Text>
            </TouchableOpacity>
          </View>
        </MotiView>

        {childrenLoading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginTop: 48 }} />
        ) : children.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            <Ionicons name="people-outline" size={30} color={c.textMuted} />
            <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>Geen kinderen gevonden</Text>
            <Text style={[styles.emptyBody, { color: c.textMuted }]}>Voeg een kind toe via Instellingen.</Text>
          </View>
        ) : (
          <>
            {/* Child tabs + add button */}
            <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 80 }}>
              <View style={styles.tabAddRow}>
                {children.length > 1 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContent}>
                    {children.map((child) => {
                      const isActive = child.id === activeChildId;
                      return (
                        <TouchableOpacity key={child.id} style={[styles.tab, { backgroundColor: isActive ? PRIMARY : c.glassCard, borderColor: isActive ? PRIMARY : c.glassCardBorder }]} onPress={() => setActiveChildId(child.id)} activeOpacity={0.8}>
                          <View style={[styles.tabDot, { backgroundColor: isActive ? 'rgba(255,255,255,0.55)' : primaryAlpha(0.3) }]} />
                          <Text style={[styles.tabText, { color: isActive ? '#fff' : c.textMuted }]}>{child.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
                <TouchableOpacity
                  style={[styles.addBtn, futureDate && { opacity: 0.35 }]}
                  onPress={futureDate ? undefined : openAdd}
                  disabled={futureDate}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            </MotiView>

            {/* Day navigator */}
            <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 100 }}>
              <View style={[styles.dayNav, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
                <TouchableOpacity onPress={prevDay} style={styles.dayArrow} activeOpacity={atMinDate ? 1 : 0.7} disabled={atMinDate}>
                  <Ionicons name="chevron-back" size={20} color={atMinDate ? primaryAlpha(0.25) : c.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedDate(new Date())} activeOpacity={0.7} style={styles.dayLabelWrap}>
                  <Text style={[styles.dayLabel, { color: c.textPrimary }]}>{dateLabel}</Text>
                  {!isToday(selectedDate) && (
                    <Text style={[styles.dayBack, { color: PRIMARY }]}>Terug naar vandaag</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={nextDay} style={styles.dayArrow} activeOpacity={0.7}>
                  <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
                </TouchableOpacity>
              </View>
            </MotiView>

            {/* Stats */}
            {!routinesLoading && routines.length > 0 && (
              <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 130 }} style={styles.statsRow}>
                <View style={[styles.statChip, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
                  <Ionicons name="calendar-outline" size={14} color={c.textMuted} />
                  <Text style={[styles.statNum, { color: c.textPrimary }]}>{routines.length}</Text>
                  <Text style={[styles.statLbl, { color: c.textMuted }]}>Routines</Text>
                </View>
                <View style={[styles.statChip, { backgroundColor: '#48bb7812', borderColor: '#48bb7840' }]}>
                  <Ionicons name="checkmark-circle" size={14} color="#48bb78" />
                  <Text style={[styles.statNum, { color: '#48bb78' }]}>{doneCount}</Text>
                  <Text style={[styles.statLbl, { color: '#48bb78' }]}>Gedaan</Text>
                </View>
                <View style={[styles.statChip, { backgroundColor: primaryAlpha(0.06), borderColor: primaryAlpha(0.2) }]}>
                  <Ionicons name="ellipse-outline" size={14} color={PRIMARY} />
                  <Text style={[styles.statNum, { color: PRIMARY }]}>{allTasks.length - doneCount}</Text>
                  <Text style={[styles.statLbl, { color: PRIMARY }]}>Te doen</Text>
                </View>
              </MotiView>
            )}

            {/* Future date notice */}
            {futureDate && (
              <View style={[styles.futureNote, { backgroundColor: primaryAlpha(0.06), borderColor: primaryAlpha(0.15) }]}>
                <Ionicons name="information-circle-outline" size={15} color={PRIMARY} />
                <Text style={[styles.futureNoteText, { color: PRIMARY }]}>Toekomstige dag — nog geen voltooiingen</Text>
              </View>
            )}

            {/* Routine list */}
            {!!routinesError && (
              <View style={[styles.errorNote, { backgroundColor: '#fc6b6b18', borderColor: '#fc6b6b40' }]}>
                <Ionicons name="warning-outline" size={14} color="#fc6b6b" />
                <Text style={[styles.errorText, { color: '#fc6b6b' }]} numberOfLines={3}>{routinesError}</Text>
              </View>
            )}
            {routinesLoading ? (
              <ActivityIndicator color={PRIMARY} style={{ marginTop: 32 }} />
            ) : routines.length === 0 && !routinesError ? (
              <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 340, delay: 160 }}>
                <TouchableOpacity style={[styles.emptyCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]} onPress={futureDate ? undefined : openAdd} activeOpacity={futureDate ? 1 : 0.8}>
                  <View style={[styles.emptyIconBox, { backgroundColor: primaryAlpha(0.08) }]}>
                    <Ionicons name="calendar-outline" size={26} color={PRIMARY} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>
                    {futureDate ? 'Geen routines gepland' : 'Geen routines'}
                  </Text>
                  <Text style={[styles.emptyBody, { color: c.textMuted }]}>
                    {futureDate
                      ? 'Er zijn geen routines voor deze dag.'
                      : `Maak de eerste routine aan voor ${activeChild?.name}.`}
                  </Text>
                  {!futureDate && (
                    <View style={styles.emptyAction}>
                      <Ionicons name="add-circle-outline" size={15} color={PRIMARY} />
                      <Text style={[styles.emptyActionText, { color: PRIMARY }]}>Routine toevoegen</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </MotiView>
            ) : (
              <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 340, delay: 160 }}>
                {grouped.map(({ category, items }) => (
                  <View key={category} style={styles.group}>
                    <View style={styles.groupHeader}>
                      <Ionicons name={CATEGORY_ICON[category]} size={13} color={PRIMARY} />
                      <Text style={styles.groupLabel}>{category.toUpperCase()}</Text>
                    </View>
                    <View style={styles.groupCards}>
                      {items.map(routine => (
                        <RoutineCard key={routine.id} routine={routine} c={c} onRefresh={refresh} onDelete={handleDelete} onEdit={openEdit} />
                      ))}
                    </View>
                  </View>
                ))}
              </MotiView>
            )}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Add Routine sheet ── */}
      <Modal visible={addOpen} transparent animationType="fade" onRequestClose={() => setAddOpen(false)}>
        <Pressable style={sh.backdrop} onPress={() => setAddOpen(false)}>
          <MotiView from={{ opacity: 0, translateY: 48 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'spring', damping: 20, stiffness: 130 }} style={[sh.panel, { backgroundColor: c.sheetBg }]}>
            <Pressable>
              <View style={sh.handle} />
              <ScrollView showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="handled">

                <Text style={[sh.title, { color: c.textPrimary }]}>
                  {editingRoutine ? 'Routine bewerken' : 'Routine toevoegen'}
                </Text>
                <Text style={[sh.sub, { color: c.textMuted }]}>
                  {editingRoutine
                    ? editingRoutine.name
                    : sheetChildIds.length === 0
                      ? 'Selecteer een kind'
                      : sheetChildIds.length === 1
                        ? `Voor ${children.find(ch => ch.id === sheetChildIds[0])?.name ?? 'dit kind'}`
                        : `Voor ${sheetChildIds.length} kinderen`}
                </Text>

                {/* Child selector — only shown when adding (not editing) and 2+ children */}
                {!editingRoutine && children.length > 1 && (
                  <>
                    <Text style={[sh.label, { color: c.textMuted }]}>VOOR WIE</Text>
                    <View style={sh.childRow}>
                      {children.map(child => {
                        const selected = sheetChildIds.includes(child.id);
                        return (
                          <TouchableOpacity
                            key={child.id}
                            style={[sh.childPill, { backgroundColor: selected ? PRIMARY : c.glassCard, borderColor: selected ? PRIMARY : c.glassCardBorder }]}
                            onPress={() => toggleSheetChild(child.id)}
                            activeOpacity={0.8}
                          >
                            <Text style={[sh.childPillText, { color: selected ? '#fff' : c.textMuted }]}>{child.name}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}

                {/* Name — emoji auto-assigned from name */}
                <Text style={[sh.label, { color: c.textMuted }]}>NAAM</Text>
                <View style={[sh.inputRow, { backgroundColor: c.glassInput, borderColor: primaryAlpha(0.2) }]}>
                  <TextInput
                    style={[sh.input, { color: c.textPrimary }]}
                    value={newName}
                    onChangeText={t => { setNewName(t); setAddError(''); }}
                    placeholder="bijv. Ochtend routine"
                    placeholderTextColor={c.placeholder}
                    autoFocus
                    autoCorrect={false}
                    maxLength={40}
                  />
                </View>

                {/* Time toggle */}
                <View style={sh.timeToggleRow}>
                  <Text style={[sh.label, { color: c.textMuted, marginBottom: 0 }]}>TIJD</Text>
                  <TouchableOpacity
                    style={[sh.timeToggleBtn, { backgroundColor: useTime ? PRIMARY : c.glassCard, borderColor: useTime ? PRIMARY : c.glassCardBorder }]}
                    onPress={() => setUseTime(v => !v)}
                    activeOpacity={0.8}
                  >
                    <Text style={[sh.timeToggleText, { color: useTime ? '#fff' : c.textMuted }]}>
                      {useTime ? `${pad(timeHour)}:${pad(timeMinute)}` : 'Geen tijd'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {useTime && (
                  <View style={[sh.clockCard, { backgroundColor: c.glassCard, borderColor: PRIMARY }]}>
                    {/* Hour column */}
                    <View style={sh.clockCol}>
                      <TouchableOpacity onPress={() => setTimeHour(h => h >= 23 ? 0 : h + 1)} style={sh.clockArrow} activeOpacity={0.7} hitSlop={10}>
                        <Ionicons name="chevron-up" size={24} color={PRIMARY} />
                      </TouchableOpacity>
                      <Text style={[sh.clockDigit, { color: c.textPrimary }]}>{pad(timeHour)}</Text>
                      <TouchableOpacity onPress={() => setTimeHour(h => h <= 0 ? 23 : h - 1)} style={sh.clockArrow} activeOpacity={0.7} hitSlop={10}>
                        <Ionicons name="chevron-down" size={24} color={PRIMARY} />
                      </TouchableOpacity>
                      <Text style={[sh.clockUnit, { color: c.textMuted }]}>UUR</Text>
                    </View>
                    <Text style={[sh.clockColon, { color: PRIMARY }]}>:</Text>
                    {/* Minute column */}
                    <View style={sh.clockCol}>
                      <TouchableOpacity onPress={() => setTimeMinute(m => m >= 59 ? 0 : m + 1)} style={sh.clockArrow} activeOpacity={0.7} hitSlop={10}>
                        <Ionicons name="chevron-up" size={24} color={PRIMARY} />
                      </TouchableOpacity>
                      <Text style={[sh.clockDigit, { color: c.textPrimary }]}>{pad(timeMinute)}</Text>
                      <TouchableOpacity onPress={() => setTimeMinute(m => m <= 0 ? 59 : m - 1)} style={sh.clockArrow} activeOpacity={0.7} hitSlop={10}>
                        <Ionicons name="chevron-down" size={24} color={PRIMARY} />
                      </TouchableOpacity>
                      <Text style={[sh.clockUnit, { color: c.textMuted }]}>MIN</Text>
                    </View>
                  </View>
                )}

                {/* Window selector — only when a time is set */}
                {useTime && (
                  <View style={sh.windowRow}>
                    <Text style={[sh.label, { color: c.textMuted, marginBottom: 0 }]}>VENSTER</Text>
                    <View style={sh.windowPills}>
                      {[10, 15, 30, 60].map(min => (
                        <TouchableOpacity
                          key={min}
                          style={[sh.windowPill, { backgroundColor: windowMinutes === min ? PRIMARY : c.glassCard, borderColor: windowMinutes === min ? PRIMARY : c.glassCardBorder }]}
                          onPress={() => setWindowMinutes(min)}
                          activeOpacity={0.8}
                        >
                          <Text style={[sh.windowPillText, { color: windowMinutes === min ? '#fff' : c.textMuted }]}>±{min} min</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Days of week — every day by default, specific days opt-in */}
                <View style={sh.timeToggleRow}>
                  <Text style={[sh.label, { color: c.textMuted, marginBottom: 0 }]}>HERHALING</Text>
                  <TouchableOpacity
                    style={[sh.timeToggleBtn, { backgroundColor: specificDays ? PRIMARY : c.glassCard, borderColor: specificDays ? PRIMARY : c.glassCardBorder }]}
                    onPress={() => { setSpecificDays(v => !v); setSelectedDays([]); }}
                    activeOpacity={0.8}
                  >
                    <Text style={[sh.timeToggleText, { color: specificDays ? '#fff' : c.textMuted }]}>
                      {specificDays ? 'Specifieke dagen' : 'Elke dag'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {specificDays && (
                  <>
                    <View style={sh.daysRow}>
                      {DAYS_NL.map((day, i) => {
                        const selected = selectedDays.includes(i);
                        return (
                          <TouchableOpacity
                            key={i}
                            style={[sh.dayPill, { backgroundColor: selected ? PRIMARY : c.glassCard, borderColor: selected ? PRIMARY : c.glassCardBorder }]}
                            onPress={() => toggleDay(i)}
                            activeOpacity={0.8}
                          >
                            <Text style={[sh.dayPillText, { color: selected ? '#fff' : c.textMuted }]}>{day}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {selectedDays.length === 0 && (
                      <Text style={sh.daysWarning}>Selecteer minimaal één dag.</Text>
                    )}
                  </>
                )}

                {!!addError && <Text style={sh.error}>{addError}</Text>}

                <View style={sh.actions}>
                  <TouchableOpacity style={[sh.cancelBtn, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]} onPress={() => setAddOpen(false)} activeOpacity={0.8}>
                    <Text style={[sh.cancelText, { color: c.textMuted }]}>Annuleren</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[sh.saveBtn, (!newName.trim() || (!editingRoutine && !sheetChildIds.length) || (specificDays && !selectedDays.length)) && sh.saveBtnOff]} onPress={handleAdd} disabled={!newName.trim() || (!editingRoutine && !sheetChildIds.length) || (specificDays && !selectedDays.length) || saving} activeOpacity={0.85}>
                    {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={sh.saveText}>Opslaan</Text>}
                  </TouchableOpacity>
                </View>

              </ScrollView>
            </Pressable>
          </MotiView>
        </Pressable>
      </Modal>
    </Box>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  title:     { fontSize: 28, fontWeight: '700' },
  subtitle:  { fontSize: 13, marginTop: 4 },
  addBtn:    { width: 38, height: 38, borderRadius: 19, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center' },
  planBadge: { borderWidth: 1.5, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5, marginTop: 4 },
  planText:  { fontSize: 11, color: PRIMARY, fontWeight: '500' },

  tabAddRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  tabScroll:  { flex: 1 },
  tabContent: { gap: 8 },
  tab:     { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5 },
  tabDot:  { width: 6, height: 6, borderRadius: 3 },
  tabText: { fontSize: 13, fontWeight: '600' },

  dayNav:       { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  dayArrow:     { padding: 12 },
  dayLabelWrap: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  dayLabel:     { fontSize: 14, fontWeight: '700' },
  dayBack:      { fontSize: 11, marginTop: 2, fontWeight: '500' },

  futureNote:  { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 14 },
  futureNoteText: { fontSize: 12, fontWeight: '500', flex: 1 },
  errorNote:   { flexDirection: 'row', alignItems: 'flex-start', gap: 7, borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 14 },
  errorText:   { fontSize: 12, fontWeight: '500', flex: 1 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statChip: { flex: 1, borderRadius: 14, borderWidth: 1, paddingVertical: 11, alignItems: 'center', gap: 3 },
  statNum:  { fontSize: 19, fontWeight: '800' },
  statLbl:  { fontSize: 10, fontWeight: '500' },

  group:       { marginBottom: 22 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  groupLabel:  { fontSize: 11, fontWeight: '700', color: PRIMARY, letterSpacing: 0.8 },
  groupCards:  { gap: 10 },

  emptyCard:       { borderRadius: 20, padding: 32, borderWidth: 1, alignItems: 'center', gap: 10 },
  emptyIconBox:    { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle:      { fontSize: 17, fontWeight: '700' },
  emptyBody:       { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  emptyAction:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  emptyActionText: { fontSize: 13, fontWeight: '600' },
});

// Routine card
const rc = StyleSheet.create({
  card:        { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  header:      { flexDirection: 'row', alignItems: 'center', padding: 13, gap: 10 },
  emoji:       { fontSize: 20 },
  headerMid:   { flex: 1, gap: 3 },
  name:        { fontSize: 14, fontWeight: '700' },
  meta:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaChip:    { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText:    { fontSize: 11, fontWeight: '500' },
  divider:    { height: 1 },
  stepRow:    { flexDirection: 'row', alignItems: 'center', paddingLeft: 14, paddingRight: 12, paddingVertical: 9, gap: 8 },
  stepBullet: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  stepTitle:  { flex: 1, fontSize: 13 },
  stepDone:   { textDecorationLine: 'line-through' },
  addRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  addInput: { flex: 1, fontSize: 13, padding: 0 },
  bottomRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  editRow:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 7, flex: 1 },
  editText:    { fontSize: 12, fontWeight: '500' },
  deleteRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 7 },
  deleteText:  { fontSize: 12, color: '#fc6b6b', fontWeight: '500' },
  actionError: { fontSize: 11, color: '#fc6b6b', paddingHorizontal: 14, paddingBottom: 8 },
});

// Sheet
const sh = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  panel:    { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, maxHeight: '90%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  handle:   { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(128,128,128,0.3)', alignSelf: 'center', marginBottom: 24 },
  title:    { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  sub:      { fontSize: 13, marginBottom: 22 },
  label:    { fontSize: 10, fontWeight: '600', letterSpacing: 0.8, marginBottom: 10 },

  inputRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1.5, marginBottom: 22 },
  input:     { flex: 1, fontSize: 15, padding: 0 },

  timeToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  timeToggleBtn: { borderRadius: 99, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1.5 },
  timeToggleText:{ fontSize: 13, fontWeight: '600' },

  clockCard:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 22, borderWidth: 1.5, paddingVertical: 18, paddingHorizontal: 24, marginBottom: 22 },
  clockCol:   { alignItems: 'center', gap: 6, minWidth: 80 },
  clockArrow: { padding: 2 },
  clockDigit: { fontSize: 52, fontWeight: '800', letterSpacing: -2, lineHeight: 58 },
  clockColon: { fontSize: 46, fontWeight: '800', marginBottom: 26 },
  clockUnit:  { fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  childRow:     { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 22 },
  childPill:    { borderRadius: 99, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1.5 },
  childPillText:{ fontSize: 13, fontWeight: '600' },

  daysRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  dayPill:  { flex: 1, borderRadius: 10, paddingVertical: 9, borderWidth: 1.5, alignItems: 'center', marginHorizontal: 2 },
  dayPillText: { fontSize: 12, fontWeight: '700' },

  error:        { fontSize: 12, color: '#fc6b6b', marginBottom: 12 },
  daysWarning:  { fontSize: 12, color: '#f6c644', marginBottom: 12, marginTop: -10 },
  windowRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  windowPills:    { flexDirection: 'row', gap: 6 },
  windowPill:     { borderRadius: 99, paddingHorizontal: 11, paddingVertical: 7, borderWidth: 1.5 },
  windowPillText: { fontSize: 11, fontWeight: '600' },
  actions:   { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, height: 50, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  cancelText:{ fontSize: 14, fontWeight: '500' },
  saveBtn:   { flex: 2, height: 50, backgroundColor: PRIMARY, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  saveBtnOff:{ backgroundColor: primaryAlpha(0.35) },
  saveText:  { fontSize: 14, color: '#fff', fontWeight: '700' },
});
