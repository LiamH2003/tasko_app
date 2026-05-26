import { useState, useEffect, useRef } from 'react';
import { View, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { PRIMARY, primaryAlpha } from '@/constants/palette';

const SUBJECTS = ['Wiskunde', 'Lezen', 'Frans', 'Tekenen', 'Andere'];
const DURATIONS = [10, 15, 20, 25, 30];

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function FocusScreen() {
  const insets = useSafeAreaInsets();
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(20);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { setRunning(false); return 0; }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  function selectDuration(d: number) {
    setDuration(d);
    setTimeLeft(d * 60);
    setRunning(false);
  }

  function reset() {
    setRunning(false);
    setTimeLeft(duration * 60);
  }

  const statusLabel = running ? 'bezig...' : timeLeft === 0 ? 'klaar!' : 'klaar om te starten';
  const progress = timeLeft / (duration * 60);

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

      <Box style={{ height: insets.top + 8 }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 60 }}
          style={{ marginBottom: 20 }}
        >
          <Text style={styles.title}>Focus</Text>
          <Text style={styles.subtitle}>Kies een naam en duur — dan starten we!</Text>
        </MotiView>

        {/* Subject card */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 120 }}
        >
          <View style={styles.card}>
            <Text style={styles.cardLabel}>WAARMEE BEN JE BEZIG?</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="bv. Wiskunde..."
                placeholderTextColor="#8a8885"
              />
            </View>
            <View style={styles.chips}>
              {SUBJECTS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, subject === s && styles.chipActive]}
                  onPress={() => setSubject(subject === s ? '' : s)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, subject === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </MotiView>

        {/* Duration card */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 180 }}
        >
          <View style={styles.card}>
            <Text style={styles.cardLabel}>HOE LANG WIL JE FOCUSSEN?</Text>
            <View style={styles.durationRow}>
              {DURATIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.durationBtn, duration === d && styles.durationBtnActive]}
                  onPress={() => selectDuration(d)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.durationNumber, duration === d && styles.durationNumberActive]}>{d}</Text>
                  <Text style={[styles.durationUnit, duration === d && { color: '#fff' }]}>min</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </MotiView>

        {/* Timer */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 100, delay: 240 }}
          style={styles.timerWrapper}
        >
          <View style={styles.timerOuter}>
            <View style={styles.timerInner}>
              <Text style={styles.timerText}>{fmt(timeLeft)}</Text>
              <Text style={styles.timerStatus}>{statusLabel}</Text>
            </View>
          </View>
        </MotiView>

        {/* Controls */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 300 }}
        >
          <View style={styles.controls}>
            <TouchableOpacity style={styles.ctrlBtn} onPress={reset} activeOpacity={0.8}>
              <Ionicons name="refresh" size={22} color="#6b6560" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.playBtn}
              onPress={() => setRunning((r) => !r)}
              activeOpacity={0.8}
            >
              <Ionicons name={running ? 'pause' : 'play'} size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ctrlBtn}
              onPress={() => { setRunning(false); setTimeLeft(0); }}
              activeOpacity={0.8}
            >
              <Ionicons name="stop" size={22} color="#6b6560" />
            </TouchableOpacity>
          </View>
        </MotiView>

        <View style={{ height: 24 }} />
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 8 },

  title: { fontSize: 28, fontWeight: '700', color: '#1a1918', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#8a8885' },

  card: {
    backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 20, padding: 18,
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  cardLabel: { fontSize: 11, fontWeight: '600', color: PRIMARY, letterSpacing: 0.8, marginBottom: 12 },

  inputBox: {
    height: 48, backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12, borderWidth: 1.5, borderColor: primaryAlpha(0.3),
    paddingHorizontal: 14, justifyContent: 'center', marginBottom: 12,
  },
  input: { fontSize: 14, color: '#1a1918', padding: 0 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 99, borderWidth: 1.5, borderColor: primaryAlpha(0.25),
    paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  chipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  chipText: { fontSize: 13, color: '#6b6560' },
  chipTextActive: { color: '#fff', fontWeight: '600' },

  durationRow: { flexDirection: 'row', gap: 8 },
  durationBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1.5, borderColor: primaryAlpha(0.25),
  },
  durationBtnActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  durationNumber: { fontSize: 18, fontWeight: '700', color: '#6b6560' },
  durationNumberActive: { color: '#fff' },
  durationUnit: { fontSize: 11, color: '#8a8885' },

  timerWrapper: { alignItems: 'center', marginVertical: 24 },
  timerOuter: {
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 4, borderColor: PRIMARY,
    backgroundColor: 'rgba(255,255,255,0.82)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOpacity: 0.25, shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 }, elevation: 12,
  },
  timerInner: { alignItems: 'center' },
  timerText: { fontSize: 42, fontWeight: '700', color: '#1a1918', letterSpacing: 2 },
  timerStatus: { fontSize: 13, color: '#8a8885', marginTop: 4 },

  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  ctrlBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  playBtn: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, shadowOpacity: 0.35, elevation: 6,
  },
});
