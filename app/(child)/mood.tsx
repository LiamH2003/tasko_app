import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { MoodSelector } from '@/components/mood/MoodSelector';
import { useAppStore } from '@/store/useAppStore';
import { submitMood } from '@/services/child-device';
import { PRIMARY, primaryAlpha } from '@/constants/palette';
import type { MoodType } from '@/types';

export default function MoodScreen() {
  const insets = useSafeAreaInsets();
  const { childId } = useAppStore();
  const [selected, setSelected] = useState<MoodType | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit() {
    if (!selected || !childId) return;
    setSaving(true);
    try {
      await submitMood(childId, selected);
      setSaved(true);
    } catch {
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <Box flex={1} backgroundColor="background">
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <AnimatedBlob
            size={280} color={primaryAlpha(0.13)}
            duration={3500} opacityFrom={0.65} opacityTo={1} scaleTarget={1.12}
            style={{ top: -50, left: -60 }}
          />
        </View>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 100 }}
          style={styles.savedContainer}
        >
          <Text style={styles.savedEmoji}>🎉</Text>
          <Text style={styles.savedTitle}>Bedankt!</Text>
          <Text style={styles.savedSubtitle}>Je monster weet hoe je je voelt.</Text>
        </MotiView>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="background">

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <AnimatedBlob
          size={280} color={primaryAlpha(0.13)}
          duration={3500} opacityFrom={0.65} opacityTo={1} scaleTarget={1.12}
          style={{ top: -50, left: -60 }}
        />
        <AnimatedBlob
          size={160} color={primaryAlpha(0.08)}
          duration={2700} delay={600} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07}
          style={{ bottom: 120, right: -50 }}
        />
      </View>

      <Box style={{ height: insets.top + 16 }} />

      <MotiView
        from={{ opacity: 0, translateY: 14 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 340, delay: 60 }}
        style={styles.inner}
      >
        <Text style={styles.title}>Hoe voel je je vandaag?</Text>
        <Text style={styles.subtitle}>Er is geen goed of fout antwoord.</Text>

        <MoodSelector selected={selected} onSelect={setSelected} />

        <TouchableOpacity
          style={[styles.button, { opacity: selected && !saving ? 1 : 0.4 }]}
          onPress={handleSubmit}
          disabled={!selected || saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Opslaan</Text>}
        </TouchableOpacity>
      </MotiView>
    </Box>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1918', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b6560', marginBottom: 32 },
  button: {
    height: 52, backgroundColor: PRIMARY, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginTop: 'auto',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, shadowOpacity: 0.35, elevation: 6,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  savedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  savedEmoji: { fontSize: 64, marginBottom: 20 },
  savedTitle: { fontSize: 28, fontWeight: '700', color: '#1a1918', marginBottom: 8 },
  savedSubtitle: { fontSize: 15, color: '#6b6560', textAlign: 'center' },
});
