import { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { BackButton } from '@/components/ui/BackButton';
import { StepBar } from '@/components/ui/StepBar';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { PinInput } from '@/components/ui/PinInput';
import { saveChildPin } from '@/services/children';
import { useAppStore } from '@/store/useAppStore';
import { PRIMARY, primaryAlpha } from '@/constants/palette';

export default function SetPinScreen() {
  const insets = useSafeAreaInsets();
  // childId param present when coming from re-login flow (no PIN set yet)
  const { childId: paramChildId } = useLocalSearchParams<{ childId?: string }>();
  const { setChildId } = useAppStore();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'set' | 'confirm'>('set');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const handleNext = () => {
    if (pin.length === 4) {
      setStep('confirm');
      setConfirmPin('');
    }
  };

  const handleConfirm = async () => {
    if (confirmPin !== pin) {
      setError('De pincodes komen niet overeen. Probeer opnieuw.');
      setConfirmPin('');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const childId = paramChildId ?? await SecureStore.getItemAsync('pendingChildId');
      if (childId) await saveChildPin(childId, pin);

      if (paramChildId) {
        const pendingName = await SecureStore.getItemAsync('pendingChildName');
        await setChildId(paramChildId, pendingName ?? undefined);
        await SecureStore.deleteItemAsync('pendingChildId');
        await SecureStore.deleteItemAsync('pendingChildName');
        router.replace('/(child)');
      } else {
        router.push('/(onboarding)/child/welcome');
      }
    } catch (e: any) {
      setError(e.message ?? 'Pincode opslaan mislukt. Probeer opnieuw.');
    } finally {
      setLoading(false);
    }
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
        {!paramChildId && (
          <>
            <StepBar step={4} total={5} />
            <Text variant="label" style={{ paddingHorizontal: 24, marginBottom: 12 }}>STAP 4 VAN 5 — PINCODE</Text>
          </>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <MotiView
          key={step}
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300, delay: 60 }}
          style={{ marginTop: 24, marginBottom: 28 }}
        >
          <Text variant="title" marginBottom="xs">
            {step === 'set' ? 'Kies jouw pincode' : 'Herhaal jouw pincode'}
          </Text>
          <Text variant="subtitle">
            {step === 'set'
              ? 'Kies een 4-cijferige pincode. Hiermee log je later in op je account.'
              : 'Vul dezelfde pincode nog een keer in om te bevestigen.'}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 360, delay: 140 }}
        >
          <View style={styles.formCard}>
            <Text variant="label" marginBottom="md" style={{ color: '#6b6560' }}>
              {step === 'set' ? 'JOUW PINCODE' : 'PINCODE HERHALEN'}
            </Text>
            {step === 'set'
              ? <PinInput key="set" value={pin} onChange={setPin} autoFocus onBlur={() => setTouched(true)} />
              : <PinInput key="confirm" value={confirmPin} onChange={setConfirmPin} autoFocus onBlur={() => setTouched(true)} />}
          </View>
        </MotiView>

          {error ? (
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 12 }}>
              <Text variant="errorText" style={{ textAlign: 'center' }}>{error}</Text>
            </MotiView>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 340, delay: 260 }}
        style={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom + 10, 24) }}
      >
        {step === 'set' ? (
          <TouchableOpacity
            style={[styles.btnPrimary, { opacity: pin.length === 4 ? 1 : 0.4 }]}
            onPress={handleNext}
            disabled={pin.length < 4}
            activeOpacity={0.85}
          >
            <Text variant="btnPrimary">Volgende</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btnPrimary, { opacity: confirmPin.length === 4 && !loading ? 1 : 0.4 }]}
            onPress={handleConfirm}
            disabled={confirmPin.length < 4 || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#e8e5dd" />
              : <Text variant="btnPrimary">Pincode instellen</Text>}
          </TouchableOpacity>
        )}
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
  btnPrimary: {
    height: 52, backgroundColor: PRIMARY, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, shadowOpacity: 0.35, elevation: 6,
  },
  btnDisabled: { opacity: 0.4 },
});
