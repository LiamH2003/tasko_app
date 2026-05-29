import { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useThemePreference } from '@/store/useThemePreference';
import { PRIMARY, primaryAlpha } from '@/constants/palette';
import { lightTheme, darkTheme } from '@/constants/restyleTheme';

const CHILDREN = [
  { id: 'emma', name: 'Emma', avatar: '👧' },
  { id: 'luca', name: 'Luca', avatar: '👦' },
];

const ALERTS = [
  {
    id: 'a1',
    title: 'Snelle afvinkt — "Tanden poetsen"',
    body: 'Emma vinkte deze taak af in slechts 3 seconden. De normale duur is 5 minuten. Mogelijk is het overgeslagen.',
    time: 'Vandaag om 07:17',
  },
];

export default function EerlijkheidScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useThemePreference();
  const c = isDark ? darkTheme.colors : lightTheme.colors;
  const [activeChild, setActiveChild] = useState('emma');
  const [autoReport, setAutoReport] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const visibleAlerts = ALERTS.filter((a) => !dismissedAlerts.includes(a.id));

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
          <Text style={[styles.title, { color: c.textPrimary }]}>Eerlijkheid</Text>
          <Text style={[styles.subtitle, { color: c.textMuted }]}>Inzicht in eerlijk gedrag</Text>
        </MotiView>

        {/* Child selector */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 120 }}
        >
          <View style={[styles.segmentRow, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            {CHILDREN.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={[styles.segmentBtn, activeChild === child.id && styles.segmentBtnActive]}
                onPress={() => setActiveChild(child.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentText, { color: c.textMuted }, activeChild === child.id && styles.segmentTextActive]}>
                  {child.avatar} {child.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </MotiView>

        {/* XP card */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 160 }}
        >
          <View style={[styles.xpCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            <View style={styles.xpCardHeader}>
              <Text style={[styles.xpCardTitle, { color: c.textPrimary }]}>Emma — Blub</Text>
              <View style={[styles.levelBadge, { backgroundColor: primaryAlpha(0.08), borderColor: primaryAlpha(0.2) }]}>
                <Ionicons name="trophy-outline" size={11} color={PRIMARY} />
                <Text style={styles.levelBadgeText}>Niveau 4</Text>
              </View>
            </View>
            <View style={styles.xpRow}>
              <Text style={[styles.xpLabel, { color: c.textMuted }]}>EXP voortgang</Text>
              <Text style={styles.xpValue}>340 / 500</Text>
            </View>
            <ProgressBar progress={340 / 500} color="#48bb78" height={7} />
            <Text style={[styles.xpHint, { color: c.textMuted }]}>
              Vandaag verdiend: <Text style={styles.xpEarned}>+60 EXP</Text>
              {' · '}Nog 160 EXP tot niveau 5
            </Text>
          </View>
        </MotiView>

        {/* Info card */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 200 }}
        >
          <View style={[styles.infoCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            <View style={styles.infoIconBox}>
              <Ionicons name="shield-outline" size={18} color={PRIMARY} />
            </View>
            <Text style={[styles.infoText, { color: c.textMuted }]}>
              <Text style={[styles.infoBold, { color: c.textPrimary }]}>Eerlijkheid wordt beloond, niet perfectie. </Text>
              Wanneer je een mogelijke oneerlijkheid markeert, verliest het monster een kleine hoeveelheid EXP. Houd dit subtiel en bespreek het samen.
            </Text>
          </View>
        </MotiView>

        {/* Alerts */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 240 }}
        >
          <View style={styles.alertsHeaderRow}>
            <Text style={styles.sectionHeader}>MELDINGEN</Text>
            {visibleAlerts.length > 0 && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>{visibleAlerts.length} nieuw</Text>
              </View>
            )}
          </View>

          {visibleAlerts.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <Ionicons name="warning" size={18} color="#f6c644" />
                <Text style={[styles.alertTitle, { color: c.textPrimary }]}>{alert.title}</Text>
              </View>
              <Text style={[styles.alertBody, { color: c.textMuted }]}>{alert.body}</Text>
              <Text style={[styles.alertTime, { color: c.textMuted }]}>{alert.time}</Text>
              <View style={styles.alertButtons}>
                <TouchableOpacity
                  style={[styles.dismissBtn, { backgroundColor: c.glassInput, borderColor: c.glassCardBorder }]}
                  onPress={() => setDismissedAlerts((d) => [...d, alert.id])}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dismissBtnText, { color: c.textMuted }]}>Negeren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.penaltyBtn}
                  onPress={() => setDismissedAlerts((d) => [...d, alert.id])}
                  activeOpacity={0.8}
                >
                  <Text style={styles.penaltyBtnText}>–10 EXP toepassen</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {visibleAlerts.length === 0 && (
            <View style={[styles.emptyAlerts, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
              <Ionicons name="checkmark-circle-outline" size={22} color="#48bb78" />
              <Text style={[styles.emptyAlertsText, { color: c.textMuted }]}>Geen meldingen</Text>
            </View>
          )}
        </MotiView>

        {/* Consequence settings */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 280 }}
        >
          <Text style={[styles.sectionHeader, { marginTop: 8 }]}>GEVOLGENINSTELLINGEN</Text>
          <View style={[styles.settingsCard, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: c.textPrimary }]}>EXP verlies bij oneerlijkheid</Text>
              <View style={styles.xpLossBadge}>
                <Text style={styles.xpLossBadgeText}>–10 EXP</Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: c.glassCardBorder }]} />
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: c.textPrimary }]}>Automatisch melden</Text>
              <Switch
                value={autoReport}
                onValueChange={setAutoReport}
                trackColor={{ false: primaryAlpha(0.15), true: PRIMARY }}
                thumbColor="#fff"
                ios_backgroundColor="rgba(128,128,128,0.2)"
              />
            </View>
          </View>
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

  xpCard: { borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, gap: 10 },
  xpCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpCardTitle: { fontSize: 16, fontWeight: '700' },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  levelBadgeText: { fontSize: 11, color: PRIMARY, fontWeight: '500' },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpLabel: { fontSize: 11 },
  xpValue: { fontSize: 16, fontWeight: '700', color: PRIMARY },
  xpHint: { fontSize: 11, marginTop: 4 },
  xpEarned: { color: '#48bb78', fontWeight: '600' },

  infoCard: { flexDirection: 'row', gap: 12, borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1, alignItems: 'flex-start' },
  infoIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: primaryAlpha(0.08), alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
  infoBold: { fontWeight: '700' },

  alertsHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionHeader: { fontSize: 11, fontWeight: '600', color: PRIMARY, letterSpacing: 0.8 },
  newBadge: { backgroundColor: '#fc6b6b', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  newBadgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },

  alertCard: {
    backgroundColor: 'rgba(252,107,107,0.08)', borderRadius: 20, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: 'rgba(252,107,107,0.25)', gap: 10,
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertTitle: { fontSize: 13, fontWeight: '700', flex: 1 },
  alertBody: { fontSize: 13, lineHeight: 20 },
  alertTime: { fontSize: 11 },
  alertButtons: { flexDirection: 'row', gap: 10, marginTop: 4 },
  dismissBtn: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1 },
  dismissBtnText: { fontSize: 13, fontWeight: '500' },
  penaltyBtn: { flex: 1, backgroundColor: 'rgba(252,107,107,0.20)', borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(252,107,107,0.40)' },
  penaltyBtnText: { fontSize: 13, color: '#fc6b6b', fontWeight: '600' },

  emptyAlerts: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  emptyAlertsText: { fontSize: 13 },

  settingsCard: { borderRadius: 20, marginBottom: 24, borderWidth: 1, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  settingLabel: { fontSize: 14 },
  divider: { height: 1 },
  xpLossBadge: { backgroundColor: 'rgba(252,107,107,0.15)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  xpLossBadgeText: { fontSize: 13, color: '#fc6b6b', fontWeight: '600' },
});
