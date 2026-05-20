import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { BackButton } from '@/components/ui/BackButton';
import { StepBar } from '@/components/ui/StepBar';
import { Button } from '@/components/ui/Button';
import { createChildWithCode } from '@/services/children';
import { saveParentProfile } from '@/services/auth';

const SUGGESTIONS = ['Familie De Smedt', 'Ons gezin', 'Team Thuis'];

export default function ParentFamilySetupScreen() {
  const insets = useSafeAreaInsets();
  const [parentName, setParentName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canContinue = parentName.trim().length > 0 && familyName.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ height: insets.top + 16 }} />
      <BackButton />
      <View style={{ height: 12 }} />
      <StepBar step={3} total={4} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Even kennismaken</Text>
        <Text style={styles.subtitle}>Snel twee vragen, dan kunnen we beginnen.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Hoe wil je dat we je noemen?</Text>
          <TextInput
            style={styles.input}
            value={parentName}
            onChangeText={setParentName}
            placeholder="Jouw naam of bijnaam"
            placeholderTextColor={Colors.text.muted}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Naam van je gezin</Text>
          <TextInput
            style={styles.input}
            value={familyName}
            onChangeText={setFamilyName}
            placeholder="bijv. Ons gezin"
            placeholderTextColor={Colors.text.muted}
            autoCapitalize="words"
          />
          <Text style={styles.hint}>Een bijnaam of familienaam werkt prima</Text>

          <View style={styles.chips}>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.chip}
                onPress={() => setFamilyName(s)}
                activeOpacity={0.7}
              >
                <Text style={styles.chipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.spacer} />
        <Button
          label={loading ? 'Bezig...' : 'Verder'}
          onPress={async () => {
            setError('');
            setLoading(true);
            try {
              const [child] = await Promise.all([
                createChildWithCode(familyName.trim()),
                saveParentProfile(parentName.trim(), familyName.trim()),
              ]);
              router.push({
                pathname: '/(onboarding)/parent/success',
                params: {
                  parentName: parentName.trim(),
                  familyName: familyName.trim(),
                  inviteCode: child.invite_code ?? '',
                },
              });
            } catch (e: any) {
              setError(e.message ?? 'Er is iets misgegaan. Probeer opnieuw.');
            } finally {
              setLoading(false);
            }
          }}
          disabled={!canContinue || loading}
        />
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
    flexGrow: 1,
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
    marginBottom: 32,
    lineHeight: 22,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
    marginBottom: 8,
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
  hint: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    marginTop: 6,
    marginBottom: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  spacer: {
    flex: 1,
    minHeight: 32,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.status.error,
    textAlign: 'center',
    marginTop: 8,
  },
});
