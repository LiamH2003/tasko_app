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
    title: 'Ik ben een ouder',
    description: 'Ik wil Tasko instellen voor mijn kind',
    icon: <Ionicons name="person-outline" size={22} color="#49c9d5" />,
    route: '/(onboarding)/parent/account' as const,
  },
  {
    key: 'child',
    title: 'Ik ben een kind',
    description: 'Mijn ouder heeft een code voor mij klaar',
    icon: (
      <Image
        source={require('@/assets/images/mascot.svg')}
        style={{ width: 22, height: 22 }}
        contentFit="contain"
      />
    ),
    route: '/(onboarding)/child/invite-code' as const,
  },
];

export default function RoleSelectScreen() {
  const insets = useSafeAreaInsets();

  return (
    <Box flex={1} backgroundColor="background">

      {/* Blob — top left */}
      <MotiView
        from={{ scale: 1, opacity: 0.6 }}
        animate={{ scale: 1.1, opacity: 0.95 }}
        transition={{ type: 'timing', duration: 3400, loop: true, repeatReverse: true }}
        style={{
          position: 'absolute', width: 300, height: 300, borderRadius: 150,
          backgroundColor: 'rgba(73,201,213,0.12)', top: -80, left: -80,
        }}
      />
      {/* Blob — mid right */}
      <MotiView
        from={{ scale: 1, opacity: 0.35 }}
        animate={{ scale: 1.07, opacity: 0.65 }}
        transition={{ type: 'timing', duration: 2900, loop: true, repeatReverse: true, delay: 500 }}
        style={{
          position: 'absolute', width: 160, height: 160, borderRadius: 80,
          backgroundColor: 'rgba(73,201,213,0.1)', top: '40%', right: -50,
        }}
      />
      {/* Blob — bottom centre */}
      <MotiView
        from={{ scale: 1, opacity: 0.3 }}
        animate={{ scale: 1.05, opacity: 0.55 }}
        transition={{ type: 'timing', duration: 3100, loop: true, repeatReverse: true, delay: 1200 }}
        style={{
          position: 'absolute', width: 220, height: 220, borderRadius: 110,
          backgroundColor: 'rgba(73,201,213,0.08)', bottom: -40, left: (SCREEN_W - 220) / 2,
        }}
      />

      <Box style={{ height: insets.top + 16 }} />
      <BackButton />

      <Box flex={1} paddingHorizontal="lg">

        {/* Heading */}
        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 18, stiffness: 100, delay: 60 }}
          style={{ marginTop: 24, marginBottom: 32 }}
        >
          <Text variant="eyebrow" marginBottom="sm" style={{ textAlign: 'left' }}>NIEUW BIJ TASKO</Text>
          <Text variant="title" marginBottom="xs">Wie ben jij?</Text>
          <Text variant="subtitle">
            Kies je rol zodat we Tasko goed voor je kunnen instellen.
          </Text>
        </MotiView>

        {/* Role cards */}
        <Box gap="md">
          {OPTIONS.map((opt, i) => (
            <MotiView
              key={opt.key}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 360, delay: 180 + i * 100 }}
            >
              <TouchableOpacity onPress={() => router.push(opt.route)} activeOpacity={0.8}>
                <BlurView intensity={40} tint="light" style={styles.card}>
                  <Box
                    width={48} height={48} borderRadius="md" backgroundColor="iconBg"
                    alignItems="center" justifyContent="center" style={{ flexShrink: 0 }}
                  >
                    {opt.icon}
                  </Box>
                  <Box flex={1}>
                    <Text variant="cardTitle" style={{ fontSize: 15 }}>{opt.title}</Text>
                    <Text variant="cardSub">{opt.description}</Text>
                  </Box>
                  <Box style={styles.arrowWrap}>
                    <Ionicons name="chevron-forward" size={16} color="#49c9d5" />
                  </Box>
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
        transition={{ type: 'timing', duration: 400, delay: 420 }}
        style={{ alignItems: 'center', paddingBottom: Math.max(insets.bottom + 16, 28) }}
      >
        <TouchableOpacity onPress={() => router.push('/(onboarding)/login-welcome')} activeOpacity={0.7}>
          <Text variant="legal">
            Al een account?{'  '}
            <Text variant="legalLink">Log in</Text>
          </Text>
        </TouchableOpacity>
      </MotiView>

    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 16, paddingHorizontal: 16,
    borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  arrowWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(73,201,213,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
});
