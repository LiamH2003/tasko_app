import { useState, useEffect } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity, Switch,
  Modal, Pressable, TextInput, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { MonsterSvg } from '@/components/monster/MonsterSvg';
import { useAppStore } from '@/store/useAppStore';
import { useThemePreference } from '@/store/useThemePreference';
import {
  fetchChildProfile, updateChildName, updateMonsterName,
  uploadChildAvatar, updateChildAvatar,
} from '@/services/child-device';
import { PRIMARY, primaryAlpha } from '@/constants/palette';
import { lightTheme, darkTheme, type AppTheme } from '@/constants/restyleTheme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// ── Sheet modal ──────────────────────────────────────────────────────────────

function SheetModal({
  visible, onClose, children, sheetBg,
}: {
  visible: boolean; onClose: () => void;
  children: React.ReactNode; sheetBg: string;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={staticSheet.backdrop} onPress={onClose}>
        <MotiView
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 18, stiffness: 120 }}
          style={[staticSheet.panel, { backgroundColor: sheetBg }]}
        >
          <Pressable>
            <View style={staticSheet.handle} />
            {children}
          </Pressable>
        </MotiView>
      </Pressable>
    </Modal>
  );
}

// ── Row components ───────────────────────────────────────────────────────────

function ToggleRow({
  icon, label, description, value, onChange, c,
}: {
  icon: IoniconsName; label: string; description: string;
  value: boolean; onChange: (v: boolean) => void;
  c: AppTheme['colors'];
}) {
  return (
    <View style={row.container}>
      <View style={[row.icon, { backgroundColor: primaryAlpha(0.08), borderColor: primaryAlpha(0.15) }]}>
        <Ionicons name={icon} size={18} color={PRIMARY} />
      </View>
      <View style={row.text}>
        <Text style={[row.label, { color: c.textPrimary }]}>{label}</Text>
        <Text style={[row.sub, { color: c.textMuted }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: primaryAlpha(0.15), true: PRIMARY }}
        thumbColor="#fff"
        ios_backgroundColor="rgba(128,128,128,0.2)"
      />
    </View>
  );
}

function LinkRow({
  icon, label, description, value, onPress, danger, c,
}: {
  icon: IoniconsName; label: string; description?: string;
  value?: string; onPress?: () => void; danger?: boolean;
  c: AppTheme['colors'];
}) {
  return (
    <TouchableOpacity style={row.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[
        row.icon,
        danger
          ? { backgroundColor: 'rgba(229,62,62,0.08)', borderColor: 'rgba(229,62,62,0.2)' }
          : { backgroundColor: primaryAlpha(0.08), borderColor: primaryAlpha(0.15) },
      ]}>
        <Ionicons name={icon} size={18} color={danger ? '#e53e3e' : PRIMARY} />
      </View>
      <View style={row.text}>
        <Text style={[row.label, { color: danger ? '#e53e3e' : c.textPrimary }]}>{label}</Text>
        {description ? <Text style={[row.sub, { color: c.textMuted }]}>{description}</Text> : null}
      </View>
      {value
        ? <Text style={{ fontSize: 13, fontWeight: '600', color: PRIMARY }}>{value}</Text>
        : <Ionicons name="chevron-forward" size={16} color={danger ? '#e53e3e' : c.textMuted} />}
    </TouchableOpacity>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useThemePreference();
  const { childId, childName, setChildId, clearChildId } = useAppStore();
  const c = isDark ? darkTheme.colors : lightTheme.colors;
  const s = isDark ? darkScreenStyles : lightScreenStyles;
  const sh = isDark ? darkSheetStyles : lightSheetStyles;

  // Remote profile data
  const [monsterName, setMonsterName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  // Local prefs — loaded from SecureStore on mount
  const [soundFx, setSoundFx] = useState(true);
  const [monsterSound, setMonsterSound] = useState(true);

  // Modal visibility
  const [nameModal, setNameModal] = useState(false);
  const [monsterModal, setMonsterModal] = useState(false);

  // In-modal edit state
  const [editName, setEditName] = useState('');
  const [editMonsterName, setEditMonsterName] = useState('');

  // Save feedback
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState('');
  const [nameSaved, setNameSaved] = useState(false);
  const [monsterSaving, setMonsterSaving] = useState(false);
  const [monsterError, setMonsterError] = useState('');
  const [monsterSaved, setMonsterSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      SecureStore.getItemAsync('soundFx'),
      SecureStore.getItemAsync('monsterSound'),
    ]).then(([sfx, ms]) => {
      if (sfx !== null) setSoundFx(sfx === 'true');
      if (ms !== null) setMonsterSound(ms === 'true');
    });
  }, []);

  function handleSoundFx(v: boolean) {
    setSoundFx(v);
    SecureStore.setItemAsync('soundFx', String(v));
  }
  function handleMonsterSound(v: boolean) {
    setMonsterSound(v);
    SecureStore.setItemAsync('monsterSound', String(v));
  }

  useEffect(() => {
    if (!childId) return;
    fetchChildProfile(childId)
      .then(p => {
        if (p) {
          setMonsterName(p.monster_name);
          setAvatarUrl(p.avatar_url ?? null);
        }
      })
      .finally(() => setProfileLoading(false));
  }, [childId]);

  // ── Avatar ────────────────────────────────────────────────────────────────

  async function handlePickAvatar() {
    if (!childId) return;
    const perm = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    setAvatarUploading(true);
    setAvatarError('');
    try {
      const publicUrl = await uploadChildAvatar(childId, result.assets[0].uri);
      await updateChildAvatar(childId, publicUrl);
      setAvatarUrl(publicUrl + '?t=' + Date.now());
    } catch {
      setAvatarError('Foto uploaden mislukt. Probeer opnieuw.');
    } finally {
      setAvatarUploading(false);
    }
  }

  // ── Name modal ────────────────────────────────────────────────────────────

  function openNameModal() {
    setEditName(childName ?? '');
    setNameError('');
    setNameSaved(false);
    setNameModal(true);
  }

  async function saveName() {
    if (!childId || !editName.trim()) return;
    setNameSaving(true);
    setNameError('');
    try {
      await updateChildName(childId, editName.trim());
      await setChildId(childId, editName.trim());
      setNameSaved(true);
      setTimeout(() => setNameModal(false), 800);
    } catch {
      setNameError('Opslaan mislukt. Probeer opnieuw.');
    } finally {
      setNameSaving(false);
    }
  }

  // ── Monster name modal ────────────────────────────────────────────────────

  function openMonsterModal() {
    setEditMonsterName(monsterName);
    setMonsterError('');
    setMonsterSaved(false);
    setMonsterModal(true);
  }

  async function saveMonsterName() {
    if (!childId || !editMonsterName.trim()) return;
    setMonsterSaving(true);
    setMonsterError('');
    try {
      await updateMonsterName(childId, editMonsterName.trim());
      setMonsterName(editMonsterName.trim());
      setMonsterSaved(true);
      setTimeout(() => setMonsterModal(false), 800);
    } catch {
      setMonsterError('Opslaan mislukt. Probeer opnieuw.');
    } finally {
      setMonsterSaving(false);
    }
  }

  const displayName = childName ?? 'Jij';

  return (
    <Box flex={1} backgroundColor="background">

      {!isDark && (
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
      )}

      <Box style={{ height: insets.top + 8 }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 40 }}
          style={s.header}
        >
          <Text style={s.title}>Instellingen</Text>
          <Text style={s.subtitle}>Pas je profiel en voorkeuren aan.</Text>
        </MotiView>

        {/* Profile card */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 100 }}
        >
          <View style={s.profileCard}>
            <TouchableOpacity style={s.avatarWrapper} onPress={handlePickAvatar} activeOpacity={0.8}>
              {avatarUploading ? (
                <View style={s.avatar}>
                  <ActivityIndicator color={PRIMARY} />
                </View>
              ) : avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={s.avatar}
                  contentFit="cover"
                />
              ) : (
                <View style={s.avatar}>
                  <Ionicons name="person" size={28} color={PRIMARY} />
                </View>
              )}
              <View style={s.avatarBadge}>
                <Ionicons name={avatarUploading ? 'hourglass-outline' : 'camera'} size={9} color="#fff" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
              onPress={openNameModal}
              activeOpacity={0.85}
            >
              <View style={s.profileInfo}>
                <Text style={s.profileName}>{displayName}</Text>
                <Text style={s.profileSub}>Tasko-gebruiker</Text>
                {!profileLoading && !!monsterName && (
                  <View style={s.monsterBadge}>
                    <Ionicons name="paw-outline" size={11} color={PRIMARY} />
                    <Text style={s.monsterBadgeText}>{monsterName}</Text>
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
            </TouchableOpacity>
          </View>
          {!!avatarError && (
            <Text style={{ fontSize: 12, color: '#e53e3e', marginTop: 8, textAlign: 'center' }}>
              {avatarError}
            </Text>
          )}
        </MotiView>

        {/* PROFIEL */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 140 }}
        >
          <Text style={s.sectionHeader}>PROFIEL</Text>
          <View style={s.section}>
            <LinkRow
              icon="person-outline"
              label="Naam wijzigen"
              description={displayName}
              onPress={openNameModal}
              c={c}
            />
          </View>
        </MotiView>

        {/* MONSTER */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 160 }}
        >
          <Text style={s.sectionHeader}>MONSTER</Text>
          <View style={s.section}>
            <LinkRow
              icon="paw-outline"
              label="Monster naam"
              description={profileLoading ? 'Laden...' : (monsterName || '—')}
              onPress={openMonsterModal}
              c={c}
            />
          </View>
        </MotiView>

        {/* WEERGAVE */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 180 }}
        >
          <Text style={s.sectionHeader}>WEERGAVE</Text>
          <View style={s.section}>
            <ToggleRow
              icon="moon-outline"
              label="Donkere modus"
              description="Schakel tussen licht en donker"
              value={isDark} onChange={toggleTheme} c={c}
            />
          </View>
        </MotiView>

        {/* GELUID */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 200 }}
        >
          <Text style={s.sectionHeader}>GELUID</Text>
          <View style={s.section}>
            <ToggleRow
              icon="musical-notes-outline"
              label="Geluidseffecten"
              description="Geluidje als je iets afvinkt"
              value={soundFx} onChange={handleSoundFx} c={c}
            />
            <View style={s.divider} />
            <ToggleRow
              icon="paw-outline"
              label="Monster reacties"
              description={monsterName ? `${monsterName} maakt geluid als hij blij is` : 'Monster maakt geluid als hij blij is'}
              value={monsterSound} onChange={handleMonsterSound} c={c}
            />
          </View>
        </MotiView>

        {/* APPARAAT */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 220 }}
        >
          <Text style={s.sectionHeader}>APPARAAT</Text>
          <View style={s.section}>
            <LinkRow
              icon="log-out-outline"
              label="Verlaat kind-modus"
              description="Dit apparaat wordt ontkoppeld"
              onPress={async () => { await clearChildId(); }}
              danger c={c}
            />
          </View>
        </MotiView>

        <View style={{ height: Math.max(insets.bottom + 16, 24) }} />
      </ScrollView>

      {/* ── Name modal ── */}
      <SheetModal visible={nameModal} onClose={() => setNameModal(false)} sheetBg={c.sheetBg}>
        <Text style={sh.title}>Naam wijzigen</Text>
        <Text style={[sh.sub, { color: c.textMuted }]}>Zo herkennen andere Tasko-gebruikers jou.</Text>
        <View style={[sh.inputRow, { backgroundColor: c.glassInput, borderColor: primaryAlpha(0.2) }]}>
          <TextInput
            style={[sh.input, { color: c.textPrimary }]}
            value={editName}
            onChangeText={t => { setEditName(t); setNameSaved(false); }}
            placeholder="Jouw naam..."
            placeholderTextColor={c.placeholder}
            autoFocus autoCorrect={false} maxLength={32}
          />
        </View>
        {nameSaved && <Text style={sh.success}>Opgeslagen!</Text>}
        {!!nameError && <Text style={sh.error}>{nameError}</Text>}
        <TouchableOpacity
          style={[sh.btn, (!editName.trim() || editName.trim() === childName) && sh.btnDisabled]}
          onPress={saveName}
          disabled={!editName.trim() || editName.trim() === childName || nameSaving}
          activeOpacity={0.85}
        >
          {nameSaving ? <ActivityIndicator color="#fff" /> : <Text style={sh.btnText}>Opslaan</Text>}
        </TouchableOpacity>
      </SheetModal>

      {/* ── Monster name modal ── */}
      <SheetModal visible={monsterModal} onClose={() => setMonsterModal(false)} sheetBg={c.sheetBg}>
        <Text style={sh.title}>Monster naam</Text>
        <Text style={[sh.sub, { color: c.textMuted }]}>Geef jouw monster een naam die bij hem past.</Text>
        <View style={sh.monsterPreview}>
          <MonsterSvg size={80} />
          <Text style={[sh.monsterName, { color: c.textPrimary }]}>{editMonsterName || '...'}</Text>
        </View>
        <View style={[sh.inputRow, { backgroundColor: c.glassInput, borderColor: primaryAlpha(0.2) }]}>
          <TextInput
            style={[sh.input, { color: c.textPrimary }]}
            value={editMonsterName}
            onChangeText={t => { setEditMonsterName(t); setMonsterSaved(false); }}
            placeholder="Naam van je monster..."
            placeholderTextColor={c.placeholder}
            autoFocus autoCorrect={false} maxLength={24}
          />
        </View>
        {monsterSaved && <Text style={sh.success}>Opgeslagen!</Text>}
        {!!monsterError && <Text style={sh.error}>{monsterError}</Text>}
        <TouchableOpacity
          style={[sh.btn, (!editMonsterName.trim() || editMonsterName.trim() === monsterName) && sh.btnDisabled]}
          onPress={saveMonsterName}
          disabled={!editMonsterName.trim() || editMonsterName.trim() === monsterName || monsterSaving}
          activeOpacity={0.85}
        >
          {monsterSaving ? <ActivityIndicator color="#fff" /> : <Text style={sh.btnText}>Opslaan</Text>}
        </TouchableOpacity>
      </SheetModal>

    </Box>
  );
}

// ── Style factories (re-run when theme changes) ──────────────────────────────

function makeStyles(c: AppTheme['colors']) {
  return StyleSheet.create({
    scroll: { paddingHorizontal: 24, paddingTop: 8 },
    header: { marginBottom: 20 },
    title: { fontSize: 28, fontWeight: '700', color: c.textPrimary, marginBottom: 2 },
    subtitle: { fontSize: 13, color: c.textMuted },

    profileCard: {
      backgroundColor: c.glassCard, borderRadius: 20, padding: 18,
      flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24,
      borderWidth: 1, borderColor: c.glassCardBorder,
    },
    avatarWrapper: { position: 'relative' },
    avatar: {
      width: 60, height: 60, borderRadius: 30,
      backgroundColor: primaryAlpha(0.1),
      borderWidth: 1.5, borderColor: primaryAlpha(0.2),
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    },
    avatarBadge: {
      position: 'absolute', bottom: 0, right: 0,
      width: 20, height: 20, borderRadius: 10,
      backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
      borderWidth: 1.5, borderColor: c.sheetBg,
    },
    profileInfo: { flex: 1 },
    profileName: { fontSize: 18, fontWeight: '700', color: c.textPrimary },
    profileSub: { fontSize: 12, color: c.textMuted, marginTop: 2 },
    monsterBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      backgroundColor: primaryAlpha(0.08), borderRadius: 99,
      paddingHorizontal: 10, paddingVertical: 4, marginTop: 8, alignSelf: 'flex-start',
      borderWidth: 1, borderColor: primaryAlpha(0.18),
    },
    monsterBadgeText: { fontSize: 11, color: PRIMARY, fontWeight: '500' },

    sectionHeader: {
      fontSize: 11, fontWeight: '600', color: PRIMARY, letterSpacing: 0.8, marginBottom: 8,
    },
    section: {
      backgroundColor: c.glassCard, borderRadius: 20, marginBottom: 20,
      borderWidth: 1, borderColor: c.glassCardBorder, overflow: 'hidden',
    },
    divider: { height: 1, backgroundColor: c.divider, marginHorizontal: 16 },
  });
}

function makeSheetStyles(c: AppTheme['colors']) {
  return StyleSheet.create({
    title: { fontSize: 20, fontWeight: '700', color: c.textPrimary, textAlign: 'center', marginBottom: 4 },
    sub: { fontSize: 13, textAlign: 'center', marginBottom: 20 },
    inputRow: {
      borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
      borderWidth: 1.5, marginBottom: 16,
    },
    input: { fontSize: 16, padding: 0 },
    monsterPreview: { alignItems: 'center', gap: 6, marginBottom: 16 },
    monsterName: { fontSize: 16, fontWeight: '700' },
    success: { fontSize: 12, color: '#48bb78', fontWeight: '500', textAlign: 'center', marginBottom: 12 },
    error: { fontSize: 12, color: '#e53e3e', marginBottom: 8 },
    btn: {
      height: 52, backgroundColor: PRIMARY, borderRadius: 16,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
      shadowRadius: 12, shadowOpacity: 0.3, elevation: 6,
    },
    btnDisabled: { backgroundColor: '#c8c4bc', shadowOpacity: 0, elevation: 0 },
    btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  });
}

// Pre-built at module load time — one allocation per theme, not per render.
const lightScreenStyles = makeStyles(lightTheme.colors);
const darkScreenStyles  = makeStyles(darkTheme.colors);
const lightSheetStyles  = makeSheetStyles(lightTheme.colors);
const darkSheetStyles   = makeSheetStyles(darkTheme.colors);

// ── Static styles (don't depend on theme) ────────────────────────────────────

const row = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  icon: {
    width: 38, height: 38, borderRadius: 12,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  text: { flex: 1 },
  label: { fontSize: 14, fontWeight: '500' },
  sub: { fontSize: 12, marginTop: 2 },
});

const staticSheet = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  panel: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(128,128,128,0.25)', alignSelf: 'center', marginBottom: 20,
  },
});
