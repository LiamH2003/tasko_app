import { useState, useRef, useEffect } from 'react';
import { ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, View, KeyboardAvoidingView, Platform } from 'react-native';
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

const RESEND_COOLDOWN = 90;

function formatCountdown(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function ForgotVerifyScreen() {
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const inputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const canVerify = code.length === 6;

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.verifyOtp({
        email: email ?? '',
        token: code,
        type: 'email',
      });
      if (err) throw err;
      router.push({ pathname: '/(onboarding)/parent/forgot-reset', params: { email } });
    } catch (e: any) {
      setError(e.message ?? 'Ongeldige code. Controleer de code en probeer opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await supabase.auth.signInWithOtp({ email: email ?? '', options: { shouldCreateUser: false } });
      setCountdown(RESEND_COOLDOWN);
      setCode('');
      inputRef.current?.focus();
    } catch {
      setError('Opnieuw sturen mislukt. Probeer opnieuw.');
    } finally {
      setResending(false);
    }
  };

  return (
    <Box flex={1} backgroundColor="background">

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <AnimatedBlob
          size={260} color={primaryAlpha(0.13)}
          duration={3200} opacityFrom={0.6} opacityTo={0.95} scaleTarget={1.1}
          style={{ top: -50, left: -60 }}
        />
        <AnimatedBlob
          size={190} color={primaryAlpha(0.09)}
          duration={2700} delay={800} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07}
          style={{ bottom: 80, right: -50 }}
        />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Box style={{ height: insets.top + 16 }} />
        <BackButton />
        <Box style={{ height: 12 }} />
        <StepBar step={2} total={4} />
        <Text variant="label" style={{ paddingHorizontal: 24, marginBottom: 12 }}>STAP 2 VAN 4 — WACHTWOORD</Text>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Icon */}
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 100 }}
            style={{ marginTop: 16, marginBottom: 24, alignSelf: 'center' }}
          >
            <AnimatedFloat amplitude={6} duration={2400}>
              <Box style={styles.iconWrap}>
                <Ionicons name="document-text-outline" size={44} color={PRIMARY} />
              </Box>
            </AnimatedFloat>
          </MotiView>

          {/* Heading */}
          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 100 }}
            style={{ marginBottom: 28 }}
          >
            <Text variant="title" marginBottom="xs">Voer de code in</Text>
            <Text variant="subtitle">
              We hebben een code gestuurd naar{' '}
              <Text variant="subtitle" style={{ color: PRIMARY, fontWeight: '600' }}>{email}</Text>.
            </Text>
          </MotiView>

          {/* OTP + resend + info */}
          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 180 }}
          >
            <Text variant="label" marginBottom="md" style={{ color: '#6b6560' }}>JOUW 6-CIJFERIGE CODE</Text>

            <View style={{ position: 'relative', marginBottom: 16 }}>
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

            <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="md">
              <TouchableOpacity onPress={handleResend} disabled={countdown > 0 || resending} activeOpacity={0.7}>
                <Text variant="backLabel" style={{ opacity: countdown > 0 ? 0.4 : 1 }}>
                  {resending ? 'Bezig...' : 'Opnieuw sturen'}
                </Text>
              </TouchableOpacity>
              {countdown > 0 ? (
                <Text variant="cardSub" style={{ fontSize: 12 }}>
                  Nieuwe code in <Text variant="cardSub" style={{ fontWeight: '600', color: '#4a4845' }}>{formatCountdown(countdown)}</Text>
                </Text>
              ) : <Box />}
            </Box>

            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={18} color={PRIMARY} style={{ flexShrink: 0 }} />
              <Text variant="cardSub" style={{ flex: 1, lineHeight: 18 }}>
                Geen code ontvangen? Controleer je spam-map of klik op "Opnieuw sturen" na de wachttijd.
              </Text>
            </View>

            {error ? (
              <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 12 }}>
                <Text variant="errorText">{error}</Text>
              </MotiView>
            ) : null}
          </MotiView>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Pinned footer — outside KAV so it doesn't jump */}
      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 340, delay: 280 }}
        style={{ paddingHorizontal: 24, gap: 12, paddingBottom: Math.max(insets.bottom + 10, 24) }}
      >
        <TouchableOpacity
          style={[styles.btnPrimary, { opacity: canVerify && !loading ? 1 : 0.4 }]}
          onPress={handleVerify}
          disabled={!canVerify || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#e8e5dd" />
            : <Text variant="btnPrimary">Code bevestigen</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={{ alignItems: 'center', paddingVertical: 4 }}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text variant="backLabel">Annuleren</Text>
        </TouchableOpacity>
      </MotiView>

    </Box>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 24, paddingBottom: 16, flexGrow: 1 },
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
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
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
});
