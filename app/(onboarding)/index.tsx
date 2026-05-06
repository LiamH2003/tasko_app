import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontWeight } from '@/constants/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

const FEATURES: { icon: IoniconName; title: string; description: string }[] = [
  { icon: 'scan-outline',    title: 'Focus Mode',      description: 'Dagelijkse routines zonder afleiding' },
  { icon: 'refresh-outline', title: 'Slimme Routines', description: 'Gezonde gewoonten, stap voor stap' },
  { icon: 'happy-outline',   title: 'Mood Tracker',    description: 'Hoe voel je je vandaag?' },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 1750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,   duration: 1750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [floatAnim]);

  return (
    <View style={styles.container}>

      {/* Status bar spacer — matches HTML .status-bar height */}
      <View style={{ height: insets.top }} />

      {/* ── HERO — flex: 1, identical to HTML .hero ── */}
      <View style={styles.hero}>

        {/* Decorative blob — top: -20 bleeds slightly into status bar, matching HTML */}
        <View style={styles.blob} />

        {/* Mascot — margin-top: 48 from hero top, matching HTML */}
        <Animated.View style={[styles.mascotWrapper, { transform: [{ translateY: floatAnim }] }]}>
          <Image
            source={require('@/assets/images/mascot.svg')}
            style={styles.mascotImage}
            contentFit="contain"
          />
        </Animated.View>

        {/* margin-top: 20, font-size: 32, matching HTML .hero__brand */}
        <Text style={styles.brand}>Tasko Tracker</Text>

        {/* margin-top: 8, font-size: 14, matching HTML .hero__tagline */}
        <Text style={styles.tagline}>
          Help je kind focussen, routines opbouwen en zichzelf beter begrijpen.
        </Text>

        {/* margin-top: 36, gap: 12, matching HTML .pills */}
        <View style={styles.pills}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.pill}>
              <View style={styles.pillIcon}>
                <Ionicons name={f.icon} size={20} color={Colors.primary} />
              </View>
              <View style={styles.pillText}>
                <Text style={styles.pillTitle}>{f.title}</Text>
                <Text style={styles.pillSub}>{f.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ── CTA — fixed at bottom, matching HTML .cta ── */}
      <View style={[styles.cta, { paddingBottom: Math.max(insets.bottom + 8, 40) }]}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push('/(onboarding)/profile-setup')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>Aan de slag</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondary} activeOpacity={0.7}>
          <Text style={styles.btnSecondaryText}>Ik heb al een account</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          Door verder te gaan ga je akkoord met onze{' '}
          <Text style={styles.legalLink}>Gebruiksvoorwaarden</Text>
          {' '}en{' '}
          <Text style={styles.legalLink}>Privacybeleid</Text>.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Hero ─────────────────────────────────────────────────────
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 32,
  },

  // Radial-gradient blob approximated as dark teal circle
  // top: -20 matches HTML: bleeds 20px above hero into status bar area
  blob: {
    position: 'absolute',
    top: -20,
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: Colors.heroBlob,
  },

  // margin-top: 48 matches HTML .mascot margin-top
  mascotWrapper: {
    marginTop: 48,
  },

  mascotImage: {
    width: 160,
    height: 160,
  },

  // ── Typography ───────────────────────────────────────────────
  brand: {
    marginTop: 20,
    fontSize: 32,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
    letterSpacing: 0.4,
    textAlign: 'center',
  },

  tagline: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: FontWeight.regular,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 260,
  },

  // ── Feature pills ────────────────────────────────────────────
  pills: {
    marginTop: 36,
    width: '100%',
    gap: 12,
  },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: Colors.cardTint,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: 12,
  },

  pillIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  pillText: { flex: 1 },

  pillTitle: {
    fontSize: 14,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    lineHeight: 18,
  },

  pillSub: {
    fontSize: 12,
    fontWeight: FontWeight.regular,
    color: Colors.text.muted,
    marginTop: 2,
    lineHeight: 16,
  },

  // ── CTA ──────────────────────────────────────────────────────
  cta: {
    paddingHorizontal: 32,
    paddingTop: 24,
    gap: 12,
    backgroundColor: Colors.background,
  },

  btnPrimary: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#edfafb',
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 3,
    shadowOpacity: 0.2,
    elevation: 3,
  },

  btnPrimaryText: {
    fontSize: 16,
    fontWeight: FontWeight.regular,
    color: Colors.background,
  },

  btnSecondary: {
    height: 48,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnSecondaryText: {
    fontSize: 16,
    fontWeight: FontWeight.regular,
    color: Colors.primaryLight,
  },

  legal: {
    fontSize: 11,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },

  legalLink: {
    color: Colors.primaryDark,
    textDecorationLine: 'underline',
  },
});
