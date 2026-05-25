import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { BackButton } from '@/components/ui/BackButton';
import { StepBar } from '@/components/ui/StepBar';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { AnimatedFloat } from '@/components/ui/AnimatedFloat';
import { supabase } from '@/lib/supabase';
import { PRIMARY, PRIMARY_DARK, primaryAlpha } from '@/constants/palette';

type Rule = { label: string; test: (p: string) => boolean };

const RULES: Rule[] = [
  { label: 'Minimaal 8 tekens',                test: (p) => p.length >= 8 },
  { label: 'Minstens 1 hoofdletter',           test: (p) => /[A-Z]/.test(p) },
  { label: 'Minstens 1 cijfer',                test: (p) => /[0-9]/.test(p) },
  { label: 'Minstens 1 speciaal teken (!@#…)', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function ForgotResetScreen() {
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const allRulesPassed = RULES.every((r) => r.test(password));
  const passwordsMatch = password === confirm && confirm.length > 0;
  const canSave = allRulesPassed && passwordsMatch;

  const handleSave = async () => {
    setError('');
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      router.replace('/(onboarding)/parent/login');
    } catch (e: any) {
      setError(e.message ?? 'Wachtwoord opslaan mislukt. Probeer opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} backgroundColor="background">

      <AnimatedBlob
        size={260} color={primaryAlpha(0.13)}
        duration={3500} opacityFrom={0.65} opacityTo={1} scaleTarget={1.1}
        style={{ top: -50, right: -60 }}
      />
      <AnimatedBlob
        size={200} color={primaryAlpha(0.09)}
        duration={2900} delay={600} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.08}
        style={{ bottom: 80, left: -55 }}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Box style={{ height: insets.top + 16 }} />
        <BackButton />
        <Box style={{ height: 12 }} />
        <StepBar step={3} total={3} />

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
            <Text variant="label" marginBottom="lg">STAP 3 VAN 3 — WACHTWOORD</Text>
            <AnimatedFloat amplitude={6} duration={2400} style={{ alignSelf: 'flex-start' }}>
              <Box style={styles.iconWrap}>
                <Ionicons name="lock-closed-outline" size={38} color={PRIMARY} />
              </Box>
            </AnimatedFloat>
          </MotiView>

          {/* Heading */}
          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 100 }}
            style={{ marginBottom: 24 }}
          >
            <Text variant="title" marginBottom="xs">Nieuw wachtwoord</Text>
            <Text variant="subtitle">
              Kies een sterk wachtwoord. Je gebruikt het om daarna in te loggen.
            </Text>
          </MotiView>

          {/* Form */}
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 360, delay: 180 }}
          >
            <Text variant="label" marginBottom="sm">NIEUW WACHTWOORD</Text>
            <Box style={[styles.inputBox, { marginBottom: 16 }]}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Minimaal 8 tekens..."
                placeholderTextColor="#8a8885"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={8}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#8a8885" />
              </TouchableOpacity>
            </Box>

            {/* Rules checklist */}
            <View style={[styles.rulesCard, { marginBottom: 20 }]}>
              {RULES.map((rule) => {
                const passed = rule.test(password);
                return (
                  <Box key={rule.label} flexDirection="row" alignItems="center" gap="sm" style={{ marginBottom: 8 }}>
                    <MotiView
                      animate={{
                        backgroundColor: passed ? PRIMARY : 'transparent',
                        borderColor: passed ? PRIMARY : primaryAlpha(0.35),
                      }}
                      transition={{ type: 'timing', duration: 200 }}
                      style={styles.ruleCheck}
                    >
                      <MotiView
                        animate={{ opacity: passed ? 1 : 0, scale: passed ? 1 : 0.5 }}
                        transition={{ type: 'spring', damping: 12, delay: passed ? 40 : 0 }}
                      >
                        <Ionicons name="checkmark" size={11} color="#e8e5dd" />
                      </MotiView>
                    </MotiView>
                    <Text
                      variant="cardSub"
                      style={{ color: passed ? PRIMARY_DARK : '#8a8885', fontWeight: passed ? '500' : '400' }}
                    >
                      {rule.label}
                    </Text>
                  </Box>
                );
              })}
            </View>

            <Text variant="label" marginBottom="sm">BEVESTIG WACHTWOORD</Text>
            <Box style={[styles.inputBox, { marginBottom: 8,
              borderColor: confirm.length > 0
                ? (passwordsMatch ? PRIMARY : '#fc6b6b')
                : primaryAlpha(0.3),
            }]}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Typ het opnieuw..."
                placeholderTextColor="#8a8885"
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowConfirm(v => !v)} hitSlop={8}>
                <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#8a8885" />
              </TouchableOpacity>
            </Box>

            {confirm.length > 0 && !passwordsMatch ? (
              <Text variant="errorText" style={{ marginBottom: 8 }}>Wachtwoorden komen niet overeen.</Text>
            ) : null}
          </MotiView>

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
          >
            <TouchableOpacity
              style={[styles.btnPrimary, (!canSave || loading) && styles.btnDisabled]}
              onPress={handleSave}
              disabled={!canSave || loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#e8e5dd" />
                : <Text variant="btnPrimary">Wachtwoord opslaan</Text>}
            </TouchableOpacity>
          </MotiView>

        </ScrollView>
      </KeyboardAvoidingView>
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
  inputBox: {
    height: 50, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12, borderWidth: 1.5, borderColor: primaryAlpha(0.3),
    paddingHorizontal: 14, gap: 8,
  },
  input: { fontSize: 15, color: '#1a1918', padding: 0 },
  rulesCard: {
    padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  ruleCheck: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  btnPrimary: {
    height: 52, backgroundColor: PRIMARY, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, shadowOpacity: 0.35, elevation: 6,
  },
  btnDisabled: { opacity: 0.4 },
});
