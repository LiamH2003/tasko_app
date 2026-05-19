import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { OnboardingHeader } from '@/components/ui/OnboardingHeader';
import { Button } from '@/components/ui/Button';
import { signIn } from '@/services/auth';

export default function ParentLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canContinue = email.includes('@') && password.length >= 1;

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      // Auth listener in store sets session → _layout.tsx redirects to /(parent)
    } catch (e: any) {
      setError(e.message ?? 'Inloggen mislukt. Controleer je gegevens.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <OnboardingHeader step={1} totalSteps={4} role="OUDER" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Inloggen</Text>
        <Text style={styles.subtitle}>Welkom terug! Log in op je account.</Text>

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
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.text.muted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          label={loading ? 'Bezig...' : 'Inloggen'}
          onPress={handleLogin}
          disabled={!canContinue || loading}
        />

        <Text style={styles.registerText}>
          Nog geen account?{' '}
          <Text
            style={styles.registerLink}
            onPress={() => router.push('/(onboarding)/parent/account')}
          >
            Registreren
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
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: 8,
    marginTop: 8,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    color: Colors.text.primary,
    fontSize: FontSize.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 24,
  },
  inputFlex: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: FontSize.md,
    padding: 0,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.status.error,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  registerText: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    color: Colors.text.muted,
    marginTop: 16,
  },
  registerLink: {
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
});
