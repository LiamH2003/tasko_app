import { Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { BlurView } from 'expo-blur';
import { Box, Text } from '@/components/ui/primitives';
import { BackButton } from '@/components/ui/BackButton';

const SCREEN_W = Dimensions.get('window').width;

const OPTIONS = [
  {
    key: 'parent',
    title: 'Ouder',
    description: 'Log in met e-mail en wachtwoord',
    icon: 'person-outline' as const,
    route: '/(onboarding)/parent/login' as const,
  },
  {
    key: 'child',
    title: 'Kind',
    description: 'Log in met je gezinscode',
    icon: 'people-outline' as const,
    route: '/(onboarding)/child/login' as const,
  },
];

export default function LoginWelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <Box flex={1} backgroundColor="background">

      {/* Blob — top right */}
      <MotiView
        from={{ scale: 1, opacity: 0.65 }}
        animate={{ scale: 1.12, opacity: 1 }}
        transition={{ type: 'timing', duration: 3200, loop: true, repeatReverse: true }}
        style={{
          position: 'absolute', width: 280, height: 280, borderRadius: 140,
          backgroundColor: 'rgba(73,201,213,0.13)', top: -50, right: -70,
        }}
      />
      {/* Blob — bottom left */}
      <MotiView
        from={{ scale: 1, opacity: 0.4 }}
        animate={{ scale: 1.08, opacity: 0.75 }}
        transition={{ type: 'timing', duration: 2700, loop: true, repeatReverse: true, delay: 700 }}
        style={{
          position: 'absolute', width: 200, height: 200, borderRadius: 100,
          backgroundColor: 'rgba(73,201,213,0.09)', bottom: 100, left: -60,
        }}
      />

      <Box style={{ height: insets.top + 16 }} />
      <BackButton />

      <Box flex={1} paddingHorizontal="lg">

        {/* Mascot */}
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 18, stiffness: 100 }}
          style={{ alignItems: 'center', marginTop: 12, marginBottom: 28 }}
        >
          <MotiView
            from={{ translateY: 0 }}
            animate={{ translateY: -7 }}
            transition={{ type: 'timing', duration: 2600, loop: true, repeatReverse: true }}
          >
            <Box style={styles.mascotWrap}>
              <Image
                source={require('@/assets/images/mascot.svg')}
                style={{ width: 68, height: 68 }}
                contentFit="contain"
              />
            </Box>
          </MotiView>
        </MotiView>

        {/* Heading */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 120 }}
        >
          <Text variant="title" marginBottom="xs">Welkom terug</Text>
          <Text variant="subtitle" marginBottom="xl">Wie wil er inloggen?</Text>
        </MotiView>

        {/* Option cards */}
        <Box gap="md">
          {OPTIONS.map((opt, i) => (
            <MotiView
              key={opt.key}
              from={{ opacity: 0, translateY: 18 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 340, delay: 220 + i * 90 }}
            >
              <TouchableOpacity onPress={() => router.push(opt.route)} activeOpacity={0.8}>
                <BlurView intensity={40} tint="light" style={styles.card}>
                  <Box
                    width={46} height={46} borderRadius="md" backgroundColor="iconBg"
                    alignItems="center" justifyContent="center" style={{ flexShrink: 0 }}
                  >
                    <Ionicons name={opt.icon} size={22} color="#49c9d5" />
                  </Box>
                  <Box flex={1}>
                    <Text variant="cardTitle">{opt.title}</Text>
                    <Text variant="cardSub">{opt.description}</Text>
                  </Box>
                  <Ionicons name="chevron-forward" size={18} color="#8a8885" />
                </BlurView>
              </TouchableOpacity>
            </MotiView>
          ))}
        </Box>
      </Box>

      {/* Bottom link */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 400, delay: 440 }}
        style={{ alignItems: 'center', paddingBottom: Math.max(insets.bottom + 16, 28) }}
      >
        <TouchableOpacity onPress={() => router.push('/(onboarding)/role-select')} activeOpacity={0.7}>
          <Text variant="legal">
            Nog geen account?{'  '}
            <Text variant="legalLink">Maak er één aan</Text>
          </Text>
        </TouchableOpacity>
      </MotiView>

    </Box>
  );
}

const styles = StyleSheet.create({
  mascotWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1.5, borderColor: 'rgba(73,201,213,0.3)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#49c9d5', shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16, shadowOpacity: 0.2, elevation: 6,
  },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
});
