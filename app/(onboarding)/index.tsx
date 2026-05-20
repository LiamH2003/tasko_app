import { Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createTheme, ThemeProvider, createBox, createText } from '@shopify/restyle';
import { MotiView } from 'moti';
import { BlurView } from 'expo-blur';

const SCREEN_W = Dimensions.get('window').width;

const theme = createTheme({
  colors: {
    background:    '#e8e5dd',
    surface:       '#ffffff',
    primary:       '#49c9d5',
    primaryDark:   '#3797a0',
    textPrimary:   '#1a1918',
    textSecondary: '#4a4845',
    textMuted:     '#8a8885',
    iconBg:        'rgba(73,201,213,0.14)',
  },
  spacing: {
    xxs: 2, xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
  },
  borderRadii: {
    sm: 8, md: 12, lg: 16, xl: 24, full: 9999,
  },
  textVariants: {
    defaults:     { fontSize: 14, color: 'textPrimary' },
    eyebrow:      { fontSize: 11, fontWeight: '600', color: 'primary', letterSpacing: 2, textAlign: 'center' },
    brand:        { fontSize: 32, fontWeight: '600', color: 'textPrimary', letterSpacing: 0.3, fontFamily: 'Fredoka_500Medium', textAlign: 'center' },
    tagline:      { fontSize: 14, color: 'textSecondary', lineHeight: 21, textAlign: 'center' },
    cardTitle:    { fontSize: 14, fontWeight: '600', color: 'textPrimary' },
    cardSub:      { fontSize: 12, color: 'textMuted', lineHeight: 17, marginTop: 'xxs' },
    btnPrimary:   { fontSize: 16, fontWeight: '600', color: 'surface' },
    btnSecondary: { fontSize: 15, color: 'primaryDark' },
    legal:        { fontSize: 11, color: 'textMuted', textAlign: 'center', lineHeight: 16 },
    legalLink:    { fontSize: 11, color: 'primaryDark', textDecorationLine: 'underline' },
  },
});

type AppTheme = typeof theme;
const Box  = createBox<AppTheme>();
const Text = createText<AppTheme>();

const FEATURES = [
  { icon: require('@/assets/images/icons/routines_icon.png'),  title: 'Focus Mode',      description: 'Dagelijkse routines zonder afleiding' },
  { icon: require('@/assets/images/icons/focusmode_icon.png'), title: 'Slimme Routines', description: 'Gezonde gewoonten, stap voor stap' },
  { icon: require('@/assets/images/icons/mood_icon.png'),      title: 'Mood Tracker',    description: 'Hoe voel je je vandaag?' },
];

function WelcomeContent() {
  const insets = useSafeAreaInsets();

  return (
    <Box flex={1} backgroundColor="background">

      {/* Large soft teal blob — top centre */}
      <MotiView
        from={{ scale: 1, opacity: 0.7 }}
        animate={{ scale: 1.1, opacity: 1 }}
        transition={{ type: 'timing', duration: 3600, loop: true, repeatReverse: true }}
        style={{
          position: 'absolute',
          width: 380,
          height: 380,
          borderRadius: 190,
          backgroundColor: 'rgba(73,201,213,0.14)',
          top: -60,
          left: (SCREEN_W - 380) / 2,
        }}
      />

      {/* Smaller accent blob — bottom right */}
      <MotiView
        from={{ scale: 1, opacity: 0.5 }}
        animate={{ scale: 1.06, opacity: 0.8 }}
        transition={{ type: 'timing', duration: 2800, loop: true, repeatReverse: true, delay: 800 }}
        style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: 'rgba(73,201,213,0.09)',
          bottom: 120,
          right: -60,
        }}
      />

      <Box style={{ height: insets.top }} />

      {/* ── Mascot + brand — upper middle ── */}
      <MotiView
        from={{ opacity: 0, translateY: -16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 18, stiffness: 100, delay: 0 }}
        style={{ alignItems: 'center', paddingTop: 40 }}
      >
        {/* Mascot with floating loop */}
        <MotiView
          from={{ translateY: 0 }}
          animate={{ translateY: -9 }}
          transition={{ type: 'timing', duration: 2600, loop: true, repeatReverse: true }}
        >
          <Box style={styles.mascotWrap}>
            <Image
              source={require('@/assets/images/mascot.svg')}
              style={{ width: 130, height: 130 }}
              contentFit="contain"
            />
          </Box>
        </MotiView>

        {/* Brand */}
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 380, delay: 200 }}
          style={{ alignItems: 'center' }}
        >
          <Text variant="eyebrow" marginTop="md" marginBottom="xs">JOUW DAGELIJKS AVONTUUR</Text>
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
            <BlurView intensity={40} tint="light" style={styles.card}>
              <Box
                width={40}
                height={40}
                borderRadius="md"
                backgroundColor="iconBg"
                alignItems="center"
                justifyContent="center"
                style={{ flexShrink: 0 }}
              >
                <Image source={f.icon} style={{ width: 21, height: 21 }} contentFit="contain" />
              </Box>
              <Box flex={1}>
                <Text variant="cardTitle">{f.title}</Text>
                <Text variant="cardSub">{f.description}</Text>
              </Box>
            </BlurView>
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

export default function WelcomeScreen() {
  return (
    <ThemeProvider theme={theme}>
      <WelcomeContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  mascotWrap: {
    width: 164,
    height: 164,
    borderRadius: 82,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(73,201,213,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#49c9d5',
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
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  cardAccent: {
    width: 3,
    height: 28,
    borderRadius: 2,
    backgroundColor: 'rgba(73,201,213,0.5)',
    flexShrink: 0,
  },
  btnPrimary: {
    height: 52,
    backgroundColor: '#49c9d5',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#49c9d5',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.35,
    elevation: 6,
  },
  btnSecondary: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(73,201,213,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});
