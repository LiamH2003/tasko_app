import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Text } from '@/components/ui/primitives';
import { MonsterSvg } from '@/components/ui/MonsterSvg';
import { PRIMARY, SUCCESS, WARNING, PURPLE } from '@/constants/palette';
import { STAGE_LABELS } from '@/utils/xp';

// Fixed particle layout — deterministic so renders are stable
const PARTICLES = [
  { x: 0,    y: -130, size: 10, color: '#4ecdc4', delay: 220 },
  { x: 90,   y: -95,  size:  8, color: WARNING, delay: 260 },
  { x: 128,  y: 0,    size: 12, color: SUCCESS, delay: 240 },
  { x: 90,   y: 95,   size:  7, color: '#f0ece8', delay: 280 },
  { x: 0,    y: 128,  size: 10, color: PURPLE, delay: 220 },
  { x: -90,  y: 95,   size:  8, color: '#4ecdc4', delay: 300 },
  { x: -128, y: 0,    size: 11, color: WARNING, delay: 250 },
  { x: -90,  y: -95,  size:  7, color: SUCCESS, delay: 270 },
  { x: 50,   y: -115, size:  6, color: '#f0ece8', delay: 310 },
  { x: -50,  y: -115, size:  6, color: PURPLE, delay: 290 },
  { x: 115,  y: 50,   size:  5, color: WARNING, delay: 330 },
  { x: -115, y: 50,   size:  5, color: '#4ecdc4', delay: 320 },
];

type Props = {
  visible: boolean;
  newLevel: number;
  newStage: string;
  prevStage: string;
  onDismiss: () => void;
};

export function LevelUpOverlay({ visible, newLevel, newStage, prevStage, onDismiss }: Props) {
  const stageUp = newStage !== prevStage;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <TouchableOpacity style={styles.root} activeOpacity={1} onPress={onDismiss}>

        {/* ── Backdrop ───────────────────────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 380 }}
          style={[StyleSheet.absoluteFillObject, styles.backdrop]}
        />

        {/* ── Centre radial glow ─────────────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 0.18, scale: 1.6 }}
          transition={{ type: 'timing', duration: 1000, delay: 100, loop: true, repeatReverse: true }}
          style={styles.radialGlow}
        />

        {/* ── "LEVEL UP!" ────────────────────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: -28, scale: 0.55 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 11, stiffness: 145, delay: 160 }}
          style={styles.headingWrap}
        >
          <Text style={styles.headingText}>LEVEL UP!</Text>
        </MotiView>

        {/* ── Monster + particles ────────────────────────────────────────── */}
        <View style={styles.stage} pointerEvents="none">

          {/* Pulsing ring behind monster */}
          <MotiView
            from={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1.35, opacity: 0 }}
            transition={{ type: 'timing', duration: 900, delay: 80, loop: true }}
            style={styles.ring}
          />
          <MotiView
            from={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.35 }}
            transition={{ type: 'timing', duration: 900, delay: 300, loop: true, repeatReverse: true }}
            style={styles.ring}
          />

          {/* Particles burst outward from centre */}
          {PARTICLES.map((p, i) => (
            <MotiView
              key={i}
              from={{ translateX: 0, translateY: 0, scale: 1.4, opacity: 1 }}
              animate={{ translateX: p.x, translateY: p.y, scale: 0, opacity: 0 }}
              transition={{ type: 'timing', duration: 750, delay: p.delay }}
              style={[
                styles.particle,
                { width: p.size, height: p.size, borderRadius: p.size / 2, backgroundColor: p.color },
              ]}
            />
          ))}

          {/* Monster bounces in */}
          <MotiView
            from={{ scale: 0.25, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 7, stiffness: 85, delay: 100 }}
          >
            <MonsterSvg size={190} />
          </MotiView>
        </View>

        {/* ── Level badge ────────────────────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, scale: 0.4, translateY: 16 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 130, delay: 380 }}
          style={styles.badge}
        >
          <Text style={styles.badgeText}>Niveau {newLevel}</Text>
        </MotiView>

        {/* ── Stage-up notice ────────────────────────────────────────────── */}
        {stageUp && (
          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 380, delay: 620 }}
            style={styles.stageWrap}
          >
            <Text style={styles.stageText}>
              Jouw Tasko is nu een {STAGE_LABELS[newStage] ?? newStage}! 🎉
            </Text>
          </MotiView>
        )}

        {/* ── Dismiss hint ───────────────────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 500, delay: 950 }}
          style={styles.dismissWrap}
        >
          <Text style={styles.dismissText}>Tik om door te gaan</Text>
        </MotiView>

      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    backgroundColor: 'rgba(8, 12, 24, 0.95)',
  },
  radialGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: PRIMARY,
  },

  headingWrap: { zIndex: 10, marginBottom: 4 },
  headingText: {
    fontSize: 46,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: 4,
    textShadowColor: 'rgba(78,205,196,0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
  },

  // Centre container — particles are absolute children
  stage: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  ring: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 2,
    borderColor: PRIMARY,
  },
  particle: {
    position: 'absolute',
    top: 110,   // vertical centre of stage
    left: 110,  // horizontal centre of stage
  },

  badge: {
    backgroundColor: 'rgba(78,205,196,0.12)',
    borderWidth: 2,
    borderColor: PRIMARY,
    borderRadius: 99,
    paddingHorizontal: 28,
    paddingVertical: 9,
    marginTop: 12,
    zIndex: 10,
  },
  badgeText: {
    fontSize: 22,
    fontWeight: '700',
    color: PRIMARY,
    letterSpacing: 0.5,
  },

  stageWrap: {
    marginTop: 16,
    paddingHorizontal: 32,
    zIndex: 10,
  },
  stageText: {
    fontSize: 16,
    color: '#f0ece8',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },

  dismissWrap: {
    position: 'absolute',
    bottom: 56,
    zIndex: 10,
  },
  dismissText: {
    fontSize: 13,
    color: 'rgba(240,236,232,0.45)',
    letterSpacing: 0.5,
  },
});
