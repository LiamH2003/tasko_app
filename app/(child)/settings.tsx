import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function ToggleRow({ icon, label, description, value, onChange }: {
  icon: string; label: string; description: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIconBox}>
        <Text style={styles.settingIconEmoji}>{icon}</Text>
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.border, true: Colors.primary }}
        thumbColor="#fff"
        ios_backgroundColor={Colors.surface}
      />
    </View>
  );
}

function LinkRow({ icon, label, description, onPress }: {
  icon: string; label: string; description?: string; onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingIconBox}>
        <Text style={styles.settingIconEmoji}>{icon}</Text>
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description ? <Text style={styles.settingDescription}>{description}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.text.muted} />
    </TouchableOpacity>
  );
}

function SectionHeader({ label }: { label: string }) {
  return <Text style={styles.sectionHeader}>{label}</Text>;
}

export default function SettingsScreen() {
  const { child, clearChildId } = useAppStore();
  const name = child?.name ?? 'Emma';
  const monster = child?.monster ?? { name: 'Blub', level: 4 };

  const [darkTheme, setDarkTheme] = useState(true);
  const [soundFx, setSoundFx] = useState(true);
  const [monsterSound, setMonsterSound] = useState(true);
  const [reminders, setReminders] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Text style={styles.pageTitle}>Instellingen</Text>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>👧</Text>
            </View>
            <View style={styles.avatarEdit}>
              <Ionicons name="pencil" size={10} color={Colors.background} />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{name}</Text>
            <Text style={styles.profileSub}>9 jaar · Tasko-gebruiker</Text>
            <View style={styles.monsterBadge}>
              <Text style={styles.monsterBadgeText}>{monster.name} · Niveau {monster.level}</Text>
            </View>
          </View>
        </View>

        {/* Display */}
        <SectionHeader label="WEERGAVE" />
        <View style={styles.section}>
          <ToggleRow
            icon="☀️"
            label="Licht/donker thema"
            description="Automatisch op systeeminstelling"
            value={darkTheme}
            onChange={setDarkTheme}
          />
        </View>

        {/* Sound */}
        <SectionHeader label="GELUID" />
        <View style={styles.section}>
          <ToggleRow
            icon="✅"
            label="Geluidseffecten"
            description="Geluidje als je iets afvinkt"
            value={soundFx}
            onChange={setSoundFx}
          />
          <View style={styles.divider} />
          <ToggleRow
            icon="🐾"
            label="Monster reacties"
            description={`${monster.name} maakt geluid als hij blij is`}
            value={monsterSound}
            onChange={setMonsterSound}
          />
        </View>

        {/* Reminders */}
        <SectionHeader label="HERINNERINGEN" />
        <View style={styles.section}>
          <ToggleRow
            icon="⏰"
            label="Routine herinneringen"
            description="Word herinnerd aan je taken"
            value={reminders}
            onChange={setReminders}
          />
        </View>

        {/* Account */}
        <SectionHeader label="MIJN ACCOUNT" />
        <View style={styles.section}>
          <LinkRow icon="✏️" label="Naam wijzigen" description={name} />
          <View style={styles.divider} />
          <LinkRow icon="🐾" label="Avatar wijzigen" description="Kies een nieuw emoji" />
          <View style={styles.divider} />
          <LinkRow icon="🔑" label="Wachtwoord" />
        </View>

        {/* Device */}
        <SectionHeader label="APPARAAT" />
        <View style={styles.section}>
          <LinkRow
            icon="🚪"
            label="Verlaat kind-modus"
            description="Dit apparaat wordt ontkoppeld"
            onPress={async () => {
              await clearChildId();
            }}
          />
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },

  pageTitle: { fontSize: 28, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: Spacing.lg },

  // Profile
  profileCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primaryDeepest, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 30 },
  avatarEdit: { position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  profileSub: { fontSize: FontSize.sm, color: Colors.text.muted, marginTop: 2 },
  monsterBadge: { backgroundColor: Colors.card, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, marginTop: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: Colors.border },
  monsterBadgeText: { fontSize: FontSize.xs, color: Colors.text.primary, fontWeight: FontWeight.medium },

  // Section
  sectionHeader: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.primary, letterSpacing: 0.8, marginBottom: Spacing.sm },
  section: { backgroundColor: Colors.surface, borderRadius: Radius.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.md },

  // Setting row
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  settingIconBox: { width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  settingIconEmoji: { fontSize: 18 },
  settingText: { flex: 1 },
  settingLabel: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text.primary },
  settingDescription: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },
});
