import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { BackButton } from '@/components/ui/BackButton';
import { StepBar } from '@/components/ui/StepBar';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { signUp } from '@/services/auth';
import { signInWithProvider } from '@/services/oauth';
import { PRIMARY, primaryAlpha } from '@/constants/palette';

export default function ParentAccountScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [error, setError] = useState('');

  const [canContinue, setCanContinue] = useState(false);

  const handleSocialRegister = async (provider: 'google' | 'facebook') => {
    setError('');
    setSocialLoading(provider);
    try {
      await signInWithProvider(provider);
    } catch (e: any) {
      setError(e.message ?? 'Registratie mislukt. Probeer opnieuw.');
    } finally {
      setSocialLoading(null);
    }
  };

  const check = (e: string, p: string, c: string) =>
    e.trim().includes('@') && p.trim().length >= 6 && p.trim() === c.trim();

  const handleEmailChange = (text: string) => { setEmail(text); setCanContinue(check(text, password, confirmPassword)); };
  const handlePasswordChange = (text: string) => { setPassword(text); setCanContinue(check(email, text, confirmPassword)); };
  const handleConfirmChange = (text: string) => { setConfirmPassword(text); setCanContinue(check(email, password, text)); };

  return (
    <Box flex={1} backgroundColor="background">

      <AnimatedBlob
        size={300} color={primaryAlpha(0.13)}
        duration={3500} opacityFrom={0.65} opacityTo={1} scaleTarget={1.12}
        style={{ top: -60, left: -70 }}
      />
      <AnimatedBlob
        size={160} color={primaryAlpha(0.08)}
        duration={2700} delay={600} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07}
        style={{ top: '35%', right: -50 }}
      />

      <Box style={{ height: insets.top + 16 }} />
        <BackButton />
        <Box style={{ height: 12 }} />
        <StepBar step={1} />
        <Text variant="label" style={{ paddingHorizontal: 24, marginBottom: 12 }}>STAP 1 VAN 4 — ACCOUNT</Text>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
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
                  { key: 'google'   as const, icon: require('@/assets/images/icons/logo_fb.svg') },
                  { key: 'facebook' as const, icon: require('@/assets/images/icons/logo_google.svg') },
                ].map((s) => (
                  <TouchableOpacity
                    key={s.key}
                    activeOpacity={0.8}
                    style={{ flex: 1 }}
                    onPress={() => handleSocialRegister(s.key)}
                    disabled={socialLoading !== null}
                  >
                    <View style={styles.socialIconBtn}>
                      {socialLoading === s.key
                        ? <ActivityIndicator size="small" color={PRIMARY} />
                        : <Image source={s.icon} style={{ width: 24, height: 24 }} contentFit="contain" />}
                    </View>
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
              <View style={styles.formCard}>

                {/* Email */}
                <Text variant="label" marginBottom="sm">E-MAILADRES</Text>
                <Box style={[styles.inputBox, { marginBottom: 16 }]}>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={handleEmailChange}
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
                    onChangeText={handlePasswordChange}
                    placeholder="Min. 6 tekens"
                    placeholderTextColor="#8a8885"
                    secureTextEntry={!showPassword}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                  <Pressable onPressIn={() => setShowPassword(true)} onPressOut={() => setShowPassword(false)} hitSlop={8}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#8a8885" />
                  </Pressable>
                </Box>

                {/* Confirm password */}
                <Text variant="label" marginBottom="sm">HERHAAL WACHTWOORD</Text>
                <Box style={[styles.inputBox, {
                  borderColor: confirmPassword.length > 0
                    ? (password.trim() === confirmPassword.trim() ? PRIMARY : '#fc6b6b')
                    : primaryAlpha(0.3),
                }]}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={confirmPassword}
                    onChangeText={handleConfirmChange}
                    placeholder="Wachtwoord herhalen"
                    placeholderTextColor="#8a8885"
                    secureTextEntry={!showConfirm}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                  <Pressable onPressIn={() => setShowConfirm(true)} onPressOut={() => setShowConfirm(false)} hitSlop={8}>
                    <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#8a8885" />
                  </Pressable>
                </Box>

              </View>
            </MotiView>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Pinned footer — outside KAV so it doesn't jump */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 320 }}
          style={{ paddingHorizontal: 24, gap: 12, paddingBottom: Math.max(insets.bottom + 10, 24) }}
        >
          {error ? (
            <Text variant="errorText" style={{ textAlign: 'center' }}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.btnPrimary, { opacity: canContinue && !loading ? 1 : 0.4 }]}
            onPress={async () => {
              setError('');
              setLoading(true);
              try {
                await signUp(email.trim(), password.trim());
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
    </Box>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 24, paddingBottom: 16 },
  socialIconBtn: {
    height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: primaryAlpha(0.25) },
  formCard: {
    borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  inputBox: {
    height: 50, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12, borderWidth: 1.5, borderColor: primaryAlpha(0.3),
    paddingHorizontal: 14, gap: 8,
  },
  input: { flex: 1, fontSize: 14, color: '#1a1918', padding: 0 },
  btnPrimary: {
    height: 52, backgroundColor: PRIMARY, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, shadowOpacity: 0.35, elevation: 6,
  },
});
