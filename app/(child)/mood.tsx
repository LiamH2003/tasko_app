import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MoodSelector } from '@/components/mood/MoodSelector';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import type { MoodType } from '@/types';

export default function MoodScreen() {
  const [selected, setSelected] = useState<MoodType | null>(null);
  const { logMood } = useAppStore();

  const handleSubmit = () => {
    if (!selected) return;
    logMood(selected);
    setSelected(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hoe voel je je vandaag?</Text>
      <Text style={styles.subtitle}>Er is geen goed of fout antwoord.</Text>

      <MoodSelector selected={selected} onSelect={setSelected} />

      <TouchableOpacity
        style={[styles.button, !selected && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!selected}
      >
        <Text style={styles.buttonText}>Opslaan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.xl, paddingTop: Spacing.xxl },
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
});
