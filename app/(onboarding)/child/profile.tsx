import { useState } from 'react';
import {
  View, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { BackButton } from '@/components/ui/BackButton';
import { StepBar } from '@/components/ui/StepBar';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { updateChild } from '@/services/children';
import { PRIMARY, primaryAlpha } from '@/constants/palette';

const MIN_AGE = 6;
const MAX_AGE = 18;

export default function ChildProfileScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [age, setAge] = useState(9);
  const [loading, setLoading] = useState(false);

  const canContinue = name.trim().length >= 2;

  const handleContinue = async () => {
    setLoading(true);
    try {
      const childId = await SecureStore.getItemAsync('pendingChildId');
      if (childId) await updateChild(childId, { name: name.trim() });
    } catch {
      // non-fatal — name can be set later
    } finally {
      setLoading(false);
    }
    router.push('/(onboarding)/child/monster-select');
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

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Box style={{ height: insets.top + 16 }} />
        <BackButton />
        <Box style={{ height: 12 }} />
        <StepBar step={2} total={4} />
        <Text variant="label" style={{ paddingHorizontal: 24, marginBottom: 12 }}>STAP 2 VAN 4 — PROFIEL</Text>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 60 }}
            style={{ marginBottom: 28 }}
          >
            <Text variant="title" marginBottom="xs">Leuk je te ontmoeten!</Text>
            <Text variant="subtitle">Vertel ons iets over jezelf.</Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 360, delay: 140 }}
          >
            <View style={styles.formCard}>

              <Text variant="label" marginBottom="sm" style={{ color: '#6b6560' }}>JOUW NAAM</Text>
              <Box style={[styles.inputBox, { marginBottom: 20 }]}>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Jouw naam of bijnaam"
                  placeholderTextColor="#8a8885"
                  autoCapitalize="words"
                  maxLength={20}
                  autoCorrect={false}
                />
              </Box>

              <Text variant="label" marginBottom="sm" style={{ color: '#6b6560' }}>LEEFTIJD</Text>
              <Box flexDirection="row" alignItems="center" gap="md">
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setAge((a) => Math.max(MIN_AGE, a - 1))}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={20} color={PRIMARY} />
                </TouchableOpacity>
                <Box style={styles.stepValue}>
                  <Text style={styles.stepValueText}>{age}</Text>
                </Box>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setAge((a) => Math.min(MAX_AGE, a + 1))}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={20} color={PRIMARY} />
                </TouchableOpacity>
              </Box>

            </View>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>

      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 340, delay: 260 }}
        style={{ paddingHorizontal: 24, gap: 12, paddingBottom: Math.max(insets.bottom + 10, 24) }}
      >
        <TouchableOpacity
          style={[styles.btnPrimary, (!canContinue || loading) && styles.btnDisabled]}
          onPress={handleContinue}
          disabled={!canContinue || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#e8e5dd" />
            : <Text variant="btnPrimary">Zo heet ik!</Text>}
        </TouchableOpacity>
      </MotiView>

    </Box>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 24, paddingBottom: 16 },
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
  stepBtn: {
    width: 48, height: 48, borderRadius: 12,
    borderWidth: 1.5, borderColor: primaryAlpha(0.3),
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center', justifyContent: 'center',
  },
  stepValue: {
    width: 64, height: 48, borderRadius: 12,
    borderWidth: 1.5, borderColor: primaryAlpha(0.3),
    backgroundColor: primaryAlpha(0.06),
    alignItems: 'center', justifyContent: 'center',
  },
  stepValueText: { fontSize: 20, fontWeight: '700', color: '#1a1918' },
  btnPrimary: {
    height: 52, backgroundColor: PRIMARY, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, shadowOpacity: 0.35, elevation: 6,
  },
  btnDisabled: { opacity: 0.4 },
});
