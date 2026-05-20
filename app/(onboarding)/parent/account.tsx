import { useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { BlurView } from 'expo-blur';
import { Box, Text } from '@/components/ui/primitives';
import { BackButton } from '@/components/ui/BackButton';
import { StepBar } from '@/components/ui/StepBar';
import { signUp } from '@/services/auth';
import { supabase } from '@/lib/supabase';

const SCREEN_W = Dimensions.get('window').width;

export default function ParentAccountScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canContinue =
    email.includes('@') &&
    password.length >= 6 &&
    password === confirmPassword;

  return (
    <Box flex={1} backgroundColor="background">

      {/* Blob — top left */}
      <MotiView
        from={{ scale: 1, opacity: 0.65 }}
        animate={{ scale: 1.12, opacity: 1 }}
        transition={{ type: 'timing', duration: 3500, loop: true, repeatReverse: true }}
        style={{
          position: 'absolute', width: 300, height: 300, borderRadius: 150,
          backgroundColor: 'rgba(73,201,213,0.13)', top: -60, left: -70,
        }}
      />
      {/* Blob — right middle */}
      <MotiView
        from={{ scale: 1, opacity: 0.35 }}
        animate={{ scale: 1.07, opacity: 0.65 }}
        transition={{ type: 'timing', duration: 2700, loop: true, repeatReverse: true, delay: 600 }}
        style={{
          position: 'absolute', width: 160, height: 160, borderRadius: 80,
          backgroundColor: 'rgba(73,201,213,0.08)', top: '35%', right: -50,
        }}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Box style={{ height: insets.top + 16 }} />
        <BackButton />
        <Box style={{ height: 12 }} />
        <StepBar step={1} />

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Heading */}
          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 60 }}
            style={{ marginBottom: 24 }}
          >
            <Text variant="label" marginBottom="sm">STAP 1 VAN 4 — ACCOUNT</Text>
            <Text variant="title" marginBottom="xs">Jouw account</Text>
            <Text variant="subtitle">Maak een account aan om te beginnen.</Text>
          </MotiView>

          {/* Social buttons */}
          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 130 }}
          >
            <Box flexDirection="row" gap="sm" marginBottom="md">
              {[
                { key: 'facebook', icon: require('@/assets/images/icons/logo_fb.svg') },
                { key: 'google',   icon: require('@/assets/images/icons/logo_google.svg') },
              ].map((s) => (
                <TouchableOpacity key={s.key} activeOpacity={0.8} style={{ flex: 1 }}>
                  <BlurView intensity={40} tint="light" style={styles.socialIconBtn}>
                    <Image source={s.icon} style={{ width: 24, height: 24 }} contentFit="contain" />
                  </BlurView>
                </TouchableOpacity>
              ))}
            </Box>
          </MotiView>

          {/* Divider */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 300, delay: 180 }}
            style={styles.dividerRow}
          >
            <Box style={styles.dividerLine} />
            <Text variant="label" style={{ letterSpacing: 0.5 }}>OF MET E-MAIL</Text>
            <Box style={styles.dividerLine} />
          </MotiView>

          {/* Form card */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 360, delay: 220 }}
          >
            <BlurView intensity={40} tint="light" style={styles.formCard}>

              {/* Email */}
              <Text variant="label" marginBottom="sm">E-MAILADRES</Text>
              <Box style={[styles.inputBox, { marginBottom: 16 }]}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="jan@voorbeeld.be"
                  placeholderTextColor="#8a8885"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Box>

              {/* Password */}
              <Text variant="label" marginBottom="sm">WACHTWOORD</Text>
              <Box style={[styles.inputBox, { marginBottom: 16 }]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min. 6 tekens"
                  placeholderTextColor="#8a8885"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={8}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#8a8885" />
                </TouchableOpacity>
              </Box>

              {/* Confirm password */}
              <Text variant="label" marginBottom="sm">HERHAAL WACHTWOORD</Text>
              <Box style={[styles.inputBox, {
                borderColor: confirmPassword.length > 0
                  ? (password === confirmPassword ? '#49c9d5' : '#fc6b6b')
                  : 'rgba(73,201,213,0.3)',
              }]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Wachtwoord herhalen"
                  placeholderTextColor="#8a8885"
                  secureTextEntry={!showConfirm}
                />
                <TouchableOpacity onPress={() => setShowConfirm(v => !v)} hitSlop={8}>
                  <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#8a8885" />
                </TouchableOpacity>
              </Box>

            </BlurView>
          </MotiView>

        </ScrollView>

        {/* Pinned footer — always at bottom */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 320 }}
          style={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom + 16, 24), gap: 12 }}
        >
          {error ? (
            <Text variant="errorText" style={{ textAlign: 'center' }}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.btnPrimary, (!canContinue || loading) && styles.btnDisabled]}
            onPress={async () => {
              setError('');
              setLoading(true);
              try {
                await signUp(email, password);
                await supabase.auth.signOut();
                await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
                router.push({ pathname: '/(onboarding)/parent/verify-email', params: { email } });
              } catch (e: any) {
                setError(e.message ?? 'Er is iets misgegaan. Probeer opnieuw.');
              } finally {
                setLoading(false);
              }
            }}
            disabled={!canContinue || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#e8e5dd" />
              : <Text variant="btnPrimary">Maak account aan</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignItems: 'center', paddingVertical: 4 }}
            onPress={() => router.push('/(onboarding)/parent/login')}
            activeOpacity={0.7}
          >
            <Text variant="legal">
              Al een account?{'  '}
              <Text variant="legalLink">Log in</Text>
            </Text>
          </TouchableOpacity>
        </MotiView>

      </KeyboardAvoidingView>
    </Box>
  );
}

const styles = StyleSheet.create({
  socialIconBtn: {
    height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.45)', overflow: 'hidden',
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(73,201,213,0.25)' },
  formCard: {
    borderRadius: 20, overflow: 'hidden', padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  inputBox: {
    height: 50, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(73,201,213,0.3)',
    paddingHorizontal: 14, gap: 8,
  },
  input: { flex: 1, fontSize: 14, color: '#1a1918', padding: 0 },
  btnPrimary: {
    height: 52, backgroundColor: '#49c9d5', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#49c9d5', shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, shadowOpacity: 0.35, elevation: 6,
  },
  btnDisabled: { opacity: 0.4 },
});
