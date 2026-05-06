import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';

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
  const [activeChild, setActiveChild] = useState('emma');
  const [autoReport, setAutoReport] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const visibleAlerts = ALERTS.filter((a) => !dismissedAlerts.includes(a.id));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color={Colors.primary} />
          <Text style={styles.backText}>Terug</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Eerlijkheid</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Child selector */}
        <View style={styles.childSelector}>
          {CHILDREN.map((c) => (
            <TouchableOpacity key={c.id} style={[styles.childBtn, activeChild === c.id && styles.childBtnActive]} onPress={() => setActiveChild(c.id)} activeOpacity={0.8}>
              <Text style={styles.childAvatar}>{c.avatar}</Text>
              <Text style={[styles.childName, activeChild === c.id && styles.childNameActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Monster XP card */}
        <View style={styles.xpCard}>
          <View style={styles.xpCardHeader}>
            <Text style={styles.xpCardTitle}>Emma — Blub</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Niveau 4</Text>
            </View>
          </View>
          <View style={styles.xpRow}>
            <Text style={styles.xpLabel}>EXP voortgang</Text>
            <Text style={styles.xpValue}>340 / 500</Text>
          </View>
          <ProgressBar progress={340 / 500} color={Colors.status.success} height={7} />
          <Text style={styles.xpHint}>
            Vandaag verdiend: <Text style={styles.xpEarned}>+60 EXP</Text>
            {' · '}Nog 160 EXP tot niveau 5
          </Text>
        </View>

        {/* Honesty info */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-outline" size={20} color={Colors.primary} style={{ marginTop: 2 }} />
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>Eerlijkheid wordt beloond, niet perfectie. </Text>
            Wanneer je een mogelijke oneerlijkheid markeert, verliest het monster een kleine hoeveelheid EXP. Houd dit subtiel en bespreek het samen.
          </Text>
        </View>

        {/* Alerts */}
        <View style={styles.alertsHeader}>
          <Text style={styles.sectionTitle}>Meldingen</Text>
          {visibleAlerts.length > 0 && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>{visibleAlerts.length} nieuw</Text>
            </View>
          )}
        </View>

        {visibleAlerts.map((alert) => (
          <View key={alert.id} style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Ionicons name="warning" size={18} color={Colors.status.warning} />
              <Text style={styles.alertTitle}>{alert.title}</Text>
            </View>
            <Text style={styles.alertBody}>{alert.body}</Text>
            <Text style={styles.alertTime}>{alert.time}</Text>
            <View style={styles.alertButtons}>
              <TouchableOpacity style={styles.dismissBtn} onPress={() => setDismissedAlerts((d) => [...d, alert.id])} activeOpacity={0.8}>
                <Text style={styles.dismissBtnText}>Negeren</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.penaltyBtn} onPress={() => setDismissedAlerts((d) => [...d, alert.id])} activeOpacity={0.8}>
                <Text style={styles.penaltyBtnText}>–10 EXP toepassen</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {visibleAlerts.length === 0 && (
          <View style={styles.emptyAlerts}>
            <Ionicons name="checkmark-circle-outline" size={24} color={Colors.status.success} />
            <Text style={styles.emptyAlertsText}>Geen meldingen</Text>
          </View>
        )}

        {/* Consequence settings */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.md }]}>Gevolgeninstellingen</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>EXP verlies bij oneerlijkheid</Text>
            <View style={styles.xpLossBadge}>
              <Text style={styles.xpLossBadgeText}>–10 EXP</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Automatisch melden</Text>
            <Switch value={autoReport} onValueChange={setAutoReport} trackColor={{ false: Colors.border, true: Colors.primary }} thumbColor="#fff" ios_backgroundColor={Colors.card} />
          </View>
        </View>

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
  xpCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  xpCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpCardTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  levelBadge: { backgroundColor: Colors.card, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  levelBadgeText: { fontSize: FontSize.xs, color: Colors.text.primary, fontWeight: FontWeight.medium },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpLabel: { fontSize: FontSize.xs, color: Colors.text.muted },
  xpValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  xpHint: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 4 },
  xpEarned: { color: Colors.status.success, fontWeight: FontWeight.semibold },
  infoCard: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  infoText: { flex: 1, fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 20 },
  infoBold: { fontWeight: FontWeight.bold, color: Colors.text.primary },
  alertsHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  newBadge: { backgroundColor: Colors.status.error, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  newBadgeText: { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.semibold },
  alertCard: { backgroundColor: 'rgba(252,107,107,0.08)', borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: 'rgba(252,107,107,0.25)', gap: Spacing.sm },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text.primary, flex: 1 },
  alertBody: { fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 20 },
  alertTime: { fontSize: FontSize.xs, color: Colors.text.muted },
  alertButtons: { flexDirection: 'row', gap: Spacing.sm, marginTop: 4 },
  dismissBtn: { flex: 1, backgroundColor: Colors.card, borderRadius: Radius.md, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  dismissBtnText: { fontSize: FontSize.sm, color: Colors.text.secondary, fontWeight: FontWeight.medium },
  penaltyBtn: { flex: 1, backgroundColor: 'rgba(252,107,107,0.20)', borderRadius: Radius.md, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(252,107,107,0.40)' },
  penaltyBtnText: { fontSize: FontSize.sm, color: Colors.status.error, fontWeight: FontWeight.semibold },
  emptyAlerts: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  emptyAlertsText: { fontSize: FontSize.sm, color: Colors.text.muted },
  settingsCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md },
  settingLabel: { fontSize: FontSize.md, color: Colors.text.primary },
  divider: { height: 1, backgroundColor: Colors.border },
  xpLossBadge: { backgroundColor: 'rgba(252,107,107,0.15)', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  xpLossBadgeText: { fontSize: FontSize.sm, color: Colors.status.error, fontWeight: FontWeight.semibold },
});
