import { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { StepBar } from '@/components/ui/StepBar';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { AnimatedFloat } from '@/components/ui/AnimatedFloat';
import { useAppStore } from '@/store/useAppStore';
import { PRIMARY, primaryAlpha } from '@/constants/palette';

export default function ChildWelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { setChildId } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [childName, setChildName] = useState('');

  useEffect(() => {
    SecureStore.getItemAsync('pendingChildName').then((name) => {
      if (name) setChildName(name);
    });
  }, []);

  const handleStart = async () => {
    setLoading(true);
    try {
      const pendingId = await SecureStore.getItemAsync('pendingChildId');
      const pendingName = await SecureStore.getItemAsync('pendingChildName');
      if (pendingId) {
        await setChildId(pendingId, pendingName ?? undefined);
        await SecureStore.deleteItemAsync('pendingChildId');
        await SecureStore.deleteItemAsync('pendingChildName');
      }
    } catch {
      // non-fatal — routing will still proceed
    } finally {
      setLoading(false);
    }
    router.replace('/(child)');
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
      <Box style={{ height: 12 }} />
      <StepBar step={5} total={5} />
      <Text variant="label" style={{ paddingHorizontal: 24, marginBottom: 12 }}>STAP 5 VAN 5 — KLAAR</Text>

      <Box flex={1} paddingHorizontal="lg" alignItems="center" justifyContent="center">

        {/* Mascot */}
        <MotiView
          from={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 100 }}
          style={{ marginBottom: 16 }}
        >
          <AnimatedFloat amplitude={7} duration={2400}>
            <Box style={styles.mascotWrap}>
              <Image
                source={require('@/assets/images/mascot.svg')}
                style={{ width: 100, height: 100 }}
                contentFit="contain"
              />
            </Box>
          </AnimatedFloat>
        </MotiView>

        {/* Speech bubble */}
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 120 }}
          style={{ width: '100%', marginBottom: 20 }}
        >
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>
              "Aangenaam kennis te maken, {childName || 'jou'}!"
            </Text>
          </View>
        </MotiView>

        {/* Heading */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 200 }}
          style={{ width: '100%', marginBottom: 24 }}
        >
          <Text variant="title" style={{ textAlign: 'center' }} marginBottom="xs">
            Welkom bij Tasko, {childName || 'daar'}!
          </Text>
          <Text variant="subtitle" style={{ textAlign: 'center' }}>
            Jouw ruimte is klaar. Laten we beginnen{'\n'}met je eerste routine!
          </Text>
        </MotiView>


      </Box>

      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 340, delay: 500 }}
        style={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom + 10, 24) }}
      >
        <TouchableOpacity
          style={[styles.btnPrimary, { opacity: loading ? 0.4 : 1 }]}
          onPress={handleStart}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#e8e5dd" />
            : <Text variant="btnPrimary">Start mijn avontuur</Text>}
        </TouchableOpacity>
      </MotiView>

    </Box>
  );
}

const styles = StyleSheet.create({
  mascotWrap: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1.5, borderColor: primaryAlpha(0.3),
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20, shadowOpacity: 0.2, elevation: 8,
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 12, paddingHorizontal: 20,
  },
  bubbleText: {
    fontSize: 14, color: '#6b6560', textAlign: 'center', fontStyle: 'italic', lineHeight: 20,
  },
  btnPrimary: {
    height: 52, backgroundColor: PRIMARY, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, shadowOpacity: 0.35, elevation: 6,
  },
  btnDisabled: { opacity: 0.4 },
});
