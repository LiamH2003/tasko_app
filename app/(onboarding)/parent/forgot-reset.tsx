import { useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { BlurView } from 'expo-blur';
import { Box, Text } from '@/components/ui/primitives';
import { BackButton } from '@/components/ui/BackButton';
import { StepBar } from '@/components/ui/StepBar';
import { supabase } from '@/lib/supabase';

const SCREEN_W = Dimensions.get('window').width;

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

      {/* Blob — top right */}
      <MotiView
        from={{ scale: 1, opacity: 0.65 }}
        animate={{ scale: 1.1, opacity: 1 }}
        transition={{ type: 'timing', duration: 3500, loop: true, repeatReverse: true }}
        style={{
          position: 'absolute', width: 260, height: 260, borderRadius: 130,
          backgroundColor: 'rgba(73,201,213,0.13)', top: -50, right: -60,
        }}
      />
      {/* Blob — bottom left */}
      <MotiView
        from={{ scale: 1, opacity: 0.35 }}
        animate={{ scale: 1.08, opacity: 0.65 }}
        transition={{ type: 'timing', duration: 2900, loop: true, repeatReverse: true, delay: 600 }}
        style={{
          position: 'absolute', width: 200, height: 200, borderRadius: 100,
          backgroundColor: 'rgba(73,201,213,0.09)', bottom: 80, left: -55,
        }}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Box style={{ height: insets.top + 16 }} />
        <BackButton />
        <Box style={{ height: 12 }} />
        <StepBar step={3} total={3} />

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom + 24, 40), flexGrow: 1 }}
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
            <MotiView
              from={{ translateY: 0 }}
              animate={{ translateY: -6 }}
              transition={{ type: 'timing', duration: 2400, loop: true, repeatReverse: true }}
              style={{ alignSelf: 'flex-start' }}
            >
              <Box style={styles.iconWrap}>
                <Ionicons name="lock-closed-outline" size={38} color="#49c9d5" />
              </Box>
            </MotiView>
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

            {/* Animated rules checklist */}
            <BlurView intensity={30} tint="light" style={[styles.rulesCard, { marginBottom: 20 }]}>
              {RULES.map((rule) => {
                const passed = rule.test(password);
                return (
                  <Box key={rule.label} flexDirection="row" alignItems="center" gap="sm" style={{ marginBottom: 8 }}>
                    <MotiView
                      animate={{
                        backgroundColor: passed ? '#49c9d5' : 'transparent',
                        borderColor: passed ? '#49c9d5' : 'rgba(73,201,213,0.35)',
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
                      style={{ color: passed ? '#3797a0' : '#8a8885', fontWeight: passed ? '500' : '400' }}
                    >
                      {rule.label}
                    </Text>
                  </Box>
                );
              })}
            </BlurView>

            <Text variant="label" marginBottom="sm">BEVESTIG WACHTWOORD</Text>
            <Box style={[styles.inputBox, { marginBottom: 8,
              borderColor: confirm.length > 0
                ? (passwordsMatch ? '#49c9d5' : '#fc6b6b')
                : 'rgba(73,201,213,0.3)',
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
  iconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1.5, borderColor: 'rgba(73,201,213,0.3)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#49c9d5', shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14, shadowOpacity: 0.2, elevation: 5,
  },
  inputBox: {
    height: 50, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(73,201,213,0.3)',
    paddingHorizontal: 14, gap: 8,
  },
  input: { fontSize: 15, color: '#1a1918', padding: 0 },
  rulesCard: {
    padding: 16, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  ruleCheck: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  btnPrimary: {
    height: 52, backgroundColor: '#49c9d5', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#49c9d5', shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, shadowOpacity: 0.35, elevation: 6,
  },
  btnDisabled: { opacity: 0.4 },
});
