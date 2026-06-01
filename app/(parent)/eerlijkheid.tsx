import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
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
import type { ChildRow } from '@/lib/database.types';

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTHS_NL  = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
const DAYS_FULL  = ['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag'];

const FLAG_META: Record<HonestyFlag['type'], {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  title: string;
  badge: string;
}> = {
  burst:         { icon: 'flash-outline',    color: '#f6c644', title: 'Snelle afvinkactie',    badge: 'Snelheid' },
  off_hours:     { icon: 'moon-outline',     color: '#b57be6', title: 'Nachtelijke activiteit', badge: 'Tijdstip' },
  missed_window: { icon: 'close-circle-outline', color: '#fc6b6b', title: 'Routine gemist',    badge: 'Gemist'   },
  late_window:   { icon: 'time-outline',     color: '#f6c644', title: 'Routine te laat',       badge: 'Te laat'  },
};

const PROMPTS: Record<HonestyFlag['type'], (name: string) => string> = {
  burst: (name) =>
    `Kies een rustig moment en vraag aan ${name} hoe het ging. Luister zonder te oordelen — eerlijkheid groeit door vertrouwen, niet door straf.`,
  off_hours: (name) =>
    `Vraag nieuwsgierig aan ${name} waarom de taak 's nachts werd afgevinkt. Er kan een goede reden zijn.`,
  missed_window: (name) =>
    `Vraag nieuwsgierig aan ${name} waarom de routine niet gelukt is. Misschien was het een drukke dag — of is de tijd niet meer passend.`,
  late_window: (name) =>
    `Kies een rustig moment en vraag aan ${name} of de tijd van de routine nog klopt. Kleine aanpassingen kunnen het makkelijker maken.`,
};

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
  if (flag.type === 'off_hours') {
    return `Taak "${flag.taskNames[0]}" afgevinkt om ${flag.time} 's nachts.`;
  }
  if (flag.type === 'missed_window') {
    const names = (flag.taskNames ?? []).slice(0, 3).join(', ');
    const more  = (flag.taskNames?.length ?? 0) > 3 ? ` +${flag.taskNames!.length - 3}` : '';
    return `${flag.routineName} (${flag.scheduledTime} ±${flag.windowMinutes} min) niet voltooid: ${names}${more}.`;
  }
  // late_window
  return `${flag.routineName} (${flag.scheduledTime} ±${flag.windowMinutes} min) afgerond om ${flag.actualTime}.`;
}

// ── FlagCard ──────────────────────────────────────────────────────────────────

function FlagCard({
  flag, childName, c, onDismiss,
}: {
  flag: HonestyFlag;
  childName: string;
  c: AppTheme['colors'];
  onDismiss: () => void;
}) {
  const [discussing, setDiscussing] = useState(false);
  const meta = FLAG_META[flag.type];

  return (
    <View style={[fc.card, { backgroundColor: c.glassCard, borderColor: `${meta.color}45` }]}>

      {/* Header row */}
      <View style={fc.header}>
        <View style={[fc.iconBox, { backgroundColor: `${meta.color}18` }]}>
          <Ionicons name={meta.icon} size={16} color={meta.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[fc.title, { color: c.textPrimary }]}>{meta.title}</Text>
          <Text style={[fc.dateLabel, { color: c.textMuted }]}>{formatFlagDate(flag.date)}</Text>
        </View>
        <View style={[fc.badge, { backgroundColor: `${meta.color}15`, borderColor: `${meta.color}35` }]}>
          <Text style={[fc.badgeText, { color: meta.color }]}>{meta.badge}</Text>
        </View>
      </View>

      {/* Body */}
      <Text style={[fc.body, { color: c.textMuted }]}>{flagBody(flag)}</Text>

      {/* Conversation prompt — shown after tapping Bespreek dit */}
      {discussing && (
        <MotiView
          from={{ opacity: 0, translateY: -6 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 200 }}
        >
          <View style={[fc.promptBox, { backgroundColor: primaryAlpha(0.06), borderColor: primaryAlpha(0.15) }]}>
            <Ionicons name="chatbubble-outline" size={13} color={PRIMARY} style={{ marginTop: 1, flexShrink: 0 }} />
            <Text style={[fc.promptText, { color: c.textPrimary }]}>
              {PROMPTS[flag.type](childName)}
            </Text>
          </View>
        </MotiView>
      )}

      {/* Actions */}
      <View style={fc.actions}>
        {!discussing ? (
          <>
            <TouchableOpacity
              style={[fc.dismissBtn, { backgroundColor: c.glassInput, borderColor: c.glassCardBorder }]}
              onPress={onDismiss}
              activeOpacity={0.8}
            >
              <Text style={[fc.dismissText, { color: c.textMuted }]}>Negeren</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[fc.discussBtn, { backgroundColor: PRIMARY }]}
              onPress={() => setDiscussing(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={14} color="#fff" />
              <Text style={fc.discussText}>Bespreek dit</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[fc.fullDismissBtn, { backgroundColor: PRIMARY }]}
            onPress={onDismiss}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark" size={15} color="#fff" />
            <Text style={fc.discussText}>Begrepen, verwijder melding</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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

  // ── Data ──────────────────────────────────────────────────────────────────

  const loadFlags = useCallback(async (childId: string) => {
    setFlagsLoading(true);
    try {
      const result = await getHonestyFlags(childId);
      setFlags(result);
      // Don't overwrite flagCount here — it holds the family total seeded by ChildrenProvider
    } catch {
      setFlags([]);
    } finally {
      setFlagsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!children.length) return;
    setActiveChildId(prev =>
      prev && children.some(ch => ch.id === prev) ? prev : children[0].id
    );
  }, [children]);

  useFocusEffect(useCallback(() => { refreshChildren(); }, [refreshChildren]));

  useEffect(() => {
    if (activeChildId) loadFlags(activeChildId);
  }, [activeChildId, loadFlags]);

  // ── Dismiss ───────────────────────────────────────────────────────────────

  async function handleDismiss(flag: HonestyFlag) {
    if (!activeChildId) return;
    const next = flags.filter(f => !(f.type === flag.type && f.date === flag.date));
    setFlags(next);
    setFlagCount(prev => Math.max(0, prev - 1));
    try {
      await dismissHonestyFlag(activeChildId, flag.type, flag.date);
    } catch {
      // optimistic — reappears on next load if it fails
    }
  }

  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.allSettled([
      refreshChildren(),
      activeChildId ? loadFlags(activeChildId) : Promise.resolve(),
    ]);
    setRefreshing(false);
  }

  const activeChild = children.find(ch => ch.id === activeChildId) ?? null;

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
              <Text style={[styles.title, { color: c.textPrimary }]}>Eerlijkheid</Text>
              <Text style={[styles.subtitle, { color: c.textMuted }]}>
                {activeChild ? `${activeChild.name} · gedragsignalen` : 'Inzicht in eerlijk gedrag'}
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

            {/* Flags section */}
            <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 100 }}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionHeader}>MELDINGEN</Text>
                {flags.length > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{flags.length}</Text>
                  </View>
                )}
              </View>

              {flagsLoading ? (
                <ActivityIndicator color={PRIMARY} style={{ marginTop: 24 }} />
              ) : flags.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
                  <View style={[styles.emptyIconBox, { backgroundColor: '#48bb7812' }]}>
                    <Ionicons name="checkmark-circle-outline" size={26} color="#48bb78" />
                  </View>
                  <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>Geen meldingen</Text>
                  <Text style={[styles.emptyBody, { color: c.textMuted }]}>
                    {activeChild?.name ?? 'Je kind'} heeft de afgelopen 2 weken geen verdacht gedrag vertoond.
                  </Text>
                </View>
              ) : (
                <View style={styles.flagsList}>
                  {flags.map((flag, i) => (
                    <FlagCard
                      key={`${flag.type}_${flag.date}_${flag.routineName ?? flag.taskNames[0] ?? i}`}
                      flag={flag}
                      childName={activeChild?.name ?? 'je kind'}
                      c={c}
                      onDismiss={() => handleDismiss(flag)}
                    />
                  ))}
                </View>
              )}
            </MotiView>

            {/* Philosophy card */}
            <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 160 }}>
              <View style={[styles.infoCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
                <View style={[styles.infoIconBox, { backgroundColor: primaryAlpha(0.08) }]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={PRIMARY} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.infoTitle, { color: c.textPrimary }]}>Eerlijkheid wordt beloond</Text>
                  <Text style={[styles.infoBody, { color: c.textMuted }]}>
                    Meldingen zijn geen bewijs van liegen — ze zijn een aanleiding voor een gesprek. Benadering met nieuwsgierigheid werkt beter dan straf.
                  </Text>
                </View>
              </View>
            </MotiView>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
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

  sectionRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionHeader:    { fontSize: 11, fontWeight: '600', color: PRIMARY, letterSpacing: 0.8 },
  countBadge:       { backgroundColor: '#fc6b6b', borderRadius: 99, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  countBadgeText:   { fontSize: 11, color: '#fff', fontWeight: '700' },

  flagsList: { gap: 12, marginBottom: 24 },

  infoCard:    { flexDirection: 'row', gap: 14, borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1, alignItems: 'flex-start' },
  infoIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  infoTitle:   { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  infoBody:    { fontSize: 12, lineHeight: 18 },

  emptyCard:    { borderRadius: 20, padding: 32, borderWidth: 1, alignItems: 'center', gap: 10, marginBottom: 24 },
  emptyIconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle:   { fontSize: 17, fontWeight: '700' },
  emptyBody:    { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});

// Flag card
const fc = StyleSheet.create({
  card:      { borderRadius: 20, borderWidth: 1, padding: 16, gap: 10 },
  header:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox:   { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title:     { fontSize: 14, fontWeight: '700' },
  dateLabel: { fontSize: 11, marginTop: 2 },
  badge:     { borderRadius: 99, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  body:      { fontSize: 13, lineHeight: 19 },

  promptBox:  { flexDirection: 'row', gap: 8, borderRadius: 12, padding: 12, borderWidth: 1, alignItems: 'flex-start' },
  promptText: { flex: 1, fontSize: 13, lineHeight: 19 },

  actions:       { flexDirection: 'row', gap: 8, marginTop: 2 },
  dismissBtn:    { flex: 1, borderRadius: 12, paddingVertical: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  dismissText:   { fontSize: 13, fontWeight: '500' },
  discussBtn:    { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 11 },
  discussText:   { fontSize: 13, color: '#fff', fontWeight: '600' },
  fullDismissBtn:{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 11 },
});
