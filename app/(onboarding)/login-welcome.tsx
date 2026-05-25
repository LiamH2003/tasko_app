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
    title: 'Ouder',
    description: 'Log in met e-mail en wachtwoord',
    icon: <Ionicons name="people-outline" size={24} color={PRIMARY} />,
    route: '/(onboarding)/parent/login' as const,
  },
  {
    key: 'child',
    title: 'Kind',
    description: 'Log in met je gezinscode',
    icon: <MaterialCommunityIcons name="emoticon-happy-outline" size={24} color={PRIMARY} />,
    route: '/(onboarding)/child/login' as const,
  },
];

export default function LoginWelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <Box flex={1} backgroundColor="background">

      <AnimatedBlob
        size={280} color={primaryAlpha(0.13)}
        duration={3200} opacityFrom={0.65} opacityTo={1} scaleTarget={1.12}
        style={{ top: -50, right: -70 }}
      />
      <AnimatedBlob
        size={200} color={primaryAlpha(0.09)}
        duration={2700} delay={700} opacityFrom={0.4} opacityTo={0.75} scaleTarget={1.08}
        style={{ bottom: 100, left: -60 }}
      />

      <Box style={{ height: insets.top + 16 }} />
      <BackButton />

      <Box flex={1} paddingHorizontal="lg">

        {/* Heading */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 18, stiffness: 100, delay: 60 }}
          style={{ marginTop: 24 }}
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
                <View style={styles.card}>
                  <Box
                    width={46} height={46} borderRadius="md" backgroundColor="iconBg"
                    alignItems="center" justifyContent="center" style={{ flexShrink: 0 }}
                  >
                    {opt.icon}
                  </Box>
                  <Box flex={1}>
                    <Text variant="cardTitle">{opt.title}</Text>
                    <Text variant="cardSub">{opt.description}</Text>
                  </Box>
                  <Ionicons name="chevron-forward" size={18} color="#8a8885" />
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
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
});
