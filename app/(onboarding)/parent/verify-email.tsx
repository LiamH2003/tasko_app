import { useState, useRef } from 'react';
import { ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { BackButton } from '@/components/ui/BackButton';
import { StepBar } from '@/components/ui/StepBar';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { AnimatedFloat } from '@/components/ui/AnimatedFloat';
import { supabase } from '@/lib/supabase';
import { PRIMARY, primaryAlpha } from '@/constants/palette';

export default function ParentVerifyEmailScreen() {
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [resendSent, setResendSent] = useState(false);
  const inputRef = useRef<TextInput | null>(null);

  const canVerify = code.length === 6;

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.verifyOtp({
        email: email ?? '',
        token: code,
        type: 'signup',
      });
      if (err) throw err;
      router.push('/(onboarding)/parent/family-choice');
    } catch (e: any) {
      setError(e.message ?? 'Ongeldige code. Controleer de code en probeer opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setResendSent(false);
    try {
      const { error: err } = await supabase.auth.resend({ type: 'signup', email: email ?? '' });
      if (err) throw err;
      setResendSent(true);
      setCode('');
      inputRef.current?.focus();
    } catch (e: any) {
      setError(e.message ?? 'Opnieuw sturen mislukt. Probeer opnieuw.');
    } finally {
      setResending(false);
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
      <Box style={{ height: 12 }} />
      <StepBar step={2} total={5} />
      <Text variant="label" style={{ paddingHorizontal: 24, marginBottom: 12 }}>STAP 2 VAN 5 — VERIFICATIE</Text>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Mail icon with circle behind */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 100 }}
          style={{ marginTop: 16, marginBottom: 24, alignSelf: 'center' }}
        >
          <AnimatedFloat amplitude={6} duration={2400}>
            <Box style={styles.iconWrap}>
              <Ionicons name="mail-outline" size={44} color={PRIMARY} />
            </Box>
          </AnimatedFloat>
        </MotiView>

        {/* Heading */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 100 }}
          style={{ width: '100%', marginBottom: 28 }}
        >
          <Text variant="title" marginBottom="xs">Check je inbox</Text>
          <Text variant="subtitle">
            We hebben een 6-cijferige code gestuurd naar{' '}
            <Text variant="subtitle" style={{ color: PRIMARY, fontWeight: '600' }}>{email}</Text>.
            {' '}Vul hem hieronder in.
          </Text>
        </MotiView>

        {/* OTP boxes — single hidden input */}
        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 360, delay: 180 }}
          style={{ width: '100%', marginBottom: 12 }}
        >
          <Text variant="label" marginBottom="md" style={{ alignSelf: 'flex-start', color: '#6b6560' }}>JOUW VERIFICATIECODE</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={6}
              keyboardType="number-pad"
              caretHidden
              style={styles.overlayInput}
            />
            <Box flexDirection="row" gap="sm" style={{ width: '100%' }} pointerEvents="none">
              {Array.from({ length: 6 }).map((_, i) => (
                <MotiView
                  key={i}
                  animate={{
                    borderColor: i < code.length
                      ? PRIMARY
                      : (i === code.length && focused ? PRIMARY : primaryAlpha(0.25)),
                    backgroundColor: i < code.length
                      ? primaryAlpha(0.08)
                      : 'rgba(255,255,255,0.7)',
                  }}
                  transition={{ type: 'timing', duration: 150 }}
                  style={styles.codeBox}
                >
                  <Text style={styles.codeDigit}>{code[i] ?? ''}</Text>
                </MotiView>
              ))}
            </Box>
          </View>
        </MotiView>

        {error ? <Text variant="errorText" style={{ alignSelf: 'flex-start', marginBottom: 8 }}>{error}</Text> : null}
        {resendSent ? <Text variant="subtitle" style={{ alignSelf: 'flex-start', color: '#48bb78', fontSize: 12, marginBottom: 8 }}>Nieuwe code verstuurd!</Text> : null}

        {/* Info card */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 300, delay: 280 }}
          style={{ width: '100%', marginBottom: 24 }}
        >
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={18} color={PRIMARY} style={{ flexShrink: 0 }} />
            <Text variant="cardSub" style={{ flex: 1, lineHeight: 18 }}>
              Geen code ontvangen? Controleer je spam-map of stuur de code opnieuw.
            </Text>
          </View>
        </MotiView>

        <Box style={{ flex: 1, minHeight: 24, alignSelf: 'stretch' }} />

        {/* Buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 320 }}
          style={{ width: '100%', gap: 10, paddingBottom: Math.max(insets.bottom + 10, 24) }}
        >
          <TouchableOpacity
            style={[styles.btnPrimary, { opacity: canVerify && !loading ? 1 : 0.4 }]}
            onPress={handleVerify}
            disabled={!canVerify || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#e8e5dd" />
              : <Text variant="btnPrimary">Bevestig e-mailadres</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={handleResend}
            disabled={resending}
            activeOpacity={0.7}
          >
            {resending
              ? <ActivityIndicator color={PRIMARY} size="small" />
              : <Text variant="btnSecondary">Code opnieuw sturen</Text>}
          </TouchableOpacity>
        </MotiView>

      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 24, flexGrow: 1, alignItems: 'center' },
  iconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1.5, borderColor: primaryAlpha(0.3),
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16, shadowOpacity: 0.2, elevation: 6,
  },
  codeBox: {
    flex: 1, height: 64, borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  codeDigit: {
    fontSize: 24, fontWeight: '700', color: '#1a1918', textAlign: 'center',
  },
  overlayInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
  },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    padding: 14, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  btnPrimary: {
    height: 52, backgroundColor: PRIMARY, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, shadowOpacity: 0.35, elevation: 6,
  },
  btnSecondary: {
    height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: primaryAlpha(0.4),
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});
