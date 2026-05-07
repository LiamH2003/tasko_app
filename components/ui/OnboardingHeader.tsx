import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight } from '@/constants/theme';

interface OnboardingHeaderProps {
  step: number;
  totalSteps: number;
  role: string;
}

export function OnboardingHeader({ step, totalSteps, role }: OnboardingHeaderProps) {
  const insets = useSafeAreaInsets();
  const fillPct = `${(step / totalSteps) * 100}%`;

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={16} color={Colors.primary} />
        <Text style={styles.backText}>Terug</Text>
      </TouchableOpacity>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: fillPct }]} />
      </View>

      <Text style={styles.stepLabel}>STAP {step} VAN {totalSteps} — {role}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.background,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 16,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.primary,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.iconBg,
    width: '100%',
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.primary,
  },
  stepLabel: {
    fontSize: FontSize.xs,
    color: Colors.primaryDark,
    fontWeight: FontWeight.semibold,
    paddingHorizontal: 24,
    paddingTop: 7,
    paddingBottom: 6,
    letterSpacing: 0.96,
  },
});
