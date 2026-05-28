import { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { useAppStore } from '@/store/useAppStore';
import { useThemePreference } from '@/store/useThemePreference';
import { logFocusSession } from '@/services/child-device';
import { PRIMARY, primaryAlpha } from '@/constants/palette';
import { lightTheme, darkTheme, type AppTheme } from '@/constants/restyleTheme';

const SUBJECTS = ['Wiskunde', 'Lezen', 'Frans', 'Tekenen', 'Andere'];
const PRESETS  = [10, 15, 20, 25, 30];
const MIN_DURATION = 5;
const MAX_DURATION = 90;
const STEP = 5;
const FOCUS_DURATION_KEY = 'focusDefaultDuration';

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function NumberInput({
  value, onChange, min, max, label, c,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  label: string;
  c: AppTheme['colors'];
}) {
  return (
    <View style={modal.unitCol}>
      <TouchableOpacity
        style={[modal.nudgeBtn, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}
        onPress={() => onChange(Math.min(max, value + 1))}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-up" size={20} color={PRIMARY} />
      </TouchableOpacity>
      <View style={[modal.valueBox, { backgroundColor: c.glassCard }]}>
        <Text style={[modal.valueText, { color: c.textPrimary }]}>{String(value).padStart(2, '0')}</Text>
        <Text style={modal.valueLabel}>{label}</Text>
      </View>
      <TouchableOpacity
        style={[modal.nudgeBtn, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}
        onPress={() => onChange(Math.max(min, value - 1))}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-down" size={20} color={PRIMARY} />
      </TouchableOpacity>
    </View>
  );
}

export default function FocusScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useThemePreference();
  const { childId } = useAppStore();
  const c = isDark ? darkTheme.colors : lightTheme.colors;

  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(20);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Tracks the planned session duration in seconds (updated by setDurationAndReset + applyCustomTime + reset)
  const totalSecondsRef = useRef(20 * 60);
  // True only when the timer tick naturally reaches 0 (not the stop button)
  const completedNaturallyRef = useRef(false);

  const [customOpen, setCustomOpen] = useState(false);
  const [customH, setCustomH] = useState(0);
  const [customM, setCustomM] = useState(20);
  const [customS, setCustomS] = useState(0);

  const [celebrationOpen, setCelebrationOpen] = useState(false);

  const stableHeightRef = useRef(0);
  const [stableHeight, setStableHeight] = useState(0);

  // Read default duration from SecureStore on mount
  useEffect(() => {
    SecureStore.getItemAsync(FOCUS_DURATION_KEY).then(v => {
      if (v) {
        const d = parseInt(v, 10);
        if (!isNaN(d) && d >= MIN_DURATION && d <= MAX_DURATION) {
          setDuration(d);
          setTimeLeft(d * 60);
          totalSecondsRef.current = d * 60;
        }
      }
    });
  }, []);

  // Timer tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            completedNaturallyRef.current = true;
            setRunning(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  // Show celebration + log session only on natural completion
  useEffect(() => {
    if (timeLeft === 0 && completedNaturallyRef.current) {
      completedNaturallyRef.current = false;
      setCelebrationOpen(true);
      if (childId) {
        logFocusSession(childId, totalSecondsRef.current, subject).catch(() => {});
      }
    }
  }, [timeLeft, childId, subject]);

  function setDurationAndReset(d: number) {
    if (running) return;
    const clamped = Math.min(MAX_DURATION, Math.max(MIN_DURATION, d));
    setDuration(clamped);
    setTimeLeft(clamped * 60);
    totalSecondsRef.current = clamped * 60;
    SecureStore.setItemAsync(FOCUS_DURATION_KEY, String(clamped));
  }

  function applyCustomTime() {
    if (running) return;
    const totalSeconds = customH * 3600 + customM * 60 + customS;
    if (totalSeconds < 10) return;
    setRunning(false);
    setTimeLeft(totalSeconds);
    setDuration(Math.round(totalSeconds / 60));
    totalSecondsRef.current = totalSeconds;
    const roundedMinutes = Math.round(totalSeconds / 60);
    if (roundedMinutes >= MIN_DURATION && roundedMinutes <= MAX_DURATION) {
      SecureStore.setItemAsync(FOCUS_DURATION_KEY, String(roundedMinutes));
    }
    setCustomOpen(false);
  }

  function openCustom() {
    setCustomH(Math.floor(duration / 60));
    setCustomM(duration % 60);
    setCustomS(0);
    setCustomOpen(true);
  }

  function reset() {
    setRunning(false);
    completedNaturallyRef.current = false;
    setTimeLeft(totalSecondsRef.current);
    setDuration(Math.round(totalSecondsRef.current / 60));
  }

  const isDone = timeLeft === 0;
  const customTotal = customH * 3600 + customM * 60 + customS;

  return (
    <View
      style={{ flex: 1 }}
      onLayout={({ nativeEvent }) => {
        const h = nativeEvent.layout.height;
        if (h > 0 && stableHeightRef.current === 0) {
          stableHeightRef.current = h;
          setStableHeight(h);
        }
      }}
    >
      <Box
        backgroundColor="background"
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: stableHeight > 0 ? stableHeight : '100%' as unknown as number,
        }}
      >

        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <AnimatedBlob
            size={260} color={primaryAlpha(0.13)}
            duration={3500} opacityFrom={0.65} opacityTo={1} scaleTarget={1.12}
            style={{ top: -50, left: -60 }}
          />
          <AnimatedBlob
            size={140} color={primaryAlpha(0.08)}
            duration={2700} delay={600} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07}
            style={{ bottom: 120, right: -40 }}
          />
        </View>

        <View style={[styles.container, { paddingTop: insets.top + 8 }]}>

          {/* Header */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 40 }}
            style={styles.header}
          >
            <Text style={[styles.title, { color: c.textPrimary }]}>Focus</Text>
            <Text style={[styles.subtitle, { color: c.textMuted }]}>Kies een onderwerp en duur, dan starten we!</Text>
          </MotiView>

          {/* Subject */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 100 }}
          >
            <View style={[styles.card, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
              <Text style={styles.cardLabel}>WAARMEE BEN JE BEZIG?</Text>
              <View style={[styles.inputRow, { backgroundColor: c.glassInput }]}>
                <Ionicons name="pencil-outline" size={14} color={c.textMuted} />
                <TextInput
                  style={[styles.input, { color: c.textPrimary }]}
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="Typ je onderwerp..."
                  placeholderTextColor={c.placeholder}
                  editable={!running}
                />
              </View>
              <View style={styles.chips}>
                {SUBJECTS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.chip, { backgroundColor: c.glassInput }, subject === s && styles.chipActive]}
                    onPress={() => setSubject(subject === s ? '' : s)}
                    activeOpacity={0.7}
                    disabled={running}
                  >
                    <Text style={[styles.chipText, { color: c.textMuted }, subject === s && styles.chipTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </MotiView>

          {/* Timer */}
          <MotiView
            from={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 100, delay: 160 }}
            style={styles.timerSection}
          >
            <View style={[styles.timerOuter, { backgroundColor: c.glassCard }, isDone && styles.timerOuterDone]}>
              <Text style={[styles.timerText, { color: c.textPrimary }]}>{fmt(timeLeft)}</Text>
              <Text style={styles.timerStatus}>
                {isDone ? 'Klaar!' : running ? 'Bezig...' : 'Klaar om te starten'}
              </Text>
            </View>
          </MotiView>

          {/* Duration + controls */}
          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 220 }}
            style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom + 8, 16) }]}
          >
            {/* Playback controls */}
            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.ctrlBtn, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}
                onPress={reset}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={20} color={c.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.playBtn}
                onPress={() => setRunning(r => !r)}
                activeOpacity={0.8}
              >
                <Ionicons name={running ? 'pause' : 'play'} size={26} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ctrlBtn, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}
                onPress={reset}
                activeOpacity={0.8}
              >
                <Ionicons name="stop" size={20} color={c.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Duration */}
            <View style={[styles.card, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
              <View style={styles.cardLabelRow}>
                <Text style={styles.cardLabel}>HOE LANG WIL JE FOCUSSEN?</Text>
                <TouchableOpacity
                  style={styles.customBtn}
                  onPress={openCustom}
                  disabled={running}
                  activeOpacity={0.7}
                >
                  <Ionicons name="time-outline" size={15} color={running ? '#c8c4bc' : PRIMARY} />
                  <Text style={[styles.customBtnText, running && { color: '#c8c4bc' }]}>Eigen tijd</Text>
                </TouchableOpacity>
              </View>

              {/* Stepper */}
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={[styles.stepBtn, (running || duration <= MIN_DURATION) && styles.stepBtnDisabled]}
                  onPress={() => setDurationAndReset(duration - STEP)}
                  disabled={running || duration <= MIN_DURATION}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={18} color={running || duration <= MIN_DURATION ? '#c8c4bc' : PRIMARY} />
                </TouchableOpacity>
                <View style={styles.stepperValue}>
                  <Text style={[styles.stepperNumber, { color: c.textPrimary }]}>{duration}</Text>
                  <Text style={styles.stepperUnit}>min</Text>
                </View>
                <TouchableOpacity
                  style={[styles.stepBtn, (running || duration >= MAX_DURATION) && styles.stepBtnDisabled]}
                  onPress={() => setDurationAndReset(duration + STEP)}
                  disabled={running || duration >= MAX_DURATION}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={18} color={running || duration >= MAX_DURATION ? '#c8c4bc' : PRIMARY} />
                </TouchableOpacity>
              </View>

              {/* Quick presets */}
              <View style={styles.presets}>
                {PRESETS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.preset, { backgroundColor: c.glassInput }, duration === p && styles.presetActive]}
                    onPress={() => setDurationAndReset(p)}
                    disabled={running}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.presetText, { color: c.textMuted }, duration === p && styles.presetTextActive]}>{p}m</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </MotiView>

        </View>

        {/* Custom time modal */}
        <Modal
          visible={customOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCustomOpen(false)}
        >
          <Pressable style={modal.backdrop} onPress={() => setCustomOpen(false)}>
            <MotiView
              from={{ opacity: 0, translateY: 40 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', damping: 18, stiffness: 120 }}
              style={[modal.sheet, { backgroundColor: c.sheetBg }]}
            >
              <Pressable>
                <View style={modal.handle} />
                <Text style={[modal.title, { color: c.textPrimary }]}>Eigen tijd instellen</Text>
                <Text style={modal.sub}>Kies uren, minuten en seconden.</Text>

                <View style={modal.pickers}>
                  <NumberInput value={customH} onChange={setCustomH} min={0} max={9} label="uur" c={c} />
                  <Text style={[modal.sep, { color: c.textPrimary }]}>:</Text>
                  <NumberInput value={customM} onChange={setCustomM} min={0} max={59} label="min" c={c} />
                  <Text style={[modal.sep, { color: c.textPrimary }]}>:</Text>
                  <NumberInput value={customS} onChange={setCustomS} min={0} max={59} label="sec" c={c} />
                </View>

                <TouchableOpacity
                  style={[modal.confirmBtn, customTotal < 10 && modal.confirmBtnDisabled]}
                  onPress={applyCustomTime}
                  disabled={customTotal < 10}
                  activeOpacity={0.85}
                >
                  <Text style={modal.confirmText}>Instellen</Text>
                </TouchableOpacity>
              </Pressable>
            </MotiView>
          </Pressable>
        </Modal>

        {/* Celebration modal */}
        <Modal
          visible={celebrationOpen}
          transparent
          animationType="fade"
          onRequestClose={() => { setCelebrationOpen(false); reset(); }}
        >
          <Pressable style={modal.backdrop} onPress={() => { setCelebrationOpen(false); reset(); }}>
            <MotiView
              from={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 16, stiffness: 120 }}
              style={[modal.sheet, { backgroundColor: c.sheetBg, alignItems: 'center' }]}
            >
              <Pressable style={{ width: '100%', alignItems: 'center' }}>
                <View style={modal.handle} />
                <Text style={modal.celebrationEmoji}>🎉</Text>
                <Text style={[modal.title, { color: c.textPrimary, marginBottom: 8 }]}>Goed gedaan!</Text>
                <Text style={[modal.sub, { marginBottom: 4 }]}>
                  Je hebt {Math.round(totalSecondsRef.current / 60)} minuten gefocust
                  {subject ? ` op ${subject}` : ''}.
                </Text>
                <Text style={[modal.sub, { marginBottom: 28 }]}>Trots op je! 💪</Text>
                <TouchableOpacity
                  style={modal.confirmBtn}
                  onPress={() => { setCelebrationOpen(false); reset(); }}
                  activeOpacity={0.85}
                >
                  <Text style={modal.confirmText}>Sluiten</Text>
                </TouchableOpacity>
              </Pressable>
            </MotiView>
          </Pressable>
        </Modal>

      </Box>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },

  header: { marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 2 },
  subtitle: { fontSize: 13 },

  card: {
    borderRadius: 20, padding: 14,
    borderWidth: 1, marginBottom: 12,
  },
  cardLabelRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10,
  },
  cardLabel: { fontSize: 10, fontWeight: '600', color: PRIMARY, letterSpacing: 0.8 },

  customBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: primaryAlpha(0.08), borderRadius: 99,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: primaryAlpha(0.2),
  },
  customBtnText: { fontSize: 11, fontWeight: '600', color: PRIMARY },

  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1.5, borderColor: primaryAlpha(0.2), marginBottom: 10,
  },
  input: { flex: 1, fontSize: 13, padding: 0 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    borderRadius: 99, borderWidth: 1.5, borderColor: primaryAlpha(0.2),
    paddingHorizontal: 12, paddingVertical: 5,
  },
  chipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  chipText: { fontSize: 12 },
  chipTextActive: { color: '#fff', fontWeight: '600' },

  timerSection: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  timerOuter: {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 3.5, borderColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOpacity: 0.22, shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 }, elevation: 10,
  },
  timerOuterDone: { borderColor: '#48bb78', shadowColor: '#48bb78' },
  timerText: { fontSize: 36, fontWeight: '700', letterSpacing: 2 },
  timerStatus: { fontSize: 11, color: '#8a8885', marginTop: 3 },

  bottomSection: { gap: 0 },

  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 10 },
  stepBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: primaryAlpha(0.08),
    alignItems: 'center', justifyContent: 'center',
  },
  stepBtnDisabled: { backgroundColor: 'rgba(0,0,0,0.04)' },
  stepperValue: { alignItems: 'center', minWidth: 64 },
  stepperNumber: { fontSize: 24, fontWeight: '700' },
  stepperUnit: { fontSize: 10, color: '#8a8885' },

  presets: { flexDirection: 'row', gap: 6 },
  preset: {
    flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 10,
    borderWidth: 1.5, borderColor: primaryAlpha(0.2),
  },
  presetActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  presetText: { fontSize: 12, fontWeight: '600' },
  presetTextActive: { color: '#fff' },

  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 12 },
  ctrlBtn: {
    width: 46, height: 46, borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  playBtn: {
    width: 62, height: 62, borderRadius: 31, backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10, shadowOpacity: 0.35, elevation: 6,
  },
});

const modal = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.12)', alignSelf: 'center', marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#8a8885', textAlign: 'center', marginBottom: 28 },

  celebrationEmoji: { fontSize: 56, marginBottom: 12 },

  pickers: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28,
  },
  sep: { fontSize: 28, fontWeight: '700', marginBottom: 20 },

  unitCol: { alignItems: 'center', gap: 6 },
  nudgeBtn: {
    width: 44, height: 44, borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  valueBox: {
    width: 72, height: 64, borderRadius: 16,
    borderWidth: 1.5, borderColor: primaryAlpha(0.2),
    alignItems: 'center', justifyContent: 'center',
  },
  valueText: { fontSize: 28, fontWeight: '700' },
  valueLabel: { fontSize: 10, color: '#8a8885', marginTop: 1 },

  confirmBtn: {
    height: 52, backgroundColor: PRIMARY, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, shadowOpacity: 0.3, elevation: 6,
    width: '100%',
  },
  confirmBtnDisabled: { backgroundColor: '#c8c4bc', shadowOpacity: 0 },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
