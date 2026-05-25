import { useState, useRef, useEffect } from 'react';
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

const RESEND_COOLDOWN = 90;

function formatCountdown(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function ForgotVerifyScreen() {
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const inputs = useRef<(TextInput | null)[]>([null, null, null, null, null, null]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleChange = (text: string, index: number) => {
    const char = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...code];
    next[index] = char;
    setCode(next);
    if (char && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      const next = [...code];
      next[index - 1] = '';
      setCode(next);
      inputs.current[index - 1]?.focus();
    }
  };

  const canVerify = code.join('').length === 6;

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.verifyOtp({
        email: email ?? '',
        token: code.join(''),
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
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch {
      setError('Opnieuw sturen mislukt. Probeer opnieuw.');
    } finally {
      setResending(false);
    }
  };

  return (
    <Box flex={1} backgroundColor="background">

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

      <Box style={{ height: insets.top + 16 }} />
      <BackButton />
      <Box style={{ height: 12 }} />
      <StepBar step={2} total={3} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 100 }}
          style={{ marginBottom: 24 }}
        >
          <Text variant="label" marginBottom="lg">STAP 2 VAN 3 — WACHTWOORD</Text>
          <AnimatedFloat amplitude={6} duration={2400} style={{ alignSelf: 'flex-start' }}>
            <Box style={styles.iconWrap}>
              <Ionicons name="document-text-outline" size={38} color={PRIMARY} />
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

        {/* OTP */}
        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 360, delay: 180 }}
          style={{ marginBottom: 16 }}
        >
          <Text variant="label" marginBottom="md">JOUW 6-CIJFERIGE CODE</Text>
          <Box flexDirection="row" gap="sm">
            {code.map((char, i) => (
              <MotiView
                key={i}
                animate={{
                  borderColor: char ? PRIMARY : primaryAlpha(0.25),
                  backgroundColor: char ? primaryAlpha(0.08) : 'rgba(255,255,255,0.7)',
                }}
                transition={{ type: 'timing', duration: 150 }}
                style={styles.codeBox}
              >
                <TextInput
                  ref={(el) => { inputs.current[i] = el; }}
                  style={styles.codeInput}
                  value={char}
                  onChangeText={(t) => handleChange(t, i)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                  maxLength={1}
                  keyboardType="number-pad"
                  textAlign="center"
                  selectionColor={PRIMARY}
                />
              </MotiView>
            ))}
          </Box>
        </MotiView>

        {/* Resend row */}
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="md">
          {countdown > 0 ? (
            <Text variant="cardSub" style={{ fontSize: 12 }}>
              Nieuwe code in <Text variant="cardSub" style={{ fontWeight: '600', color: '#4a4845' }}>{formatCountdown(countdown)}</Text>
            </Text>
          ) : <Box />}
          <TouchableOpacity onPress={handleResend} disabled={countdown > 0 || resending} activeOpacity={0.7}>
            <Text variant="backLabel" style={{ opacity: countdown > 0 ? 0.4 : 1 }}>
              {resending ? 'Bezig...' : 'Opnieuw sturen'}
            </Text>
          </TouchableOpacity>
        </Box>

        {/* Info card */}
        <View style={[styles.infoCard, { marginBottom: 16 }]}>
          <Ionicons name="information-circle-outline" size={18} color={PRIMARY} style={{ flexShrink: 0 }} />
          <Text variant="cardSub" style={{ flex: 1, lineHeight: 18 }}>
            Geen code ontvangen? Controleer je spam-map of klik op "Opnieuw sturen" na de wachttijd.
          </Text>
        </View>

        {error ? (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Text variant="errorText" style={{ marginBottom: 8 }}>{error}</Text>
          </MotiView>
        ) : null}

        <Box flex={1} style={{ minHeight: 24 }} />

        {/* CTA */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 280 }}
          style={{ gap: 10 }}
        >
          <TouchableOpacity
            style={[styles.btnPrimary, (!canVerify || loading) && styles.btnDisabled]}
            onPress={handleVerify}
            disabled={!canVerify || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#e8e5dd" />
              : <Text variant="btnPrimary">Code bevestigen</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary} onPress={() => router.back()} activeOpacity={0.7}>
            <Text variant="btnSecondary">Annuleren</Text>
          </TouchableOpacity>
        </MotiView>

      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 },
  iconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1.5, borderColor: primaryAlpha(0.3),
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14, shadowOpacity: 0.2, elevation: 5,
  },
  codeBox: {
    flex: 1, height: 64, borderRadius: 14,
    borderWidth: 2, overflow: 'hidden',
  },
  codeInput: {
    flex: 1, height: '100%', fontSize: 24,
    fontWeight: '700', color: '#1a1918', textAlign: 'center',
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
  btnDisabled: { opacity: 0.4 },
  btnSecondary: {
    height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
});
