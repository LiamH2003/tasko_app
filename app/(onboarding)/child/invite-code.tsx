import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { OnboardingHeader } from '@/components/ui/OnboardingHeader';
import { Button } from '@/components/ui/Button';
import { getChildByInviteCode } from '@/services/children';

export default function ChildInviteCodeScreen() {
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef<(TextInput | null)[]>([null, null, null, null]);

  const handleChange = (text: string, index: number) => {
    const char = text.replace(/[^a-zA-Z0-9]/g, '').slice(-1).toUpperCase();
    const next = [...code];
    next[index] = char;
    setCode(next);
    if (char && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      const next = [...code];
      next[index - 1] = '';
      setCode(next);
      inputs.current[index - 1]?.focus();
    }
  };

  const fullCode = code.join('');
  const canContinue = fullCode.length === 4;

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      const child = await getChildByInviteCode(`TASKO-${fullCode}`);
      if (!child) {
        setError('Onbekende code. Controleer de code bij je ouder.');
        return;
      }
      await SecureStore.setItemAsync('childId', child.id);
      router.push('/(onboarding)/child/profile');
    } catch (e: any) {
      setError(e.message ?? 'Er is iets misgegaan. Probeer opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <OnboardingHeader step={1} totalSteps={4} role="KIND" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Heb je een code?</Text>
        <Text style={styles.subtitle}>
          Jouw ouder heeft een code aangemaakt.{'\n'}Type hem hieronder in!
        </Text>

        <View style={styles.codeRow}>
          <Text style={styles.prefix}>TASKO-</Text>
          {code.map((char, i) => (
            <TextInput
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              style={[styles.codeBox, char ? styles.codeBoxFilled : null]}
              value={char}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              maxLength={1}
              autoCapitalize="characters"
              autoCorrect={false}
              keyboardType="default"
              textAlign="center"
              selectionColor={Colors.primary}
            />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.hint}>Vraag de code aan jouw ouder</Text>

        <Button
          label={loading ? 'Bezig...' : 'Bevestigen'}
          onPress={handleConfirm}
          disabled={!canContinue || loading}
        />

        <TouchableOpacity style={styles.noCodeBtn} activeOpacity={0.7}>
          <Text style={styles.noCodeText}>Geen code? Vraag je ouder</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: 36,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  prefix: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginRight: 4,
  },
  codeBox: {
    width: 52,
    height: 56,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  codeBoxFilled: {
    borderColor: Colors.primary,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.status.error,
    marginBottom: 8,
  },
  hint: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
    marginBottom: 24,
  },
  noCodeBtn: {
    alignItems: 'center',
    marginTop: 16,
  },
  noCodeText: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
  },
});
