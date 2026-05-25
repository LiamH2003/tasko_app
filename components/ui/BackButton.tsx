import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Box, Text } from './primitives';
import { PRIMARY } from '@/constants/palette';

interface BackButtonProps {
  label?: string;
  onPress?: () => void;
}

export function BackButton({ label = 'Terug', onPress }: BackButtonProps) {
  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={onPress ?? (() => router.back())}
      activeOpacity={0.7}
    >
      <View style={styles.pill}>
        <Box flexDirection="row" alignItems="center" gap="xs">
          <Ionicons name="chevron-back" size={16} color={PRIMARY} />
          <Text variant="backLabel">{label}</Text>
        </Box>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { paddingHorizontal: 24, paddingVertical: 8, alignSelf: 'flex-start' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
});
