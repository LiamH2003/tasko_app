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
import { PRIMARY, primaryAlpha } from '@/constants/palette';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const canSubmit = email.includes('@') && email.includes('.');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (err) throw err;
      router.push({ pathname: '/(onboarding)/parent/forgot-verify', params: { email } });
    } catch (e: any) {
      setError(e.message ?? 'Er is iets misgegaan. Probeer opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} backgroundColor="background">

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <AnimatedBlob
          size={300} color={primaryAlpha(0.13)}
          duration={3500} opacityFrom={0.65} opacityTo={1} scaleTarget={1.12}
          style={{ top: -60, left: -70 }}
        />
        <AnimatedBlob
          size={160} color={primaryAlpha(0.08)}
          duration={2700} delay={600} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07}
          style={{ bottom: 100, right: -50 }}
        />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Box style={{ height: insets.top + 16 }} />
        <BackButton label="Terug naar inloggen" />
        <Box style={{ height: 12 }} />
        <StepBar step={1} total={4} />
        <Text variant="label" style={{ paddingHorizontal: 24, marginBottom: 12 }}>STAP 1 VAN 4 — WACHTWOORD</Text>

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
                <Ionicons name="mail-outline" size={44} color={PRIMARY} />
              </Box>
            </AnimatedFloat>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 100 }}
            style={{ marginBottom: 28 }}
          >
            <Text variant="title" marginBottom="xs">Wachtwoord vergeten?</Text>
            <Text variant="subtitle">
              Geen probleem! Vul je e-mailadres in en we sturen je een code om je wachtwoord te resetten.
            </Text>
          </MotiView>

          {/* Input */}
          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 180 }}
          >
            <Text variant="label" marginBottom="sm">E-MAILADRES</Text>
            <Box style={[styles.inputBox, { marginBottom: 16 }]}>
              <Ionicons name="mail-outline" size={18} color="#8a8885" />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                onBlur={(e) => { setEmail(e.nativeEvent.text ?? email); setTouched(true); }}
                placeholder="jouw@email.be"
                placeholderTextColor="#8a8885"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
              />
            </Box>

            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={18} color={PRIMARY} style={{ flexShrink: 0 }} />
              <Text variant="cardSub" style={{ flex: 1, lineHeight: 18 }}>
                We sturen een <Text variant="cardSub" style={{ fontWeight: '600', color: '#4a4845' }}>6-cijferige code</Text> naar dit adres.
                Controleer ook je spam-map.
              </Text>
            </View>
          </MotiView>

          {error ? (
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 12 }}>
              <Text variant="errorText">{error}</Text>
            </MotiView>
          ) : null}

        </ScrollView>
      </KeyboardAvoidingView>

      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 340, delay: 260 }}
        style={{ paddingHorizontal: 24, gap: 12, paddingBottom: Math.max(insets.bottom + 10, 24) }}
      >
        <TouchableOpacity
          style={[styles.btnPrimary, { opacity: canSubmit && !loading ? 1 : 0.4 }]}
          onPress={handleSubmit}
          disabled={!canSubmit || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#e8e5dd" />
            : <Text variant="btnPrimary">Verstuur code</Text>}
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
  inputBox: {
    height: 50, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12, borderWidth: 1.5, borderColor: primaryAlpha(0.3),
    paddingHorizontal: 14, gap: 10,
  },
  input: { flex: 1, fontSize: 15, color: '#1a1918', padding: 0 },
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
