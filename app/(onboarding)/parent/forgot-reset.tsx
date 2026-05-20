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

type Rule = { label: string; test: (p: string) => boolean };

const RULES: Rule[] = [
  { label: 'Minimaal 8 tekens',               test: (p) => p.length >= 8 },
  { label: 'Minstens 1 hoofdletter',           test: (p) => /[A-Z]/.test(p) },
  { label: 'Minstens 1 cijfer',                test: (p) => /[0-9]/.test(p) },
  { label: 'Minstens 1 speciaal teken (!@#$…)', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function ForgotResetScreen() {
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <TouchableOpacity style={styles.back} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={16} color={Colors.primary} />
          <Text style={styles.backText}>Terug</Text>
        </TouchableOpacity>

        <StepBar step={3} />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <Text style={styles.stepLabel}>STAP 3 VAN 3 — WACHTWOORD</Text>

          <View style={styles.iconWrap}>
            <Ionicons name="lock-closed-outline" size={42} color={Colors.primary} />
          </View>

          <Text style={styles.title}>Nieuw wachtwoord</Text>
          <Text style={styles.subtitle}>
            Kies een sterk wachtwoord. Je gebruikt het om daarna in te loggen.
          </Text>

          <Text style={styles.label}>NIEUW WACHTWOORD</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              value={password}
              onChangeText={setPassword}
              placeholder="Minimaal 8 tekens..."
              placeholderTextColor={Colors.text.muted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.text.muted} />
            </TouchableOpacity>
          </View>

          <View style={styles.rulesBox}>
            {RULES.map((rule) => {
              const passed = rule.test(password);
              return (
                <View key={rule.label} style={styles.ruleRow}>
                  <View style={[styles.ruleCheck, passed && styles.ruleCheckActive]}>
                    <Ionicons name="checkmark" size={11} color={passed ? Colors.background : 'transparent'} />
                  </View>
                  <Text style={[styles.ruleText, passed && styles.ruleTextActive]}>
                    {rule.label}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.label}>BEVESTIG WACHTWOORD</Text>
          <View style={[styles.inputRow, styles.inputRowSpaced]}>
            <TextInput
              style={styles.inputFlex}
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Typ het opnieuw..."
              placeholderTextColor={Colors.text.muted}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} hitSlop={8}>
              <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.text.muted} />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.spacer} />

          <TouchableOpacity
            style={[styles.btnPrimary, (!canSave || loading) && styles.btnDisabled]}
            onPress={handleSave}
            disabled={!canSave || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={Colors.background} />
              : <Text style={styles.btnPrimaryText}>Wachtwoord opslaan</Text>}
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

  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },

  inputRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  inputRowSpaced: { marginBottom: Spacing.lg },
  inputFlex: { flex: 1, color: Colors.text.primary, fontSize: FontSize.md, padding: 0 },

  rulesBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  ruleCheck: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ruleCheckActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  ruleText: { fontSize: FontSize.sm, color: Colors.text.muted },
  ruleTextActive: { color: Colors.text.secondary },

  errorText: { fontSize: FontSize.sm, color: Colors.status.error, marginBottom: Spacing.sm },

  spacer: { flex: 1, minHeight: Spacing.xl },

  btnPrimary: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnPrimaryText: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.background },
});
