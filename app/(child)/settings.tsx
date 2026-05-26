import { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { useAppStore } from '@/store/useAppStore';
import { PRIMARY, primaryAlpha } from '@/constants/palette';

function ToggleRow({ icon, label, description, value, onChange }: {
  icon: string; label: string; description: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIconBox}>
        <Text style={styles.settingEmoji}>{icon}</Text>
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: primaryAlpha(0.15), true: PRIMARY }}
        thumbColor="#fff"
        ios_backgroundColor="rgba(255,255,255,0.7)"
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
        <Text style={styles.settingEmoji}>{icon}</Text>
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description ? <Text style={styles.settingDescription}>{description}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color="#8a8885" />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { child, clearChildId } = useAppStore();
  const name = child?.name ?? 'Emma';
  const monster = child?.monster ?? { name: 'Blub', level: 4 };

  const [darkTheme, setDarkTheme] = useState(true);
  const [soundFx, setSoundFx] = useState(true);
  const [monsterSound, setMonsterSound] = useState(true);
  const [reminders, setReminders] = useState(true);

  return (
    <Box flex={1} backgroundColor="background">

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <AnimatedBlob
          size={260} color={primaryAlpha(0.13)}
          duration={3500} opacityFrom={0.65} opacityTo={1} scaleTarget={1.12}
          style={{ top: -50, right: -50 }}
        />
        <AnimatedBlob
          size={160} color={primaryAlpha(0.08)}
          duration={2700} delay={600} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07}
          style={{ bottom: 120, left: -50 }}
        />
      </View>

      <Box style={{ height: insets.top + 8 }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 60 }}
        >
          <Text style={styles.pageTitle}>Instellingen</Text>
        </MotiView>

        {/* Profile card */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 120 }}
        >
          <View style={styles.profileCard}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>👧</Text>
              </View>
              <View style={styles.avatarEdit}>
                <Ionicons name="pencil" size={10} color="#fff" />
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
        </MotiView>

        {/* Display */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 160 }}
        >
          <Text style={styles.sectionHeader}>WEERGAVE</Text>
          <View style={styles.section}>
            <ToggleRow
              icon="☀️" label="Licht/donker thema"
              description="Automatisch op systeeminstelling"
              value={darkTheme} onChange={setDarkTheme}
            />
          </View>
        </MotiView>

        {/* Sound */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 200 }}
        >
          <Text style={styles.sectionHeader}>GELUID</Text>
          <View style={styles.section}>
            <ToggleRow
              icon="✅" label="Geluidseffecten"
              description="Geluidje als je iets afvinkt"
              value={soundFx} onChange={setSoundFx}
            />
            <View style={styles.divider} />
            <ToggleRow
              icon="🐾" label="Monster reacties"
              description={`${monster.name} maakt geluid als hij blij is`}
              value={monsterSound} onChange={setMonsterSound}
            />
          </View>
        </MotiView>

        {/* Reminders */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 240 }}
        >
          <Text style={styles.sectionHeader}>HERINNERINGEN</Text>
          <View style={styles.section}>
            <ToggleRow
              icon="⏰" label="Routine herinneringen"
              description="Word herinnerd aan je taken"
              value={reminders} onChange={setReminders}
            />
          </View>
        </MotiView>

        {/* Account */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 280 }}
        >
          <Text style={styles.sectionHeader}>MIJN ACCOUNT</Text>
          <View style={styles.section}>
            <LinkRow icon="✏️" label="Naam wijzigen" description={name} />
            <View style={styles.divider} />
            <LinkRow icon="🐾" label="Avatar wijzigen" description="Kies een nieuw emoji" />
            <View style={styles.divider} />
            <LinkRow icon="🔑" label="Wachtwoord" />
          </View>
        </MotiView>

        {/* Device */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 320 }}
        >
          <Text style={styles.sectionHeader}>APPARAAT</Text>
          <View style={styles.section}>
            <LinkRow
              icon="🚪" label="Verlaat kind-modus"
              description="Dit apparaat wordt ontkoppeld"
              onPress={async () => { await clearChildId(); }}
            />
          </View>
        </MotiView>

        <View style={{ height: 24 }} />
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 8 },

  pageTitle: { fontSize: 28, fontWeight: '700', color: '#1a1918', marginBottom: 20 },

  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 20, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: primaryAlpha(0.15),
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 30 },
  avatarEdit: {
    position: 'absolute', bottom: 0, right: 0,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: '#1a1918' },
  profileSub: { fontSize: 13, color: '#8a8885', marginTop: 2 },
  monsterBadge: {
    backgroundColor: primaryAlpha(0.08), borderRadius: 99,
    paddingHorizontal: 10, paddingVertical: 4, marginTop: 6,
    alignSelf: 'flex-start',
    borderWidth: 1, borderColor: primaryAlpha(0.2),
  },
  monsterBadgeText: { fontSize: 11, color: PRIMARY, fontWeight: '500' },

  sectionHeader: { fontSize: 11, fontWeight: '600', color: PRIMARY, letterSpacing: 0.8, marginBottom: 8 },
  section: {
    backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 20, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: primaryAlpha(0.12), marginHorizontal: 18 },

  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  settingIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: primaryAlpha(0.08),
    alignItems: 'center', justifyContent: 'center',
  },
  settingEmoji: { fontSize: 18 },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 14, fontWeight: '500', color: '#1a1918' },
  settingDescription: { fontSize: 12, color: '#8a8885', marginTop: 2 },
});
