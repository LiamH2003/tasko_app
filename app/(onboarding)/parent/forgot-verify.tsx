import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

const RESEND_COOLDOWN = 90;

function StepBar({ step }: { step: number }) {
  return (
    <View style={styles.stepBar}>
      {[1, 2, 3].map((s) => (
        <View key={s} style={[styles.stepSegment, s <= step && styles.stepActive]} />
      ))}
    </View>
  );
}

export default function ForgotVerifyScreen() {
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

  const formatCountdown = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

      <TouchableOpacity style={styles.back} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={16} color={Colors.primary} />
        <Text style={styles.backText}>Terug</Text>
      </TouchableOpacity>

      <StepBar step={2} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <Text style={styles.stepLabel}>STAP 2 VAN 3 — WACHTWOORD</Text>

        <View style={styles.iconWrap}>
          <Ionicons name="document-text-outline" size={42} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Voer de code in</Text>
        <Text style={styles.subtitle}>
          We hebben een 6-cijferige code gestuurd naar{' '}
          <Text style={styles.emailHighlight}>{email}</Text>. Vul hem hier in.
        </Text>

        <Text style={styles.label}>JOUW 6-CIJFERIGE CODE</Text>

        <View style={styles.codeRow}>
          {code.map((char, i) => (
            <TextInput
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              style={[styles.codeBox, char ? styles.codeBoxFilled : null]}
              value={char}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              maxLength={1}
              keyboardType="number-pad"
              textAlign="center"
              selectionColor={Colors.primary}
            />
          ))}
        </View>

        <View style={styles.resendRow}>
          {countdown > 0
            ? <Text style={styles.countdownText}>Nieuwe code in <Text style={styles.countdownNum}>{formatCountdown(countdown)}</Text></Text>
            : null}
          <TouchableOpacity
            onPress={handleResend}
            disabled={countdown > 0 || resending}
            activeOpacity={0.7}
          >
            <Text style={[styles.resendText, countdown > 0 && styles.resendDisabled]}>
              {resending ? 'Bezig...' : 'Opnieuw sturen'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Geen code ontvangen? Controleer je spam-map of klik op "Opnieuw sturen" na de wachttijd.
          </Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.spacer} />

        <TouchableOpacity
          style={[styles.btnPrimary, (!canVerify || loading) && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={!canVerify || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={Colors.background} />
            : <Text style={styles.btnPrimaryText}>Code bevestigen</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondary} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.btnSecondaryText}>Annuleren</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  backText: { fontSize: FontSize.sm, color: Colors.primary },

  stepBar: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  stepSegment: { flex: 1, height: 3, borderRadius: 2, backgroundColor: Colors.surface },
  stepActive: { backgroundColor: Colors.primary },

  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },

  stepLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: Spacing.lg,
  },

  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },

  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    lineHeight: 21,
    marginBottom: Spacing.xl,
  },
  emailHighlight: { color: Colors.primary, fontWeight: FontWeight.semibold },

  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },

  codeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  codeBox: {
    flex: 1,
    height: 60,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  codeBoxFilled: { borderColor: Colors.primary },

  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  countdownText: { fontSize: FontSize.sm, color: Colors.text.muted },
  countdownNum: { color: Colors.text.secondary, fontWeight: FontWeight.semibold },
  resendText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  resendDisabled: { color: Colors.text.muted },

  infoBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoText: { fontSize: FontSize.sm, color: Colors.text.muted, lineHeight: 19 },

  errorText: { fontSize: FontSize.sm, color: Colors.status.error, marginBottom: Spacing.sm },

  spacer: { flex: 1, minHeight: Spacing.xl },

  btnPrimary: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  btnDisabled: { opacity: 0.4 },
  btnPrimaryText: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.background },

  btnSecondary: {
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: { fontSize: FontSize.md, color: Colors.text.muted, fontWeight: FontWeight.medium },
});
