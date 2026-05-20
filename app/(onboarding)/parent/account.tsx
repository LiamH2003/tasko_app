import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import { OnboardingHeader } from '@/components/ui/OnboardingHeader';
import { signUp } from '@/services/auth';
import { supabase } from '@/lib/supabase';

export default function ParentAccountScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canContinue =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.includes('@') &&
    password.length >= 6 &&
    password === confirmPassword;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <OnboardingHeader step={1} totalSteps={4} role="OUDER" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Jouw account</Text>
        <Text style={styles.subtitle}>Maak een account aan om te beginnen.</Text>

        <View style={styles.row}>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Voornaam</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Jan"
              placeholderTextColor={Colors.text.muted}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Achternaam</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Doe"
              placeholderTextColor={Colors.text.muted}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>E-mailadres</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="jan@voorbeeld.be"
            placeholderTextColor={Colors.text.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Wachtwoord</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              value={password}
              onChangeText={setPassword}
              placeholder="Wachtwoord"
              placeholderTextColor={Colors.text.muted}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={8}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.text.muted}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Herhaal wachtwoord</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Wachtwoord herhalen"
              placeholderTextColor={Colors.text.muted}
              secureTextEntry={!showConfirm}
            />
            <TouchableOpacity onPress={() => setShowConfirm(v => !v)} hitSlop={8}>
              <Ionicons
                name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.text.muted}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.orText}>Of registreer met...</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
            <Image
              source={require('@/assets/images/icons/logo_fb.svg')}
              style={styles.socialIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
            <Image
              source={require('@/assets/images/icons/logo_google.svg')}
              style={styles.socialIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
            <Image
              source={require('@/assets/images/icons/logo_apple.svg')}
              style={styles.socialIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
            ? <ActivityIndicator color={Colors.background} />
            : <Text style={styles.btnPrimaryText}>Maak account aan</Text>}
        </TouchableOpacity>

        <Text style={styles.loginText}>
          Al een account?{' '}
          <Text
            style={styles.loginLink}
            onPress={() => router.push('/(onboarding)/parent/login')}
          >
            Log in
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Fredoka_500Medium',
    color: Colors.text.primary,
    lineHeight: 33.6,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    lineHeight: 21,
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.md,
  },
  field: {
    marginBottom: Spacing.md,
  },
  fieldHalf: {
    flex: 1,
  },
  label: {
    fontSize: FontSize.lg,
    color: Colors.primaryDark,
    marginBottom: Spacing.sm,
  },
  input: {
    height: 48,
    backgroundColor: Colors.backgroundDark,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    paddingHorizontal: Spacing.md,
    color: Colors.text.primary,
    fontSize: FontSize.lg,
  },
  inputRow: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundDark,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  inputFlex: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    padding: 0,
  },
  orText: {
    textAlign: 'center',
    fontSize: FontSize.md,
    color: Colors.text.muted,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: Spacing.lg,
  },
  socialBtn: {
    width: 70,
    height: 41,
    borderRadius: Radius.lg,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e3e3e3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 26,
    height: 26,
  },
  btnPrimary: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnPrimaryText: {
    fontSize: FontSize.lg,
    color: Colors.background,
  },
  loginText: {
    textAlign: 'center',
    fontSize: FontSize.md,
    color: Colors.text.muted,
    marginBottom: 4,
  },
  loginLink: {
    color: Colors.primaryDark,
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.status.error,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
});
