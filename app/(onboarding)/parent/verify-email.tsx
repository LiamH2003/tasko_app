import { useState, useRef } from 'react';
import { Dimensions, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { BlurView } from 'expo-blur';
import { Box, Text } from '@/components/ui/primitives';
import { BackButton } from '@/components/ui/BackButton';
import { StepBar } from '@/components/ui/StepBar';
import { supabase } from '@/lib/supabase';

const SCREEN_W = Dimensions.get('window').width;

export default function ParentVerifyEmailScreen() {
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [resendSent, setResendSent] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([null, null, null, null, null, null]);

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
      router.push('/(onboarding)/parent/family-setup');
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
      await supabase.auth.signInWithOtp({ email: email ?? '', options: { shouldCreateUser: false } });
      setResendSent(true);
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (e: any) {
      setError(e.message ?? 'Opnieuw sturen mislukt. Probeer opnieuw.');
    } finally {
      setResending(false);
    }
  };

  return (
    <Box flex={1} backgroundColor="background">

      {/* Blob — top right */}
      <MotiView
        from={{ scale: 1, opacity: 0.7 }}
        animate={{ scale: 1.1, opacity: 1 }}
        transition={{ type: 'timing', duration: 3600, loop: true, repeatReverse: true }}
        style={{
          position: 'absolute', width: 260, height: 260, borderRadius: 130,
          backgroundColor: 'rgba(73,201,213,0.14)', top: -50, right: -60,
        }}
      />
      {/* Blob — bottom left */}
      <MotiView
        from={{ scale: 1, opacity: 0.4 }}
        animate={{ scale: 1.08, opacity: 0.7 }}
        transition={{ type: 'timing', duration: 2800, loop: true, repeatReverse: true, delay: 800 }}
        style={{
          position: 'absolute', width: 200, height: 200, borderRadius: 100,
          backgroundColor: 'rgba(73,201,213,0.09)', bottom: 80, left: -60,
        }}
      />

      <Box style={{ height: insets.top + 16 }} />
      <BackButton />
      <Box style={{ height: 12 }} />
      <StepBar step={2} total={4} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom + 24, 40), alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Animated mail icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 100 }}
          style={{ marginTop: 16, marginBottom: 24 }}
        >
          <MotiView
            from={{ translateY: 0 }}
            animate={{ translateY: -6 }}
            transition={{ type: 'timing', duration: 2400, loop: true, repeatReverse: true }}
          >
            <Box style={styles.iconWrap}>
              <Ionicons name="mail-outline" size={40} color="#49c9d5" />
            </Box>
          </MotiView>
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
            <Text variant="subtitle" style={{ color: '#49c9d5', fontWeight: '600' }}>{email}</Text>.
            {' '}Vul hem hieronder in.
          </Text>
        </MotiView>

        {/* OTP boxes */}
        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 360, delay: 180 }}
          style={{ width: '100%', marginBottom: 12 }}
        >
          <Text variant="label" marginBottom="md" style={{ alignSelf: 'flex-start' }}>JOUW VERIFICATIECODE</Text>
          <Box flexDirection="row" gap="sm" style={{ width: '100%' }}>
            {code.map((char, i) => (
              <MotiView
                key={i}
                animate={{
                  borderColor: char ? '#49c9d5' : 'rgba(73,201,213,0.25)',
                  backgroundColor: char ? 'rgba(73,201,213,0.08)' : 'rgba(255,255,255,0.7)',
                }}
                transition={{ type: 'timing', duration: 150 }}
                style={[styles.codeBox]}
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
                  selectionColor="#49c9d5"
                />
              </MotiView>
            ))}
          </Box>
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
          <BlurView intensity={30} tint="light" style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={18} color="#49c9d5" style={{ flexShrink: 0 }} />
            <Text variant="cardSub" style={{ flex: 1, lineHeight: 18 }}>
              Geen code ontvangen? Controleer je spam-map of stuur de code opnieuw.
            </Text>
          </BlurView>
        </MotiView>

        {/* Verify button */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 320 }}
          style={{ width: '100%', gap: 10 }}
        >
          <TouchableOpacity
            style={[styles.btnPrimary, (!canVerify || loading) && styles.btnDisabled]}
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
              ? <ActivityIndicator color="#49c9d5" size="small" />
              : <Text variant="btnSecondary">Code opnieuw sturen</Text>}
          </TouchableOpacity>
        </MotiView>

      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1.5, borderColor: 'rgba(73,201,213,0.3)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#49c9d5', shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16, shadowOpacity: 0.2, elevation: 6,
  },
  codeBox: {
    flex: 1, height: 64, borderRadius: 14,
    borderWidth: 2, borderColor: 'rgba(73,201,213,0.25)',
    backgroundColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden',
  },
  codeInput: {
    flex: 1, height: '100%', fontSize: 24,
    fontWeight: '700', color: '#1a1918', textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    padding: 14, borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  btnPrimary: {
    height: 52, backgroundColor: '#49c9d5', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#49c9d5', shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, shadowOpacity: 0.35, elevation: 6,
  },
  btnDisabled: { opacity: 0.4 },
  btnSecondary: {
    height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(73,201,213,0.4)',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});
