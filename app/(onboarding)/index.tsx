import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { AnimatedFloat } from '@/components/ui/AnimatedFloat';
import { PRIMARY, primaryAlpha } from '@/constants/palette';

const FEATURES = [
  { icon: require('@/assets/images/icons/routines_icon.png'),  title: 'Focus Mode',      description: 'Dagelijkse routines zonder afleiding' },
  { icon: require('@/assets/images/icons/focusmode_icon.png'), title: 'Slimme Routines', description: 'Gezonde gewoonten, stap voor stap' },
  { icon: require('@/assets/images/icons/mood_icon.png'),      title: 'Mood Tracker',    description: 'Hoe voel je je vandaag?' },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <Box flex={1} backgroundColor="background">

      <AnimatedBlob
        size={380} color={primaryAlpha(0.14)}
        duration={3600} opacityFrom={0.7} opacityTo={1} scaleTarget={1.1}
        style={{ top: -60, left: '50%', marginLeft: -190 }}
      />
      <AnimatedBlob
        size={200} color={primaryAlpha(0.09)}
        duration={2800} delay={800} opacityFrom={0.5} opacityTo={0.8} scaleTarget={1.06}
        style={{ bottom: 120, right: -60 }}
      />

      <Box style={{ height: insets.top }} />

      {/* ── Mascot + brand ── */}
      <MotiView
        from={{ opacity: 0, translateY: -16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 18, stiffness: 100, delay: 0 }}
        style={{ alignItems: 'center', paddingTop: 40 }}
      >
        <AnimatedFloat amplitude={9} duration={2600}>
          <Box style={styles.mascotWrap}>
            <Image
              source={require('@/assets/images/mascot.svg')}
              style={{ width: 130, height: 130 }}
              contentFit="contain"
            />
          </Box>
        </AnimatedFloat>

        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 380, delay: 200 }}
          style={{ alignItems: 'center' }}
        >
          <Text
            variant="eyebrow"
            marginTop="md"
            marginBottom="xs"
            style={{ color: '#6b6560', letterSpacing: 2 }}
          >
            JOUW DAGELIJKS AVONTUUR
          </Text>
          <Text variant="brand" marginBottom="sm">Tasko Tracker</Text>
          <Text variant="tagline" style={{ maxWidth: 260 }}>
            {'Dagelijkse structuur die rustig aanvoelt,\nvoor elk kind en elk gezin.'}
          </Text>
        </MotiView>
      </MotiView>

      {/* ── Feature cards ── */}
      <Box flex={1} paddingHorizontal="lg" justifyContent="center" gap="sm" marginTop="lg">
        {FEATURES.map((f, i) => (
          <MotiView
            key={f.title}
            from={{ opacity: 0, translateY: 18 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 320 + i * 80 }}
          >
            <View style={styles.card}>
              <Box
                width={40} height={40} borderRadius="md"
                backgroundColor="iconBg"
                alignItems="center" justifyContent="center"
                style={{ flexShrink: 0 }}
              >
                <Image source={f.icon} style={{ width: 21, height: 21 }} contentFit="contain" tintColor={PRIMARY} />
              </Box>
              <Box flex={1}>
                <Text variant="cardTitle">{f.title}</Text>
                <Text variant="cardSub">{f.description}</Text>
              </Box>
            </View>
          </MotiView>
        ))}
      </Box>

      {/* ── CTA ── */}
      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 360, delay: 580 }}
      >
        <Box
          paddingHorizontal="lg"
          paddingTop="xl"
          gap="sm"
          style={{ paddingBottom: Math.max(insets.bottom + 8, 24) }}
        >
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push('/(onboarding)/role-select')}
            activeOpacity={0.85}
          >
            <Text variant="btnPrimary">Aan de slag</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push('/(onboarding)/login-welcome')}
            activeOpacity={0.75}
          >
            <Text variant="btnSecondary">Ik heb al een account</Text>
          </TouchableOpacity>

          <Text variant="legal">
            Door verder te gaan ga je akkoord met onze{'\n'}
            <Text variant="legalLink">Gebruiksvoorwaarden</Text>
            <Text variant="legal"> en Privacybeleid.</Text>
          </Text>
        </Box>
      </MotiView>

    </Box>
  );
}

const styles = StyleSheet.create({
  mascotWrap: {
    width: 164,
    height: 164,
    borderRadius: 82,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1.5,
    borderColor: primaryAlpha(0.3),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    shadowOpacity: 0.22,
    elevation: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  btnPrimary: {
    height: 52,
    backgroundColor: PRIMARY,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.35,
    elevation: 6,
  },
  btnSecondary: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: primaryAlpha(0.4),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});
