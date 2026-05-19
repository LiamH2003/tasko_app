import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { OnboardingHeader } from '@/components/ui/OnboardingHeader';
import { Button } from '@/components/ui/Button';

const SUGGESTIONS = ['Familie De Smedt', 'Ons gezin', 'Team Thuis'];

export default function ParentFamilySetupScreen() {
  const [parentName, setParentName] = useState('');
  const [familyName, setFamilyName] = useState('');

  const canContinue = parentName.trim().length > 0 && familyName.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <OnboardingHeader step={3} totalSteps={4} role="OUDER" />
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

        <View style={styles.spacer} />
        <Button
          label="Verder"
          onPress={() => router.push('/(onboarding)/parent/success')}
          disabled={!canContinue}
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
});
