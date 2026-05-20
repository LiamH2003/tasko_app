import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, FontSize, FontWeight } from '@/constants/theme';

const SCREEN_W = Dimensions.get('window').width;

// Icon filenames are swapped vs. what they visually represent in the design:
// routines_icon.png = crosshair/target  → Focus Mode
// focusmode_icon.png = circular refresh → Slimme Routines
const FEATURES = [
  { icon: require('@/assets/images/icons/routines_icon.png'),  title: 'Focus Mode',      description: 'Dagelijkse routines zonder afleiding' },
  { icon: require('@/assets/images/icons/focusmode_icon.png'), title: 'Slimme Routines', description: 'Gezonde gewoonten, stap voor stap' },
  { icon: require('@/assets/images/icons/mood_icon.png'),      title: 'Mood Tracker',    description: 'Hoe voel je je vandaag?' },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>

      {/* mainscreen_g1: 320×320 radial gradient, opacity 0.18 baked in — Figma node 1:67 */}
      <Image
        source={require('@/assets/images/backgrounds/mainscreen_g1.svg')}
        style={[styles.blobMain, { top: insets.top - 20, left: (SCREEN_W - 320) / 2 }]}
        contentFit="fill"
      />
      {/* mainscreen_g2: 128×128 teal circle at 8% — centred behind the mascot */}
      <Image
        source={require('@/assets/images/backgrounds/mainscreen_g2.svg')}
        style={[styles.blobAccent, { top: insets.top + 64, left: (SCREEN_W - 128) / 2 }]}
        contentFit="fill"
      />

      {/* Safe-area top spacer */}
      <View style={{ height: insets.top }} />

      {/* ── Hero ── */}
      <View style={styles.hero}>

        <View style={styles.mascotWrap}>
          <Image
            source={require('@/assets/images/mascot.svg')}
            style={styles.mascot}
            contentFit="contain"
          />
        </View>

        <Text style={styles.brand}>Tasko Tracker</Text>

        <Text style={styles.tagline}>
          Dagelijkse structuur die rustig aanvoelt,{'\n'}voor elk kind en elk gezin.
        </Text>

        <View style={styles.cards}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.card}>
              <View style={styles.cardIconWrap}>
                <Image source={f.icon} style={styles.cardIcon} contentFit="contain" />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{f.title}</Text>
                <Text style={styles.cardSub}>{f.description}</Text>
              </View>
            </View>
          ))}
        </View>

      </View>

      {/* ── CTA ── */}
      <View style={[styles.cta, { paddingBottom: Math.max(insets.bottom + 8, 24) }]}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push('/(onboarding)/role-select')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>Aan de slag</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push('/(onboarding)/login-welcome')}
          activeOpacity={0.75}
        >
          <Text style={styles.btnSecondaryText}>Ik heb al een account</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          Door verder te gaan ga je akkoord met onze{'\n'}
          <Text style={styles.legalLink}>Gebruiksvoorwaarden</Text>
          <Text style={styles.legalMuted}> en Privacybeleid.</Text>
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  blobMain: {
    position: 'absolute',
    width: 320,
    height: 320,
  },

  blobAccent: {
    position: 'absolute',
    width: 128,
    height: 128,
  },

  // ── Hero ───────────────────────────────────────────────────────────────────
  hero: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  mascotWrap: {
    paddingTop: 48,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    shadowOpacity: 0.35,
  },

  mascot: {
    width: 160,
    height: 160,
  },

  brand: {
    marginTop: 20,
    fontSize: FontSize.xxl,
    fontFamily: 'Fredoka_500Medium',
    fontWeight: FontWeight.medium,
    color: Colors.primary,
    letterSpacing: 0.32,
    textAlign: 'center',
  },

  tagline: {
    marginTop: 8,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 260,
  },

  // ── Feature cards ──────────────────────────────────────────────────────────
  cards: {
    marginTop: 36,
    width: '100%',
    gap: 12,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 14,
    paddingBottom: 15,
    paddingHorizontal: 21,
    backgroundColor: Colors.cardTint,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
  },

  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  cardIcon: {
    width: 20,
    height: 20,
  },

  cardText: {
    flex: 1,
  },

  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    lineHeight: 18.2,
  },

  cardSub: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    color: Colors.text.muted,
    lineHeight: 15.6,
    marginTop: 1,
  },

  // ── CTA ────────────────────────────────────────────────────────────────────
  cta: {
    paddingHorizontal: 32,
    paddingTop: 24,
    gap: 12,
    backgroundColor: Colors.background,
  },

  btnPrimary: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnPrimaryText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.background,
  },

  btnSecondary: {
    height: 48,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  btnSecondaryText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.regular,
    color: Colors.primaryLight,
  },

  legal: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },

  legalLink: {
    color: Colors.primaryDark,
    textDecorationLine: 'underline',
  },

  legalMuted: {
    color: Colors.text.muted,
  },
});
