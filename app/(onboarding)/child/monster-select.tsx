import { useState, useEffect } from 'react';
import {
  View, TextInput, TouchableOpacity, StyleSheet, ScrollView, Keyboard, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { BackButton } from '@/components/ui/BackButton';
import { StepBar } from '@/components/ui/StepBar';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { updateChildProfile } from '@/services/children';
import { PRIMARY, primaryAlpha } from '@/constants/palette';

type MonsterDef = {
  id: string;
  name: string;
  description: string;
  trait: string;
  traitIcon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const MONSTERS: MonsterDef[] = [
  { id: 'blub',  name: 'Blub',  description: 'Zacht en rustig — altijd er voor jou',        trait: 'Kalm',     traitIcon: 'heart-outline',  color: '#49c9d5' },
  { id: 'flams', name: 'Flams', description: 'Energiek en vol vuur — super enthousiast!',    trait: 'Energiek', traitIcon: 'flame-outline',  color: '#e8743c' },
  { id: 'mossy', name: 'Mossy', description: 'Van de natuur — rustig en betrouwbaar',        trait: 'Rustig',   traitIcon: 'leaf-outline',   color: '#4a9e5c' },
  { id: 'sunni', name: 'Sunni', description: 'Vrolijk en stralend — brengt zon in je dag!', trait: 'Vrolijk',  traitIcon: 'sunny-outline',  color: '#f6c644' },
];

export default function MonsterSelectScreen() {
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const canContinue = selectedId !== null;

  const handleContinue = async () => {
    setLoading(true);
    try {
      const childId = await SecureStore.getItemAsync('pendingChildId');
      if (childId) {
        const monsterName = nickname.trim() || (MONSTERS.find(m => m.id === selectedId)?.name ?? 'Monster');
        await updateChildProfile(childId, { monster_name: monsterName });
      }
    } catch {
      // non-fatal — monster name can be updated later in settings
    } finally {
      setLoading(false);
    }
    router.push('/(onboarding)/child/set-pin');
  };

  return (
    <Box flex={1} backgroundColor="background">

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <AnimatedBlob
          size={300} color={primaryAlpha(0.13)}
          duration={3500} opacityFrom={0.65} opacityTo={1} scaleTarget={1.12}
          style={{ top: -60, left: -70 }}
        />
        <AnimatedBlob
          size={160} color={primaryAlpha(0.08)}
          duration={2700} delay={600} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07}
          style={{ bottom: 100, right: -50 }}
        />
      </View>

      <Box style={{ height: insets.top + 16 }} />
      <BackButton />
      <Box style={{ height: 12 }} />
      <StepBar step={3} total={5} />
      <Text variant="label" style={{ paddingHorizontal: 24, marginBottom: 12 }}>STAP 3 VAN 5 — TASKO</Text>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 60 }}
          style={{ marginBottom: 24 }}
        >
          <Text variant="title" marginBottom="xs">Kies jouw Tasko!</Text>
          <Text variant="subtitle">Dit is jouw Tasko. Hij groeit mee met jou!</Text>
        </MotiView>

        {/* Monster grid */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 360, delay: 120 }}
          style={{ marginBottom: 24 }}
        >
          <View style={styles.grid}>
            {MONSTERS.map((m, idx) => {
              const selected = selectedId === m.id;
              return (
                <MotiView
                  key={m.id}
                  animate={{
                    borderColor: selected ? PRIMARY : 'rgba(255,255,255,0.9)',
                    backgroundColor: selected ? primaryAlpha(0.06) : 'rgba(255,255,255,0.82)',
                  }}
                  transition={{ type: 'timing', duration: 150 }}
                  style={styles.monsterCard}
                >
                  <TouchableOpacity
                    onPress={() => setSelectedId(m.id)}
                    activeOpacity={0.8}
                    style={{ alignItems: 'center' }}
                  >
                    {selected && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark-circle" size={22} color={PRIMARY} />
                      </View>
                    )}
                    <View style={[styles.monsterAvatar, { backgroundColor: m.color + '33' }]}>
                      <Image
                        source={require('@/assets/images/mascot.svg')}
                        style={styles.monsterImage}
                        contentFit="contain"
                      />
                    </View>
                    <Text style={[styles.monsterName, selected && { color: PRIMARY }]}>{m.name}</Text>
                    <Text style={styles.monsterDesc}>{m.description}</Text>
                    <View style={[styles.traitChip, { backgroundColor: m.color + '22' }]}>
                      <Ionicons name={m.traitIcon} size={12} color={m.color} />
                      <Text style={[styles.traitText, { color: m.color }]}>{m.trait}</Text>
                    </View>
                  </TouchableOpacity>
                </MotiView>
              );
            })}
          </View>
        </MotiView>

        {/* Nickname card */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 200 }}
          style={{ marginBottom: 8 }}
        >
          <View style={styles.formCard}>
            <Text variant="label" marginBottom="sm" style={{ color: '#6b6560' }}>GEEF JE TASKO EEN NAAM</Text>
            <Box style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
                placeholder="Geef jouw Tasko een bijnaam"
                placeholderTextColor="#8a8885"
                maxLength={20}
                autoCorrect={false}
              />
            </Box>
          </View>
        </MotiView>

        <Text variant="cardSub" style={{ textAlign: 'center', marginBottom: 8 }}>
          Je kan dit later altijd veranderen in instellingen
        </Text>

      </ScrollView>

      {!keyboardVisible && (
        <View style={{ paddingHorizontal: 24, gap: 12, paddingBottom: Math.max(insets.bottom + 10, 24) }}>
          <TouchableOpacity
            style={[styles.btnPrimary, { opacity: canContinue && !loading ? 1 : 0.4 }]}
            onPress={handleContinue}
            disabled={!canContinue || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#e8e5dd" />
              : <Text variant="btnPrimary">Kies deze Tasko</Text>}
          </TouchableOpacity>
        </View>
      )}

    </Box>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 24, paddingBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  monsterCard: {
    width: '47%', borderRadius: 20,
    borderWidth: 1.5, padding: 14,
    position: 'relative',
  },
  checkBadge: { position: 'absolute', top: 0, right: 0 },
  monsterAvatar: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  monsterImage: { width: 56, height: 56 },
  monsterName: {
    fontSize: 15, fontWeight: '600', color: '#4a4845',
    marginBottom: 4, textAlign: 'center',
  },
  monsterDesc: {
    fontSize: 11, color: '#8a8885', textAlign: 'center',
    lineHeight: 16, marginBottom: 8,
  },
  traitChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
  },
  traitText: { fontSize: 11, fontWeight: '500' },
  formCard: {
    borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  inputBox: {
    height: 50, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12, borderWidth: 1.5, borderColor: primaryAlpha(0.3),
    paddingHorizontal: 14,
  },
  input: { flex: 1, fontSize: 15, color: '#1a1918', padding: 0 },
  btnPrimary: {
    height: 52, backgroundColor: PRIMARY, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, shadowOpacity: 0.35, elevation: 6,
  },
});
