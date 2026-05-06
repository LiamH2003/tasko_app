import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import type { Monster } from '@/types';

const STAGE_EMOJI: Record<Monster['stage'], string> = {
  egg: '🥚',
  baby: '🐣',
  child: '🐱',
  teen: '😺',
  adult: '🦁',
};

interface MonsterDisplayProps {
  monster: Monster;
}

export function MonsterDisplay({ monster }: MonsterDisplayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Text style={styles.emoji}>{STAGE_EMOJI[monster.stage]}</Text>
      </View>
      <Text style={styles.level}>Level {monster.level}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.sm },
  circle: {
    width: 160,
    height: 160,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 80 },
  level: { fontSize: FontSize.sm, color: Colors.text.secondary, fontWeight: FontWeight.medium },
});
