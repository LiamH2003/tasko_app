import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MoodSelector } from '@/components/mood/MoodSelector';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { submitMood } from '@/services/child-device';
import type { MoodType } from '@/types';

export default function MoodScreen() {
  const { childId } = useAppStore();
  const [selected, setSelected] = useState<MoodType | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit() {
    if (!selected || !childId) return;
    setSaving(true);
    try {
      await submitMood(childId, selected);
      setSaved(true);
    } catch {
      // non-fatal, still show saved to child
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.savedContainer}>
          <Text style={styles.savedEmoji}>🎉</Text>
          <Text style={styles.savedTitle}>Bedankt!</Text>
          <Text style={styles.savedSubtitle}>Je monster weet hoe je je voelt.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.inner}>
        <Text style={styles.title}>Hoe voel je je vandaag?</Text>
        <Text style={styles.subtitle}>Er is geen goed of fout antwoord.</Text>

        <MoodSelector selected={selected} onSelect={setSelected} />

        <TouchableOpacity
          style={[styles.button, (!selected || saving) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!selected || saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <Text style={styles.buttonText}>Opslaan</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, padding: Spacing.xl, paddingTop: Spacing.xxl },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.md, color: Colors.text.secondary, marginBottom: Spacing.xxl },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: Colors.background, fontSize: FontSize.md, fontWeight: FontWeight.semibold },

  savedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  savedEmoji: { fontSize: 64, marginBottom: Spacing.lg },
  savedTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: Spacing.sm },
  savedSubtitle: { fontSize: FontSize.md, color: Colors.text.secondary, textAlign: 'center' },
});
