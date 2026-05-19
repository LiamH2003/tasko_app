import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { OnboardingHeader } from '@/components/ui/OnboardingHeader';
import { Button } from '@/components/ui/Button';

const MIN_AGE = 6;
const MAX_AGE = 18;

export default function ChildProfileScreen() {
  const [name, setName] = useState('');
  const [age, setAge] = useState(9);

  const canContinue = name.trim().length >= 2;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <OnboardingHeader step={2} totalSteps={4} role="KIND" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Leuk je te ontmoeten!</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Hoe wil je dat Tasko je noemt?</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Jouw naam of bijnaam"
            placeholderTextColor={Colors.text.muted}
            autoCapitalize="words"
            maxLength={20}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Hoe oud ben je?</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setAge((a) => Math.max(MIN_AGE, a - 1))}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <View style={styles.stepValue}>
              <Text style={styles.stepValueText}>{age}</Text>
            </View>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setAge((a) => Math.min(MAX_AGE, a + 1))}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <Button
          label="Zo heet ik!"
          onPress={() => router.push('/(onboarding)/child/monster-select')}
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
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: 28,
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
  stepper: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    overflow: 'hidden',
  },
  stepBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.border,
  },
  stepValue: {
    width: 56,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
  },
  stepValueText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
});
