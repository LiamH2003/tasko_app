import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, View, Pressable } from 'react-native';
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
import { PRIMARY, primaryAlpha, ERROR } from '@/constants/palette';

export default function ForgotResetScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const passwordValid = password.trim().length >= 6;
  const passwordsMatch = confirm.length > 0 && password.trim() === confirm.trim();
  const canSave = passwordValid && passwordsMatch;

  const handleSave = async () => {
    setError('');
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      router.replace('/(onboarding)/parent/forgot-success');
    } catch (e: any) {
      setError(e.message ?? 'Wachtwoord opslaan mislukt. Probeer opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} backgroundColor="background">

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
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
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Box style={{ height: insets.top + 16 }} />
        <BackButton />
        <Box style={{ height: 12 }} />
        <StepBar step={3} total={4} />
        <Text variant="label" style={{ paddingHorizontal: 24, marginBottom: 12 }}>STAP 3 VAN 4 — WACHTWOORD</Text>

        <ScrollView
          ref={scrollRef}
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
                <Ionicons name="lock-closed-outline" size={44} color={PRIMARY} />
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
              Kies een wachtwoord. Je gebruikt het om daarna in te loggen.
            </Text>
          </MotiView>

          {/* Form */}
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 360, delay: 180 }}
          >
            <View style={styles.formCard}>

              {/* Password */}
              <Text variant="label" marginBottom="sm">WACHTWOORD</Text>
              <Box style={[styles.inputBox, { borderColor: primaryAlpha(0.3) }]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  onBlur={() => setTouched(true)}
                  placeholder="Min. 6 tekens"
                  placeholderTextColor="#8a8885"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable onPressIn={() => setShowPassword(true)} onPressOut={() => setShowPassword(false)} hitSlop={8}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#8a8885" />
                </Pressable>
              </Box>
              <View style={styles.requirementRow}>
                <Ionicons
                  name={passwordValid ? 'checkmark-circle' : 'ellipse-outline'}
                  size={14}
                  color={passwordValid ? PRIMARY : '#8a8885'}
                />
                <Text style={[styles.requirementText, { color: passwordValid ? PRIMARY : '#8a8885' }]}>
                  Minimaal 6 tekens
                </Text>
              </View>

              {/* Confirm password */}
              <Text variant="label" marginBottom="sm" style={{ marginTop: 16 }}>HERHAAL WACHTWOORD</Text>
              <Box style={[styles.inputBox, {
                borderColor: confirm.length > 0
                  ? (passwordsMatch ? PRIMARY : ERROR)
                  : primaryAlpha(0.3),
              }]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={confirm}
                  onChangeText={setConfirm}
                  onBlur={() => setTouched(true)}
                  onFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}
                  placeholder="Wachtwoord herhalen"
                  placeholderTextColor="#8a8885"
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable onPressIn={() => setShowConfirm(true)} onPressOut={() => setShowConfirm(false)} hitSlop={8}>
                  <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#8a8885" />
                </Pressable>
              </Box>
              {confirm.length > 0 && (
                <Text style={[styles.requirementText, {
                  marginTop: 6,
                  color: passwordsMatch ? PRIMARY : ERROR,
                }]}>
                  {passwordsMatch ? 'Wachtwoorden komen overeen' : 'Wachtwoorden komen niet overeen'}
                </Text>
              )}

            </View>
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
        {error ? (
          <Text variant="errorText" style={{ textAlign: 'center' }}>{error}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.btnPrimary, { opacity: canSave && !loading ? 1 : 0.4 }]}
          onPress={handleSave}
          disabled={!canSave || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#e8e5dd" />
            : <Text variant="btnPrimary">Wachtwoord opslaan</Text>}
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
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
  iconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1.5, borderColor: primaryAlpha(0.3),
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16, shadowOpacity: 0.2, elevation: 6,
  },
  formCard: {
    borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  inputBox: {
    height: 50, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12, borderWidth: 1.5,
    paddingHorizontal: 14, gap: 8,
  },
  input: { flex: 1, fontSize: 14, color: '#1a1918', padding: 0 },
  requirementRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  requirementText: { fontSize: 12, lineHeight: 16 },
  btnPrimary: {
    height: 52, backgroundColor: PRIMARY, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, shadowOpacity: 0.35, elevation: 6,
  },
});
