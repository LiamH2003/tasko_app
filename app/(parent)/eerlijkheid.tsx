import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
  RefreshControl, Alert, Modal, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { useThemePreference } from '@/store/useThemePreference';
import { useParentChildren } from '@/store/useParentChildren';
import { getHonestyFlags, dismissHonestyFlag } from '@/services/honesty';
import type { HonestyFlag } from '@/services/honesty';
import { PRIMARY, primaryAlpha } from '@/constants/palette';
import { lightTheme, darkTheme, type AppTheme } from '@/constants/restyleTheme';

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTHS_NL = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
const DAYS_FULL = ['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag'];

const FLAG_META: Record<HonestyFlag['type'], {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  title: string;
  badge: string;
}> = {
  burst:         { icon: 'flash-outline',       color: '#f6c644', title: 'Snelle afvinkactie',    badge: 'Snelheid' },
  off_hours:     { icon: 'moon-outline',         color: '#b57be6', title: 'Nachtelijke activiteit', badge: 'Tijdstip' },
  missed_window: { icon: 'close-circle-outline', color: '#fc6b6b', title: 'Routine gemist',        badge: 'Gemist'   },
  late_window:   { icon: 'time-outline',         color: '#f6c644', title: 'Routine te laat',        badge: 'Te laat'  },
};

const FLAG_TYPE_ORDER: HonestyFlag['type'][] = ['missed_window', 'late_window', 'burst', 'off_hours'];

type ActiveFilter = HonestyFlag['type'] | 'all';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatFlagDate(dateStr: string): string {
  const d         = new Date(dateStr + 'T12:00:00');
  const today     = new Date();
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString())     return 'Vandaag';
  if (d.toDateString() === yesterday.toDateString()) return 'Gisteren';
  const dow = (d.getDay() + 6) % 7;
  return `${DAYS_FULL[dow]} ${d.getDate()} ${MONTHS_NL[d.getMonth()]}`;
}

function flagBody(flag: HonestyFlag): string {
  if (flag.type === 'burst') {
    const names = flag.taskNames.slice(0, 3).join(', ');
    const more  = flag.taskNames.length > 3 ? ` +${flag.taskNames.length - 3}` : '';
    return `${flag.taskNames.length} taken afgevinkt in ${flag.durationSeconds} seconden: ${names}${more}.`;
  }
  if (flag.type === 'off_hours') return `Taak "${flag.taskNames[0]}" afgevinkt om ${flag.time} 's nachts.`;
  if (flag.type === 'missed_window') {
    const names = (flag.taskNames ?? []).slice(0, 3).join(', ');
    const more  = (flag.taskNames?.length ?? 0) > 3 ? ` +${flag.taskNames!.length - 3}` : '';
    return `${flag.routineName} (${flag.scheduledTime} ±${flag.windowMinutes} min) niet voltooid: ${names}${more}.`;
  }
  return `${flag.routineName} (${flag.scheduledTime} ±${flag.windowMinutes} min) afgerond om ${flag.actualTime}.`;
}

function flagSummary(flag: HonestyFlag): string {
  switch (flag.type) {
    case 'burst':         return `${flag.taskNames.length} taken in ${flag.durationSeconds}s`;
    case 'off_hours':     return `"${flag.taskNames[0]}" om ${flag.time}`;
    case 'missed_window': return flag.routineName ?? 'Routine niet voltooid';
    case 'late_window':   return `${flag.routineName ?? 'Routine'} · ${flag.actualTime}`;
  }
}

// ── Filter tile bar ───────────────────────────────────────────────────────────

function FilterBar({
  flags, active, onSelect, c,
}: {
  flags: HonestyFlag[];
  active: ActiveFilter;
  onSelect: (f: ActiveFilter) => void;
  c: AppTheme['colors'];
}) {
  const counts = flags.reduce<Partial<Record<HonestyFlag['type'], number>>>((acc, f) => {
    acc[f.type] = (acc[f.type] ?? 0) + 1;
    return acc;
  }, {});

  const presentTypes = FLAG_TYPE_ORDER.filter(t => (counts[t] ?? 0) > 0);

  type Tile = { key: ActiveFilter; icon: React.ComponentProps<typeof Ionicons>['name']; label: string; color: string; count: number };

  const tiles: Tile[] = [
    { key: 'all', icon: 'list-outline', label: 'Alles', color: PRIMARY, count: flags.length },
    ...presentTypes.map(t => ({ key: t, icon: FLAG_META[t].icon, label: FLAG_META[t].badge, color: FLAG_META[t].color, count: counts[t]! })),
  ];

  return (
    <View style={[fb.bar, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
      {tiles.map((tile, i) => {
        const isActive = active === tile.key;
        return (
          <TouchableOpacity
            key={tile.key}
            style={[
              fb.tile,
              isActive
                ? { backgroundColor: tile.color }
                : { backgroundColor: 'transparent' },
              i < tiles.length - 1 && { borderRightWidth: 1, borderRightColor: c.glassCardBorder },
            ]}
            onPress={() => onSelect(tile.key)}
            activeOpacity={0.75}
          >
            {/* Count badge — top-right corner */}
            <View style={[fb.badge, { backgroundColor: isActive ? 'rgba(255,255,255,0.28)' : `${tile.color}22` }]}>
              <Text style={[fb.badgeText, { color: isActive ? '#fff' : tile.color }]}>{tile.count}</Text>
            </View>

            <Ionicons name={tile.icon} size={20} color={isActive ? '#fff' : tile.color} style={{ marginBottom: 5 }} />
            <Text style={[fb.label, { color: isActive ? 'rgba(255,255,255,0.9)' : c.textMuted }]}>{tile.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Compact flag row ──────────────────────────────────────────────────────────

function FlagRow({
  flag, onPress, c, isLast,
}: {
  flag: HonestyFlag;
  onPress: () => void;
  c: AppTheme['colors'];
  isLast: boolean;
}) {
  const meta = FLAG_META[flag.type];
  return (
    <>
      <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.rowIconBox, { backgroundColor: `${meta.color}18` }]}>
          <Ionicons name={meta.icon} size={15} color={meta.color} />
        </View>
        <View style={styles.rowBody}>
          <Text style={[styles.rowSummary, { color: c.textPrimary }]} numberOfLines={1}>
            {flagSummary(flag)}
          </Text>
          <View style={styles.rowMeta}>
            <View style={[styles.rowBadge, { backgroundColor: `${meta.color}18` }]}>
              <Text style={[styles.rowBadgeText, { color: meta.color }]}>{meta.badge}</Text>
            </View>
            <Text style={[styles.rowDate, { color: c.textMuted }]}>{formatFlagDate(flag.date)}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={14} color={c.textMuted} />
      </TouchableOpacity>
      {!isLast && <View style={[styles.rowDivider, { backgroundColor: c.glassCardBorder }]} />}
    </>
  );
}

// ── Detail bottom sheet ───────────────────────────────────────────────────────

function FlagDetailSheet({
  flag, c, onDismiss, onClose,
}: {
  flag: HonestyFlag | null;
  c: AppTheme['colors'];
  onDismiss: () => void;
  onClose: () => void;
}) {
  if (!flag) return null;
  const meta = FLAG_META[flag.type];

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={sheet.backdrop} onPress={onClose}>
        <MotiView
          from={{ translateY: 60, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 180 }}
          style={[sheet.panel, { backgroundColor: c.sheetBg }]}
        >
          <Pressable>
            <View style={sheet.handle} />

            <View style={sheet.topRow}>
              <View style={[sheet.typeBadge, { backgroundColor: `${meta.color}18`, borderColor: `${meta.color}35` }]}>
                <Ionicons name={meta.icon} size={13} color={meta.color} />
                <Text style={[sheet.typeBadgeText, { color: meta.color }]}>{meta.badge}</Text>
              </View>
              <Text style={[sheet.dateText, { color: c.textMuted }]}>{formatFlagDate(flag.date)}</Text>
            </View>

            <Text style={[sheet.title, { color: c.textPrimary }]}>{meta.title}</Text>

            <View style={[sheet.bodyBox, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
              <Text style={[sheet.bodyText, { color: c.textMuted }]}>{flagBody(flag)}</Text>
            </View>

            <TouchableOpacity
              style={[sheet.deleteBtn, { backgroundColor: c.glassCard, borderColor: 'rgba(252,107,107,0.35)' }]}
              onPress={onDismiss}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={15} color="#fc6b6b" />
              <Text style={sheet.deleteBtnText}>Verwijder melding</Text>
            </TouchableOpacity>
          </Pressable>
        </MotiView>
      </Pressable>
    </Modal>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function EerlijkheidScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useThemePreference();
  const c = isDark ? darkTheme.colors : lightTheme.colors;

  const { children, childrenLoading, refreshChildren, setFlagCount } = useParentChildren();
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [flags,         setFlags]         = useState<HonestyFlag[]>([]);
  const [flagsLoading,  setFlagsLoading]  = useState(false);
  const [active,        setActive]        = useState<ActiveFilter>('all');
  const [selectedFlag,  setSelectedFlag]  = useState<HonestyFlag | null>(null);
  const [refreshing,    setRefreshing]    = useState(false);

  const loadFlags = useCallback(async (childId: string) => {
    setFlagsLoading(true);
    try { setFlags(await getHonestyFlags(childId)); }
    catch { setFlags([]); }
    finally { setFlagsLoading(false); }
  }, []);

  useEffect(() => {
    if (!children.length) return;
    setActiveChildId(prev => prev && children.some(c => c.id === prev) ? prev : children[0].id);
  }, [children]);

  useFocusEffect(useCallback(() => { refreshChildren(); }, [refreshChildren]));
  useEffect(() => { if (activeChildId) loadFlags(activeChildId); }, [activeChildId, loadFlags]);

  // Auto-reset filter if the selected type disappears
  useEffect(() => {
    if (active !== 'all' && !flags.some(f => f.type === active)) setActive('all');
  }, [flags, active]);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.allSettled([refreshChildren(), activeChildId ? loadFlags(activeChildId) : Promise.resolve()]);
    setRefreshing(false);
  }

  async function handleDismiss(flag: HonestyFlag) {
    if (!activeChildId) return;
    const prev = flags;
    setSelectedFlag(null);
    setFlags(flags.filter(f => !(f.type === flag.type && f.date === flag.date && f.routineName === flag.routineName)));
    setFlagCount(n => Math.max(0, n - 1));
    try {
      await dismissHonestyFlag(activeChildId, flag.type, flag.date, flag.routineName);
    } catch {
      setFlags(prev);
      setFlagCount(n => n + 1);
      Alert.alert('Niet gelukt', 'De melding kon niet worden verwijderd. Probeer het opnieuw.');
    }
  }

  const activeChild    = children.find(ch => ch.id === activeChildId) ?? null;
  const filteredFlags  = (active === 'all' ? flags : flags.filter(f => f.type === active))
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Box flex={1} backgroundColor="background">
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <AnimatedBlob size={280} color={primaryAlpha(0.13)} duration={3500} opacityFrom={0.65} opacityTo={1}   scaleTarget={1.12} style={{ top: -50, right: -60 }} />
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
              <Text style={[styles.title, { color: c.textPrimary }]}>Meldingen</Text>
              <Text style={[styles.subtitle, { color: c.textMuted }]}>
                {activeChild ? `${activeChild.name} · activiteitsmeldingen` : 'Meldingen van je kinderen'}
              </Text>
            </View>
            <TouchableOpacity style={[styles.planBadge, { backgroundColor: primaryAlpha(0.06), borderColor: PRIMARY }]} activeOpacity={0.8}>
              <Text style={styles.planText}>Gratis plan</Text>
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* Info card — always visible just below the title */}
        <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 80 }}>
          <View style={[styles.infoCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            <View style={[styles.infoIconBox, { backgroundColor: primaryAlpha(0.08) }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color={PRIMARY} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoTitle, { color: c.textPrimary }]}>Meldingen zijn geen bewijs</Text>
              <Text style={[styles.infoBody, { color: c.textMuted }]}>
                Ze zijn een aanleiding voor een gesprek. Benadering met nieuwsgierigheid werkt beter dan straf.
              </Text>
            </View>
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
            {/* Child tabs */}
            {children.length > 1 && (
              <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 80 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContent}>
                  {children.map(child => {
                    const isActive = child.id === activeChildId;
                    return (
                      <TouchableOpacity
                        key={child.id}
                        style={[styles.tab, { backgroundColor: isActive ? PRIMARY : c.glassCard, borderColor: isActive ? PRIMARY : c.glassCardBorder }]}
                        onPress={() => setActiveChildId(child.id)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.tabDot, { backgroundColor: isActive ? 'rgba(255,255,255,0.55)' : primaryAlpha(0.3) }]} />
                        <Text style={[styles.tabText, { color: isActive ? '#fff' : c.textMuted }]}>{child.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </MotiView>
            )}

            {/* Filter bar — only shown when there are flags */}
            {!flagsLoading && flags.length > 0 && (
              <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 280, delay: 100 }}>
                <FilterBar flags={flags} active={active} onSelect={setActive} c={c} />
              </MotiView>
            )}

            {/* Flag list */}
            <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 140 }}>
              {flagsLoading ? (
                <ActivityIndicator color={PRIMARY} style={{ marginTop: 32 }} />
              ) : filteredFlags.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
                  <View style={[styles.emptyIconBox, { backgroundColor: '#48bb7812' }]}>
                    <Ionicons name="checkmark-circle-outline" size={26} color="#48bb78" />
                  </View>
                  <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>Geen meldingen</Text>
                  <Text style={[styles.emptyBody, { color: c.textMuted }]}>
                    {activeChild?.name ?? 'Je kind'} heeft de afgelopen 2 weken geen opvallend gedrag vertoond.
                  </Text>
                </View>
              ) : (
                <View style={[styles.listCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
                  {filteredFlags.map((flag, i) => (
                    <FlagRow
                      key={`${flag.type}_${flag.date}_${flag.routineName ?? flag.taskNames[0] ?? i}`}
                      flag={flag}
                      onPress={() => setSelectedFlag(flag)}
                      c={c}
                      isLast={i === filteredFlags.length - 1}
                    />
                  ))}
                </View>
              )}
            </MotiView>

          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      <FlagDetailSheet
        flag={selectedFlag}
        c={c}
        onDismiss={() => selectedFlag && handleDismiss(selectedFlag)}
        onClose={() => setSelectedFlag(null)}
      />
    </Box>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll:    { paddingHorizontal: 24, paddingTop: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  planBadge: { borderWidth: 1.5, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5, marginTop: 4 },
  planText:  { fontSize: 11, color: PRIMARY, fontWeight: '500' },
  title:     { fontSize: 28, fontWeight: '700' },
  subtitle:  { fontSize: 13, marginTop: 4 },

  tabScroll:  { marginHorizontal: -24, marginBottom: 16 },
  tabContent: { paddingHorizontal: 24, gap: 8 },
  tab:     { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5 },
  tabDot:  { width: 6, height: 6, borderRadius: 3 },
  tabText: { fontSize: 13, fontWeight: '600' },

  listCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 20 },

  row:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  rowIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowBody:    { flex: 1, gap: 4 },
  rowSummary: { fontSize: 13, fontWeight: '600' },
  rowMeta:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowBadge:   { borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 },
  rowBadgeText:{ fontSize: 10, fontWeight: '700' },
  rowDate:    { fontSize: 11 },
  rowDivider: { height: 1, marginHorizontal: 14 },

  infoCard:    { flexDirection: 'row', gap: 14, borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1, alignItems: 'flex-start' },
  infoIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  infoTitle:   { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  infoBody:    { fontSize: 12, lineHeight: 18 },
  emptyCard:    { borderRadius: 20, padding: 32, borderWidth: 1, alignItems: 'center', gap: 10, marginBottom: 24 },
  emptyIconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle:   { fontSize: 17, fontWeight: '700' },
  emptyBody:    { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});

// Filter bar
const fb = StyleSheet.create({
  bar:       { flexDirection: 'row', borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  tile:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 4, position: 'relative' },
  badge:     { position: 'absolute', top: 7, right: 7, borderRadius: 99, minWidth: 17, height: 17, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  label:     { fontSize: 10, fontWeight: '600', letterSpacing: 0.2 },
});

// Detail sheet
const sheet = StyleSheet.create({
  backdrop:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  panel:     { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  handle:    { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(128,128,128,0.3)', alignSelf: 'center', marginBottom: 20 },
  topRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  typeBadgeText: { fontSize: 12, fontWeight: '700' },
  dateText:  { fontSize: 12, fontWeight: '500' },
  title:     { fontSize: 20, fontWeight: '700', marginBottom: 14 },
  bodyBox:   { borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 14 },
  bodyText:  { fontSize: 14, lineHeight: 21 },
  deleteBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14, borderWidth: 1 },
  deleteBtnText: { fontSize: 14, fontWeight: '600', color: '#fc6b6b' },
});
