import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';

const SUBJECTS = ['Wiskunde', 'Lezen', 'Frans', 'Tekenen', 'Andere'];
const DURATIONS = [10, 15, 20, 25, 30];

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function FocusScreen() {
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <Text style={styles.title}>Focus</Text>
        <Text style={styles.subtitle}>Kies een naam en duur — dan starten we!</Text>

        {/* Subject card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>WAARMEE BEN JE BEZIG?</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="bv. Wiskunde..."
            placeholderTextColor={Colors.text.muted}
          />
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

        {/* Duration card */}
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
                <Text style={[styles.durationUnit, duration === d && styles.durationUnitActive]}>min</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Timer circle */}
        <View style={styles.timerWrapper}>
          <View style={styles.timerOuter}>
            <View style={styles.timerInner}>
              <Text style={styles.timerText}>{fmt(timeLeft)}</Text>
              <Text style={styles.timerStatus}>{statusLabel}</Text>
            </View>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.ctrlBtn} onPress={reset} activeOpacity={0.8}>
            <Ionicons name="refresh" size={22} color={Colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.playBtn}
            onPress={() => setRunning((r) => !r)}
            activeOpacity={0.8}
          >
            <Ionicons name={running ? 'pause' : 'play'} size={28} color={Colors.background} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctrlBtn} onPress={() => { setRunning(false); setTimeLeft(0); }} activeOpacity={0.8}>
            <Ionicons name="stop" size={22} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },

  title: { fontSize: 28, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: 4 },
  subtitle: { fontSize: FontSize.md, color: Colors.text.muted, marginBottom: Spacing.lg },

  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  cardLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.primary, letterSpacing: 0.8, marginBottom: Spacing.sm },

  input: { backgroundColor: Colors.card, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 12, color: Colors.text.primary, fontSize: FontSize.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 6 },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.text.secondary },
  chipTextActive: { color: Colors.background, fontWeight: FontWeight.semibold },

  durationRow: { flexDirection: 'row', gap: 8 },
  durationBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  durationBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  durationNumber: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.secondary },
  durationNumberActive: { color: Colors.background },
  durationUnit: { fontSize: FontSize.xs, color: Colors.text.muted },
  durationUnitActive: { color: Colors.background },

  timerWrapper: { alignItems: 'center', marginVertical: Spacing.lg },
  timerOuter: {
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 5, borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOpacity: 0.35, shadowRadius: 24, shadowOffset: { width: 0, height: 0 }, elevation: 14,
  },
  timerInner: { alignItems: 'center' },
  timerText: { fontSize: 42, fontWeight: FontWeight.bold, color: Colors.text.primary, letterSpacing: 2 },
  timerStatus: { fontSize: FontSize.sm, color: Colors.text.muted, marginTop: 4 },

  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  ctrlBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  playBtn: { width: 68, height: 68, borderRadius: 34, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});
