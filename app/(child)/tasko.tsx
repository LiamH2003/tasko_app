import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { MonsterSvg } from '@/components/monster/MonsterSvg';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { useAppStore } from '@/store/useAppStore';
import { PRIMARY, primaryAlpha } from '@/constants/palette';

const EVOLUTION = [
  { sublabel: 'Lv1 ✓', unlocked: true,  current: false },
  { sublabel: 'Lv2 ✓', unlocked: true,  current: false },
  { sublabel: 'Jij nu', unlocked: true,  current: true  },
  { sublabel: 'Lv5',    unlocked: false, current: false },
  { sublabel: 'Lv7+',   unlocked: false, current: false },
];

const MOCK_MONSTER = { name: 'Blub', level: 4, xp: 620, xpToNextLevel: 1000 };

export default function TaskoScreen() {
  const insets = useSafeAreaInsets();
  const { child } = useAppStore();
  const monster = child?.monster ?? MOCK_MONSTER;
  const xpLeft = monster.xpToNextLevel - monster.xp;

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
          style={{ bottom: 120, right: -50 }}
        />
      </View>

      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>

        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 40 }}
          style={styles.header}
        >
          <Text style={styles.title}>Mijn Tasko</Text>
          <Text style={styles.subtitle}>Kijk hoe ver jouw monster al is gekomen!</Text>
        </MotiView>

        {/* Monster — fills remaining vertical space */}
        <MotiView
          from={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 100, delay: 80 }}
          style={styles.monsterSection}
        >
          <MonsterSvg size={150} />
          <View style={styles.nameRow}>
            <Text style={styles.monsterName}>{monster.name}</Text>
            <View style={styles.levelBadge}>
              <Ionicons name="trophy-outline" size={12} color={PRIMARY} />
              <Text style={styles.levelBadgeText}>Niveau {monster.level}</Text>
            </View>
          </View>
          <Text style={styles.monsterSub}>Jouw beste vriend</Text>
        </MotiView>

        {/* Bottom section */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 180 }}
          style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom + 8, 16) }]}
        >
          {/* XP card */}
          <View style={styles.card}>
            <View style={styles.xpHeader}>
              <Text style={styles.cardLabel}>ENERGIE</Text>
              <Text style={styles.xpFraction}>{monster.xp} / {monster.xpToNextLevel} XP</Text>
            </View>
            <ProgressBar progress={monster.xp / monster.xpToNextLevel} color="#48bb78" height={7} />
            <Text style={styles.xpHint}>Nog {xpLeft} XP tot de volgende evolutie</Text>
          </View>

          {/* Evolution strip */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>EVOLUTIEPAD</Text>
            <View style={styles.evolutionRow}>
              {EVOLUTION.flatMap((stage, i) => {
                const nodes = [];
                if (i > 0) nodes.push(<View key={`c${i}`} style={styles.connector} />);
                nodes.push(
                  <View key={i} style={styles.stageCol}>
                    <View style={[
                      styles.stageCircle,
                      stage.unlocked && styles.stageCircleUnlocked,
                      stage.current && styles.stageCircleCurrent,
                    ]}>
                      {stage.unlocked
                        ? <MonsterSvg size={24} />
                        : <Ionicons name="lock-closed" size={13} color="#c8c4bc" />}
                    </View>
                    <Text style={[styles.stageSub, stage.current && styles.stageSubCurrent]}>
                      {stage.sublabel}
                    </Text>
                  </View>
                );
                return nodes;
              })}
            </View>
          </View>

          {/* Wardrobe nav button */}
          <TouchableOpacity
            style={styles.wardrobeBtn}
            onPress={() => router.push('/(child)/wardrobe')}
            activeOpacity={0.8}
          >
            <View style={styles.wardrobeBtnLeft}>
              <View style={styles.wardrobeBtnIcon}>
                <Ionicons name="shirt-outline" size={20} color={PRIMARY} />
              </View>
              <View>
                <Text style={styles.wardrobeBtnTitle}>Garderobe</Text>
                <Text style={styles.wardrobeBtnSub}>Pas je monster aan</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8a8885" />
          </TouchableOpacity>
        </MotiView>

      </View>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },

  header: { marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1918', marginBottom: 2 },
  subtitle: { fontSize: 13, color: '#8a8885' },

  monsterSection: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  monsterName: { fontSize: 22, fontWeight: '700', color: '#1a1918' },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 99,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  levelBadgeText: { fontSize: 12, color: '#1a1918', fontWeight: '500' },
  monsterSub: { fontSize: 13, color: '#8a8885' },

  bottomSection: { gap: 10 },

  card: {
    backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 20, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  cardLabel: { fontSize: 10, fontWeight: '600', color: PRIMARY, letterSpacing: 0.8, marginBottom: 10 },

  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  xpFraction: { fontSize: 12, color: '#8a8885' },
  xpHint: { fontSize: 12, color: '#8a8885', marginTop: 8 },

  evolutionRow: { flexDirection: 'row', alignItems: 'center' },
  stageCol: { alignItems: 'center' },
  stageCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: primaryAlpha(0.04),
    borderWidth: 1.5, borderColor: primaryAlpha(0.18),
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    marginBottom: 4,
  },
  stageCircleUnlocked: { borderColor: PRIMARY, backgroundColor: primaryAlpha(0.06) },
  stageCircleCurrent: { borderColor: PRIMARY, borderWidth: 2.5, width: 46, height: 46, borderRadius: 23 },
  connector: { flex: 1, height: 1.5, backgroundColor: primaryAlpha(0.18), marginBottom: 16 },
  stageSub: { fontSize: 9, color: '#8a8885', textAlign: 'center' },
  stageSubCurrent: { color: PRIMARY, fontWeight: '700' },

  wardrobeBtn: {
    backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  wardrobeBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  wardrobeBtnIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: primaryAlpha(0.08),
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: primaryAlpha(0.15),
  },
  wardrobeBtnTitle: { fontSize: 15, fontWeight: '600', color: '#1a1918' },
  wardrobeBtnSub: { fontSize: 12, color: '#8a8885', marginTop: 1 },
});
