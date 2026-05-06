import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { OnboardingHeader } from '@/components/ui/OnboardingHeader';
import { Button } from '@/components/ui/Button';

type IoniconName = keyof typeof Ionicons.glyphMap;

const FEATURES: { icon: IoniconName; title: string; detail: string }[] = [
  { icon: 'refresh-outline',  title: 'Jouw routines bijhouden', detail: 'plan en volg je dag' },
  { icon: 'happy-outline',    title: 'Zien hoe je je voelt',    detail: 'Tasko luistert altijd' },
  { icon: 'scan-outline',     title: 'Focussen zonder afleiding', detail: 'rust in je hoofd' },
];

// Replace with actual child name from store/params when wired up
const CHILD_NAME = 'Sam';

export default function ChildWelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <OnboardingHeader step={4} totalSteps={7} role="TASKO-GEBRUIKER" />
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/mascot.svg')}
          style={styles.mascot}
          contentFit="contain"
        />

        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>
            "Aangenaam kennis te maken, {CHILD_NAME}!"
          </Text>
        </View>

        <Text style={styles.title}>Welkom bij Tasko, {CHILD_NAME}!</Text>
        <Text style={styles.subtitle}>
          Jouw ruimte is klaar. Laten we beginnen{'\n'}met je eerste routine!
        </Text>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={18} color={Colors.primary} />
              </View>
              <Text style={styles.featureText}>
                <Text style={styles.featureBold}>{f.title}</Text>
                {' — '}
                <Text style={styles.featureDetail}>{f.detail}</Text>
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 8, 32) }]}>
        <Button
          label="Start mijn avontuur"
          onPress={() => router.replace('/(child)')}
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
    paddingHorizontal: Spacing.xl,
    paddingTop: 8,
  },
  mascot: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  bubble: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
    width: '100%',
  },
  bubbleText: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  title: {
    fontSize: 26,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  features: {
    width: '100%',
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  featureBold: {
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  featureDetail: {
    color: Colors.text.secondary,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 16,
  },
});
