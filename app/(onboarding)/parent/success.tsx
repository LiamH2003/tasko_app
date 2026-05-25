import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { BackButton } from '@/components/ui/BackButton';
import { StepBar } from '@/components/ui/StepBar';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { AnimatedFloat } from '@/components/ui/AnimatedFloat';
import { completeOnboarding } from '@/services/auth';
import { PRIMARY, primaryAlpha } from '@/constants/palette';

export default function ParentSuccessScreen() {
  const insets = useSafeAreaInsets();
  const { parentName, familyName, inviteCode } = useLocalSearchParams<{
    parentName: string;
    familyName: string;
    inviteCode: string;
  }>();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      await completeOnboarding();
      router.replace('/(parent)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} backgroundColor="background">

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <AnimatedBlob
          size={300} color={primaryAlpha(0.13)}
          duration={3500} opacityFrom={0.65} opacityTo={1} scaleTarget={1.12}
          style={{ top: -60, left: -70 }}
        />
        <AnimatedBlob
          size={160} color={primaryAlpha(0.08)}
          duration={2700} delay={600} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07}
          style={{ bottom: 100, right: -50 }}
        />
      </View>

      <Box style={{ height: insets.top + 16 }} />
      <BackButton />
      <Box style={{ height: 12 }} />
      <StepBar step={4} total={4} />
      <Text variant="label" style={{ paddingHorizontal: 24, marginBottom: 12 }}>STAP 4 VAN 4 — KLAAR</Text>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Check icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 100 }}
          style={{ marginTop: 16, marginBottom: 24, alignSelf: 'center' }}
        >
          <AnimatedFloat amplitude={6} duration={2400}>
            <Box style={styles.iconWrap}>
              <Ionicons name="checkmark-circle-outline" size={44} color={PRIMARY} />
            </Box>
          </AnimatedFloat>
        </MotiView>

        {/* Heading */}
        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 100 }}
          style={{ marginBottom: 24 }}
        >
          <Text variant="title" marginBottom="xs">Je bent klaar, {parentName}!</Text>
          <Text variant="subtitle">
            Jouw gezinsruimte is aangemaakt. Zodra je kind de code invoert, verschijnt hij hier.
          </Text>
        </MotiView>

        {/* Info card */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 360, delay: 180 }}
        >
          <View style={styles.formCard}>

            <Box flexDirection="row" alignItems="center" gap="md">
              <Box style={styles.iconBox}>
                <Ionicons name="home-outline" size={20} color={PRIMARY} />
              </Box>
              <Box flex={1}>
                <Text variant="label" style={{ color: '#6b6560', marginBottom: 2 }}>GEZIN</Text>
                <Text style={styles.cardValue}>{familyName}</Text>
              </Box>
            </Box>

            <Box style={styles.divider} />

            <Box flexDirection="row" alignItems="center" gap="md">
              <Box style={styles.iconBox}>
                <Ionicons name="key-outline" size={20} color={PRIMARY} />
              </Box>
              <Box flex={1}>
                <Text variant="label" style={{ color: '#6b6560', marginBottom: 2 }}>UITNODIGINGSCODE VOOR KIND</Text>
                <Text style={styles.cardValue}>{inviteCode}</Text>
              </Box>
            </Box>

          </View>
        </MotiView>

      </ScrollView>

      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 340, delay: 320 }}
        style={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom + 10, 24) }}
      >
        <TouchableOpacity
          style={[styles.btnPrimary, loading && styles.btnDisabled]}
          onPress={handleContinue}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#e8e5dd" />
            : <Text variant="btnPrimary">Ga naar mijn dashboard</Text>}
        </TouchableOpacity>
      </MotiView>

    </Box>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 24, paddingBottom: 16 },
  iconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1.5, borderColor: primaryAlpha(0.3),
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16, shadowOpacity: 0.2, elevation: 6,
  },
  formCard: {
    borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: primaryAlpha(0.1),
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  cardValue: {
    fontSize: 16, fontWeight: '600', color: '#1a1918',
  },
  divider: {
    height: 1, backgroundColor: primaryAlpha(0.12),
    marginVertical: 16,
  },
  btnPrimary: {
    height: 52, backgroundColor: PRIMARY, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, shadowOpacity: 0.35, elevation: 6,
  },
  btnDisabled: { opacity: 0.4 },
});
