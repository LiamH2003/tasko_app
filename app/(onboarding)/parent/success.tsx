import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { OnboardingHeader } from '@/components/ui/OnboardingHeader';
import { Button } from '@/components/ui/Button';
import { completeOnboarding } from '@/services/auth';

export default function ParentSuccessScreen() {
  const insets = useSafeAreaInsets();
  const { parentName, familyName, inviteCode } = useLocalSearchParams<{
    parentName: string;
    familyName: string;
    inviteCode: string;
  }>();

  return (
    <View style={styles.container}>
      <OnboardingHeader step={4} totalSteps={4} role="OUDER" />
      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={52} color={Colors.status.success} />
        </View>

        <Text style={styles.title}>Je bent klaar, {parentName}!</Text>
        <Text style={styles.description}>
          Jouw gezinsruimte is aangemaakt. Zodra je kind de code invoert, verschijnt hij hier.
        </Text>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardIconBox}>
              <Ionicons name="key-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.cardTexts}>
              <Text style={styles.cardLabel}>Gezin</Text>
              <Text style={styles.cardValue}>{familyName}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardRow}>
            <View style={styles.cardIconBox}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.cardTexts}>
              <Text style={styles.cardLabel}>Uitnodigingscode voor kind</Text>
              <Text style={styles.cardValue}>{inviteCode}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 8, 32) }]}>
        <Button
          label="Ga naar mijn dashboard"
          onPress={async () => {
            await completeOnboarding();
            router.replace('/(parent)');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(72,187,120,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 300,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTexts: {
    flex: 1,
  },
  cardLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    marginBottom: 2,
  },
  cardValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 16,
  },
});
