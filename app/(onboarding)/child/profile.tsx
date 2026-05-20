import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { BackButton } from '@/components/ui/BackButton';
import { StepBar } from '@/components/ui/StepBar';
import { Button } from '@/components/ui/Button';
import { updateChild } from '@/services/children';

const MIN_AGE = 6;
const MAX_AGE = 18;

export default function ChildProfileScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [age, setAge] = useState(9);
  const [loading, setLoading] = useState(false);

  const canContinue = name.trim().length >= 2;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ height: insets.top + 16 }} />
      <BackButton />
      <View style={{ height: 12 }} />
      <StepBar step={2} total={4} />
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
          label={loading ? 'Bezig...' : 'Zo heet ik!'}
          onPress={async () => {
            setLoading(true);
            try {
              const childId = await SecureStore.getItemAsync('pendingChildId');
              if (childId) await updateChild(childId, { name: name.trim() });
            } catch {
              // non-fatal — name can be set later
            } finally {
              setLoading(false);
            }
            router.push('/(onboarding)/child/monster-select');
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
