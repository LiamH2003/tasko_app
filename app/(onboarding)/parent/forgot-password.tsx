import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

function StepBar({ step }: { step: number }) {
  return (
    <View style={styles.stepBar}>
      {[1, 2, 3].map((s) => (
        <View key={s} style={[styles.stepSegment, s <= step && styles.stepActive]} />
      ))}
    </View>
  );
}

export default function ForgotPasswordScreen() {
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <TouchableOpacity style={styles.back} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={16} color={Colors.primary} />
          <Text style={styles.backText}>Terug naar inloggen</Text>
        </TouchableOpacity>

        <StepBar step={1} />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <Text style={styles.stepLabel}>STAP 1 VAN 3 — WACHTWOORD</Text>

          <View style={styles.iconWrap}>
            <Ionicons name="mail-outline" size={42} color={Colors.primary} />
          </View>

          <Text style={styles.title}>Wachtwoord vergeten?</Text>
          <Text style={styles.subtitle}>
            Geen probleem! Vul je e-mailadres in en we sturen je een code om je wachtwoord te resetten.
          </Text>

          <Text style={styles.label}>E-MAILADRES</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="jouw@email.be"
            placeholderTextColor={Colors.text.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              We sturen een <Text style={styles.infoBold}>6-cijferige code</Text> naar dit adres. Controleer ook je spam-map als je niets ziet na een minuutje.
            </Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.spacer} />

          <TouchableOpacity
            style={[styles.btnPrimary, (!canSubmit || loading) && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={Colors.background} />
              : <Text style={styles.btnPrimaryText}>Verstuur code</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary} onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.btnSecondaryText}>Annuleren</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },

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
  stepSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.surface,
  },
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

  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  input: {
    height: 52,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    color: Colors.text.primary,
    fontSize: FontSize.md,
    marginBottom: Spacing.md,
  },

  infoBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoText: { fontSize: FontSize.sm, color: Colors.text.muted, lineHeight: 19 },
  infoBold: { color: Colors.text.secondary, fontWeight: FontWeight.semibold },

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
