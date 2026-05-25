import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { BackButton } from '@/components/ui/BackButton';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { PRIMARY, primaryAlpha } from '@/constants/palette';

const OPTIONS = [
  {
    key: 'parent',
    title: 'Ik ben een ouder',
    description: 'Ik wil Tasko instellen voor mijn kind',
    icon: <Ionicons name="people-outline" size={24} color={PRIMARY} />,
    route: '/(onboarding)/parent/account' as const,
  },
  {
    key: 'child',
    title: 'Ik ben een kind',
    description: 'Mijn ouder heeft een code voor mij klaar',
    icon: <MaterialCommunityIcons name="emoticon-happy-outline" size={24} color={PRIMARY} />,
    route: '/(onboarding)/child/invite-code' as const,
  },
];

export default function RoleSelectScreen() {
  const insets = useSafeAreaInsets();

  return (
    <Box flex={1} backgroundColor="background">

      <AnimatedBlob
        size={300} color={primaryAlpha(0.12)}
        duration={3400} opacityFrom={0.6} opacityTo={0.95} scaleTarget={1.1}
        style={{ top: -80, left: -80 }}
      />
      <AnimatedBlob
        size={160} color={primaryAlpha(0.1)}
        duration={2900} delay={500} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07}
        style={{ top: '40%', right: -50 }}
      />
      <AnimatedBlob
        size={220} color={primaryAlpha(0.08)}
        duration={3100} delay={1200} opacityFrom={0.3} opacityTo={0.55} scaleTarget={1.05}
        style={{ bottom: -40, left: '50%', marginLeft: -110 }}
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
          <Text variant="eyebrow" marginBottom="sm" style={{ textAlign: 'left', color: '#6b6560' }}>NIEUW BIJ TASKO</Text>
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
                <View style={styles.card}>
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
                    <Ionicons name="chevron-forward" size={16} color={PRIMARY} />
                  </Box>
                </View>
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
    borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  arrowWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: primaryAlpha(0.12),
    alignItems: 'center', justifyContent: 'center',
  },
});
