import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from './primitives';
import { PRIMARY, PRIMARY_DARK, primaryAlpha } from '@/constants/palette';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ label, onPress, variant = 'primary', disabled, loading }: ButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      style={[styles.base, isPrimary ? styles.primary : styles.secondary, (disabled || loading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading
        ? <ActivityIndicator color={isPrimary ? '#e8e5dd' : PRIMARY_DARK} />
        : <Text variant={isPrimary ? 'btnPrimary' : 'btnSecondary'}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.35,
    elevation: 6,
  },
  secondary: {
    borderWidth: 1.5,
    borderColor: primaryAlpha(0.4),
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  disabled: { opacity: 0.4 },
});
