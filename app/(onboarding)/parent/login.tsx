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
import { signIn } from '@/services/auth';
import { signInWithProvider } from '@/services/oauth';

const SCREEN_W = Dimensions.get('window').width;

export default function ParentLoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [error, setError] = useState('');

  const canLogin = email.includes('@') && password.length >= 1;

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (e: any) {
      setError(e.message ?? 'Inloggen mislukt. Controleer je gegevens.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setError('');
    setSocialLoading(provider);
    try {
      await signInWithProvider(provider);
    } catch (e: any) {
      setError(e.message ?? 'Inloggen mislukt. Probeer opnieuw.');
    } finally {
      setSocialLoading(null);
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
          position: 'absolute', width: 320, height: 320, borderRadius: 160,
          backgroundColor: 'rgba(73,201,213,0.14)', top: -80, right: -80,
        }}
      />
      {/* Blob — bottom left */}
      <MotiView
        from={{ scale: 1, opacity: 0.4 }}
        animate={{ scale: 1.08, opacity: 0.7 }}
        transition={{ type: 'timing', duration: 2800, loop: true, repeatReverse: true, delay: 900 }}
        style={{
          position: 'absolute', width: 180, height: 180, borderRadius: 90,
          backgroundColor: 'rgba(73,201,213,0.09)', bottom: 120, left: -50,
        }}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Box style={{ height: insets.top + 16 }} />
        <BackButton />

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom + 24, 40) }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Heading */}
          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 60 }}
            style={{ marginBottom: 28 }}
          >
            <Text variant="title" marginBottom="xs">Inloggen</Text>
            <Text variant="subtitle">Welkom terug. Kies hoe je wilt inloggen.</Text>
          </MotiView>

          {/* Social buttons */}
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 140 }}
          >
            {[
              { key: 'google' as const,   label: 'Doorgaan met Google',   icon: require('@/assets/images/icons/logo_google.svg') },
              { key: 'facebook' as const, label: 'Doorgaan met Facebook', icon: require('@/assets/images/icons/logo_fb.svg') },
            ].map((s) => (
              <TouchableOpacity
                key={s.key}
                style={styles.socialBtn}
                activeOpacity={0.8}
                onPress={() => handleSocialLogin(s.key)}
                disabled={socialLoading !== null || loading}
              >
                <BlurView intensity={40} tint="light" style={styles.socialInner}>
                  {socialLoading === s.key
                    ? <ActivityIndicator color="#49c9d5" size="small" style={{ width: 22, height: 22 }} />
                    : <Image source={s.icon} style={{ width: 22, height: 22 }} contentFit="contain" />}
                  <Text variant="cardTitle" style={{ fontWeight: '500' }}>{s.label}</Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </MotiView>

          {/* Divider */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 300, delay: 220 }}
            style={styles.dividerRow}
          >
            <Box style={styles.dividerLine} />
            <Text variant="label" style={{ letterSpacing: 0.5 }}>OF MET E-MAIL</Text>
            <Box style={styles.dividerLine} />
          </MotiView>

          {/* Form glass card */}
          <MotiView
            from={{ opacity: 0, translateY: 18 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 360, delay: 260 }}
          >
            <BlurView intensity={40} tint="light" style={styles.formCard}>

              {/* Email */}
              <Text variant="label" marginBottom="sm">E-MAILADRES</Text>
              <Box style={styles.inputBox}>
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
              <Text variant="label" marginBottom="sm" marginTop="md">WACHTWOORD</Text>
              <Box style={styles.inputBox}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Wachtwoord"
                  placeholderTextColor="#8a8885"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={8}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#8a8885" />
                </TouchableOpacity>
              </Box>

              <TouchableOpacity
                style={{ alignSelf: 'flex-end', marginTop: 8 }}
                onPress={() => router.push('/(onboarding)/parent/forgot-password')}
                activeOpacity={0.7}
              >
                <Text variant="backLabel" style={{ fontSize: 12 }}>Wachtwoord vergeten?</Text>
              </TouchableOpacity>

            </BlurView>
          </MotiView>

          {error ? (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: 12 }}
            >
              <Text variant="errorText" style={{ textAlign: 'center' }}>{error}</Text>
            </MotiView>
          ) : null}

          {/* Login button */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 340 }}
            style={{ marginTop: 20, gap: 12 }}
          >
            <TouchableOpacity
              style={[styles.btnPrimary, (!canLogin || loading) && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={!canLogin || loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#e8e5dd" />
                : <Text variant="btnPrimary">Log in</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={{ alignItems: 'center', paddingVertical: 12 }}
              onPress={() => router.push('/(onboarding)/role-select')}
              activeOpacity={0.7}
            >
              <Text variant="legal">
                Nog geen account?{'  '}
                <Text variant="legalLink">Maak er één aan</Text>
              </Text>
            </TouchableOpacity>
          </MotiView>

        </ScrollView>
      </KeyboardAvoidingView>
    </Box>
  );
}

const styles = StyleSheet.create({
  socialBtn: { marginBottom: 10, borderRadius: 16, overflow: 'hidden' },
  socialInner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    height: 52, paddingHorizontal: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dividerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1, height: 1,
    backgroundColor: 'rgba(73,201,213,0.25)',
  },
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
  input: { flex: 1, fontSize: 15, color: '#1a1918', padding: 0 },
  btnPrimary: {
    height: 52, backgroundColor: '#49c9d5', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#49c9d5', shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, shadowOpacity: 0.35, elevation: 6,
  },
  btnDisabled: { opacity: 0.4 },
});
