import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Box, Text } from './primitives';

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
      <Box flexDirection="row" alignItems="center" gap="xs">
        <Ionicons name="chevron-back" size={16} color="#49c9d5" />
        <Text variant="backLabel">{label}</Text>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { paddingHorizontal: 24, paddingVertical: 8 },
});
