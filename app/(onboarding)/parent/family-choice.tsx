import { ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { BackButton } from '@/components/ui/BackButton';
import { StepBar } from '@/components/ui/StepBar';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { PRIMARY, primaryAlpha } from '@/constants/palette';

const OPTIONS = [
  {
    key: 'create',
    icon: 'home-outline' as const,
    title: 'Nieuw gezin aanmaken',
    subtitle: 'Ik ben de eerste ouder die zich aanmeldt.',
    onPress: () => router.push('/(onboarding)/parent/family-setup'),
  },
  {
    key: 'join',
    icon: 'people-outline' as const,
    title: 'Bestaand gezin',
    subtitle: 'Ik gebruik de gezinscode van mijn partner om me aan te sluiten.',
    onPress: () => router.push('/(onboarding)/parent/join-family'),
  },
];

export default function FamilyChoiceScreen() {
  const insets = useSafeAreaInsets();

  return (
    <Box flex={1} backgroundColor="background">

      <AnimatedBlob
        size={300} color={primaryAlpha(0.13)}
        duration={3500} opacityFrom={0.65} opacityTo={1} scaleTarget={1.12}
        style={{ top: -60, left: -70 }}
      />
      <AnimatedBlob
        size={180} color={primaryAlpha(0.09)}
        duration={2700} delay={600} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07}
        style={{ bottom: 100, right: -50 }}
      />

      <Box style={{ height: insets.top + 16 }} />
      <BackButton />
      <Box style={{ height: 12 }} />
      <StepBar step={3} total={5} />
      <Text variant="label" style={{ paddingHorizontal: 24, marginBottom: 12 }}>STAP 3 VAN 5 — GEZIN</Text>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 60 }}
          style={{ marginBottom: 32 }}
        >
          <Text variant="title" marginBottom="xs">Jouw gezin</Text>
          <Text variant="subtitle">Maak een nieuw gezin aan of sluit je aan bij een bestaand gezin.</Text>
        </MotiView>

        {OPTIONS.map((opt, idx) => (
          <MotiView
            key={opt.key}
            from={{ opacity: 0, translateY: 18 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 120 + idx * 80 }}
            style={{ marginBottom: 12 }}
          >
            <TouchableOpacity style={styles.optionCard} onPress={opt.onPress} activeOpacity={0.82}>
              <View style={styles.optionIcon}>
                <Ionicons name={opt.icon} size={26} color={PRIMARY} />
              </View>
              <Box flex={1}>
                <Text style={styles.optionTitle}>{opt.title}</Text>
                <Text style={styles.optionSub}>{opt.subtitle}</Text>
              </Box>
              <Ionicons name="chevron-forward" size={20} color={primaryAlpha(0.5)} />
            </TouchableOpacity>
          </MotiView>
        ))}

      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 24, paddingTop: 8 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    padding: 18, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  optionIcon: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: primaryAlpha(0.1),
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  optionTitle: { fontSize: 16, fontWeight: '600', color: '#1a1918', marginBottom: 3 },
  optionSub: { fontSize: 13, color: '#6b6560', lineHeight: 18 },
});
