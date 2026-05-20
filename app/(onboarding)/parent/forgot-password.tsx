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

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      {/* Blob — top centre */}
      <MotiView
        from={{ scale: 1, opacity: 0.65 }}
        animate={{ scale: 1.1, opacity: 1 }}
        transition={{ type: 'timing', duration: 3400, loop: true, repeatReverse: true }}
        style={{
          position: 'absolute', width: 280, height: 280, borderRadius: 140,
          backgroundColor: 'rgba(73,201,213,0.13)', top: -70, left: (SCREEN_W - 280) / 2,
        }}
      />
      {/* Blob — bottom right */}
      <MotiView
        from={{ scale: 1, opacity: 0.35 }}
        animate={{ scale: 1.07, opacity: 0.65 }}
        transition={{ type: 'timing', duration: 2800, loop: true, repeatReverse: true, delay: 700 }}
        style={{
          position: 'absolute', width: 180, height: 180, borderRadius: 90,
          backgroundColor: 'rgba(73,201,213,0.09)', bottom: 100, right: -50,
        }}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Box style={{ height: insets.top + 16 }} />
        <BackButton label="Terug naar inloggen" />
        <Box style={{ height: 12 }} />
        <StepBar step={1} total={3} />

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom + 24, 40), flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Step label + icon */}
          <MotiView
            from={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 100 }}
            style={{ marginBottom: 24 }}
          >
            <Text variant="label" marginBottom="lg">STAP 1 VAN 3 — WACHTWOORD</Text>
            <MotiView
              from={{ translateY: 0 }}
              animate={{ translateY: -6 }}
              transition={{ type: 'timing', duration: 2400, loop: true, repeatReverse: true }}
              style={{ alignSelf: 'flex-start' }}
            >
              <Box style={styles.iconWrap}>
                <Ionicons name="mail-outline" size={38} color="#49c9d5" />
              </Box>
            </MotiView>
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
                placeholder="jouw@email.be"
                placeholderTextColor="#8a8885"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </Box>

            <BlurView intensity={30} tint="light" style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={18} color="#49c9d5" style={{ flexShrink: 0 }} />
              <Text variant="cardSub" style={{ flex: 1, lineHeight: 18 }}>
                We sturen een <Text variant="cardSub" style={{ fontWeight: '600', color: '#4a4845' }}>6-cijferige code</Text> naar dit adres.
                Controleer ook je spam-map.
              </Text>
            </BlurView>
          </MotiView>

          {error ? (
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 12 }}>
              <Text variant="errorText">{error}</Text>
            </MotiView>
          ) : null}

          <Box flex={1} style={{ minHeight: 32 }} />

          {/* CTA */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 260 }}
            style={{ gap: 10 }}
          >
            <TouchableOpacity
              style={[styles.btnPrimary, (!canSubmit || loading) && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit || loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#e8e5dd" />
                : <Text variant="btnPrimary">Verstuur code</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text variant="btnSecondary">Annuleren</Text>
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
    paddingHorizontal: 14, gap: 10,
  },
  input: { flex: 1, fontSize: 15, color: '#1a1918', padding: 0 },
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
  },
});
