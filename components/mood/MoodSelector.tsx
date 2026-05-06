import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import type { MoodType } from '@/types';

const MOODS: { type: MoodType; emoji: string; label: string }[] = [
  { type: 'great', emoji: '😄', label: 'Super' },
  { type: 'good', emoji: '🙂', label: 'Goed' },
  { type: 'okay', emoji: '😐', label: 'Zo-zo' },
  { type: 'sad', emoji: '😔', label: 'Verdrietig' },
  { type: 'angry', emoji: '😤', label: 'Boos' },
];

interface MoodSelectorProps {
  selected: MoodType | null;
  onSelect: (mood: MoodType) => void;
}

export function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  return (
    <View style={styles.container}>
      {MOODS.map(({ type, emoji, label }) => (
        <TouchableOpacity
          key={type}
          style={[styles.option, selected === type && styles.optionSelected]}
          onPress={() => onSelect(type)}
        >
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={[styles.label, selected === type && styles.labelSelected]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  option: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  optionSelected: { borderColor: Colors.primary, backgroundColor: Colors.surface },
  emoji: { fontSize: 32 },
  label: { fontSize: FontSize.xs, color: Colors.text.secondary, fontWeight: FontWeight.medium },
  labelSelected: { color: Colors.primary },
});
