import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { getFamilyByInviteCode } from '@/services/child-device';

export default function ChildLoginScreen() {
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef<(TextInput | null)[]>([null, null, null, null]);

  const handleChange = (text: string, index: number) => {
    const char = text.replace(/[^a-zA-Z0-9]/g, '').slice(-1).toUpperCase();
    const next = [...code];
    next[index] = char;
    setCode(next);
    if (char && index < 3) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      const next = [...code];
      next[index - 1] = '';
      setCode(next);
      inputs.current[index - 1]?.focus();
    }
  };

  const fullCode = `TASKO-${code.join('')}`;
  const canContinue = code.join('').length === 4;

  const handleContinue = async () => {
    setError('');
    setLoading(true);
    try {
      const family = await getFamilyByInviteCode(fullCode);
      if (!family || family.children.length === 0) {
        setError('Ongeldige code. Controleer de code bij je ouder.');
        return;
      }
      router.push({
        pathname: '/(onboarding)/child/who-am-i',
        params: {
          code: fullCode,
          familyName: family.family_name,
          children: JSON.stringify(family.children),
        },
      });
    } catch {
      setError('Er is iets misgegaan. Probeer opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.back} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={18} color={Colors.primary} />
          <Text style={styles.backText}>Terug</Text>
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Log in als kind</Text>
          <Text style={styles.subtitle}>Voer de gezinscode in.</Text>

          <Text style={styles.codeLabel}>GEZINSCODE</Text>
          <Text style={styles.codeHint}>De code staat op het scherm van je ouder.</Text>

          <View style={styles.codeRow}>
            <Text style={styles.prefix}>TASKO–</Text>
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

          <View style={styles.spacer} />

          <TouchableOpacity
            style={[styles.btn, (!canContinue || loading) && styles.btnDisabled]}
            onPress={handleContinue}
            disabled={!canContinue || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={Colors.background} />
              : <Text style={styles.btnText}>Ga verder</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.parentRow}
            onPress={() => router.push('/(onboarding)/parent/login')}
            activeOpacity={0.7}
          >
            <Text style={styles.parentText}>
              Ben je een ouder?{' '}
              <Text style={styles.parentLink}>Log in hier</Text>
            </Text>
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
    paddingBottom: Spacing.md,
  },
  backText: { fontSize: FontSize.md, color: Colors.primary },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.md, color: Colors.text.secondary, marginBottom: Spacing.xl },

  codeLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  codeHint: { fontSize: FontSize.sm, color: Colors.text.muted, marginBottom: Spacing.lg },

  codeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  prefix: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary, marginRight: Spacing.xs },
  codeBox: {
    width: 52,
    height: 60,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  codeBoxFilled: { borderColor: Colors.primary },

  errorText: { fontSize: FontSize.sm, color: Colors.status.error, marginTop: Spacing.sm },

  spacer: { flex: 1, minHeight: Spacing.xxl },

  btn: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.background },

  parentRow: { alignItems: 'center' },
  parentText: { fontSize: FontSize.sm, color: Colors.text.muted },
  parentLink: { color: Colors.primary, fontWeight: FontWeight.medium },
});
