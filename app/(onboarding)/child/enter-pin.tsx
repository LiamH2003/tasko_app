import { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { BackButton } from '@/components/ui/BackButton';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { PinInput } from '@/components/ui/PinInput';
import { verifyChildPin } from '@/services/children';
import { useAppStore } from '@/store/useAppStore';
import { PRIMARY, primaryAlpha } from '@/constants/palette';

export default function EnterPinScreen() {
  const insets = useSafeAreaInsets();
  const { childId, childName } = useLocalSearchParams<{ childId: string; childName: string }>();
  const { setChildId } = useAppStore();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [touched, setTouched] = useState(false);

  const handleVerify = async () => {
    if (!childId) return;
    setError('');
    setLoading(true);
    try {
      const result = await verifyChildPin(childId, pin);

      if (result === null) {
        // No PIN set yet — send to set-pin
        router.push({ pathname: '/(onboarding)/child/set-pin', params: { childId } });
        return;
      }

      if (!result) {
        const next = attempts + 1;
        setAttempts(next);
        setError(
          next >= 3
            ? 'Onjuiste pincode. Vraag je ouder om hulp.'
            : 'Onjuiste pincode. Probeer opnieuw.'
        );
        setPin('');
        return;
      }

      await setChildId(childId, childName);
      await SecureStore.deleteItemAsync('pendingChildId');
      await SecureStore.deleteItemAsync('pendingChildName');
      router.replace('/(child)');
    } catch (e: any) {
      setError(e.message ?? 'Er is iets misgegaan. Probeer opnieuw.');
      setPin('');
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

      <Box style={{ height: insets.top + 16 }} />
      <BackButton />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 60 }}
          style={{ marginTop: 24, marginBottom: 28 }}
        >
          <Text variant="title" marginBottom="xs">
            Welkom terug{childName ? `, ${childName}` : ''}!
          </Text>
          <Text variant="subtitle">
            Vul jouw 4-cijferige pincode in om in te loggen.
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 360, delay: 140 }}
        >
          <View style={styles.formCard}>
            <Text variant="label" marginBottom="md" style={{ color: '#6b6560' }}>JOUW PINCODE</Text>
            <PinInput value={pin} onChange={setPin} autoFocus onBlur={() => setTouched(true)} />
          </View>
        </MotiView>

        {error ? (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 12 }}>
            <Text variant="errorText" style={{ textAlign: 'center' }}>{error}</Text>
          </MotiView>
        ) : null}
      </ScrollView>

      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 340, delay: 260 }}
        style={{ paddingHorizontal: 24, gap: 12, paddingBottom: Math.max(insets.bottom + 10, 24) }}
      >
        <TouchableOpacity
          style={[styles.btnPrimary, { opacity: pin.length === 4 && !loading ? 1 : 0.4 }]}
          onPress={handleVerify}
          disabled={pin.length < 4 || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#e8e5dd" />
            : <Text variant="btnPrimary">Inloggen</Text>}
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
  btnPrimary: {
    height: 52, backgroundColor: PRIMARY, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, shadowOpacity: 0.35, elevation: 6,
  },
  btnDisabled: { opacity: 0.4 },
});
