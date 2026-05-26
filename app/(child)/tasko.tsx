import { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { MonsterSvg } from '@/components/monster/MonsterSvg';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { useAppStore } from '@/store/useAppStore';
import { PRIMARY, primaryAlpha } from '@/constants/palette';

const EVOLUTION = [
  { label: 'Blub', sublabel: '✓ Lv1', unlocked: true },
  { label: 'Blub', sublabel: '✓ Lv2', unlocked: true },
  { label: 'Blub', sublabel: '← jij nu', unlocked: true, current: true },
  { label: '???',  sublabel: 'Lv5',    unlocked: false },
  { label: '???',  sublabel: 'Lv7+',   unlocked: false },
];

const WARDROBE = [
  { id: 'w1', name: 'Gouden kroon',     badge: 'Aan',      badgeType: 'active'   as const, equipped: true },
  { id: 'w2', name: 'Regenboogstaart',  badge: 'Lv3 ✓',   badgeType: 'unlocked' as const, equipped: false },
  { id: 'w3', name: 'Magische staf',    badge: 'Lv5',      badgeType: 'locked'   as const, equipped: false },
  { id: 'w4', name: 'Hoge hoed',        badge: 'Lv5',      badgeType: 'locked'   as const, equipped: false },
  { id: 'w5', name: 'Bliksemvleugels',  badge: 'Lv6',      badgeType: 'locked'   as const, equipped: false },
  { id: 'w6', name: 'Maancape',         badge: 'Lv7',      badgeType: 'locked'   as const, equipped: false },
];

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  active:   { bg: PRIMARY,     color: '#fff' },
  unlocked: { bg: '#48bb78',   color: '#fff' },
  locked:   { bg: 'rgba(255,255,255,0.7)', color: '#8a8885' },
};

const MOCK_MONSTER = { name: 'Blub', level: 4, xp: 620, xpToNextLevel: 1000 };

export default function TaskoScreen() {
  const insets = useSafeAreaInsets();
  const { child } = useAppStore();
  const monster = child?.monster ?? MOCK_MONSTER;
  const [equippedId, setEquippedId] = useState('w1');
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

      <Box style={{ height: insets.top + 8 }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Monster */}
        <MotiView
          from={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 100 }}
          style={styles.monsterSection}
        >
          <View style={styles.crownWrapper}>
            <Text style={styles.crown}>👑</Text>
          </View>
          <MonsterSvg size={160} />
        </MotiView>

        {/* Name */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 100 }}
          style={{ alignItems: 'center', marginBottom: 4 }}
        >
          <View style={styles.nameRow}>
            <Text style={styles.monsterName}>{monster.name}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Niveau {monster.level}</Text>
            </View>
          </View>
          <Text style={styles.monsterSub}>Tasko · jouw beste vriend</Text>
        </MotiView>

        {/* XP card */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 160 }}
        >
          <View style={styles.card}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpTitle}>Energie naar niveau {monster.level + 1}</Text>
              <Text style={styles.xpFraction}>{monster.xp} / {monster.xpToNextLevel} XP</Text>
            </View>
            <ProgressBar progress={monster.xp / monster.xpToNextLevel} color='#48bb78' height={8} />
            <Text style={styles.xpHint}>Nog {xpLeft} XP tot de volgende evolutie! 🚀</Text>
          </View>
        </MotiView>

        {/* Evolution */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 200 }}
        >
          <Text style={styles.sectionTitle}>Evolutiepad</Text>
          <View style={styles.card}>
            <View style={styles.evolutionRow}>
              {EVOLUTION.map((stage, i) => (
                <View key={i} style={styles.stageCol}>
                  <View style={[
                    styles.stageCircle,
                    stage.unlocked && styles.stageCircleUnlocked,
                    stage.current && styles.stageCircleCurrent,
                  ]}>
                    {stage.unlocked
                      ? <MonsterSvg size={32} />
                      : <Text style={styles.stageLock}>★</Text>}
                  </View>
                  <Text style={[styles.stageLabel, stage.current && { color: PRIMARY, fontWeight: '600' }]}>
                    {stage.label}
                  </Text>
                  <Text style={styles.stageSub}>{stage.sublabel}</Text>
                  {i < EVOLUTION.length - 1 && <View style={styles.connector} />}
                </View>
              ))}
            </View>
          </View>
        </MotiView>

        {/* Wardrobe */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 240 }}
        >
          <Text style={styles.sectionTitle}>Garderobe</Text>
          <View style={styles.wardrobeGrid}>
            {WARDROBE.map((item) => {
              const isActive = equippedId === item.id;
              const bs = BADGE_COLORS[item.badgeType];
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.wardrobeCard, isActive && styles.wardrobeCardActive]}
                  onPress={() => item.badgeType !== 'locked' && setEquippedId(item.id)}
                  activeOpacity={item.badgeType === 'locked' ? 1 : 0.8}
                >
                  <View style={[styles.wardrobeBadge, { backgroundColor: bs.bg }]}>
                    <Text style={[styles.wardrobeBadgeText, { color: bs.color }]}>{item.badge}</Text>
                  </View>
                  {item.badgeType === 'locked' && (
                    <Ionicons name="lock-closed" size={18} color="#8a8885" style={styles.lockIcon} />
                  )}
                  <Text style={[styles.wardrobeName, item.badgeType === 'locked' && { color: '#8a8885' }]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </MotiView>

        <View style={{ height: 24 }} />
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 8, alignItems: 'center' },

  monsterSection: { alignItems: 'center', marginBottom: 8 },
  crownWrapper: { position: 'absolute', top: -18, zIndex: 2 },
  crown: { fontSize: 32 },

  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  monsterName: { fontSize: 26, fontWeight: '700', color: '#1a1918' },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  levelBadgeText: { fontSize: 13, color: '#1a1918', fontWeight: '500' },
  monsterSub: { fontSize: 13, color: '#8a8885', marginBottom: 20 },

  card: {
    backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 20, padding: 18,
    width: '100%', marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  xpTitle: { fontSize: 14, fontWeight: '700', color: '#1a1918' },
  xpFraction: { fontSize: 13, color: '#8a8885' },
  xpHint: { fontSize: 12, color: PRIMARY, marginTop: 10 },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1a1918', alignSelf: 'flex-start', marginBottom: 10 },

  evolutionRow: { flexDirection: 'row', alignItems: 'flex-start', width: '100%', position: 'relative' },
  stageCol: { flex: 1, alignItems: 'center', position: 'relative' },
  stageCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1.5, borderColor: primaryAlpha(0.25),
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  stageCircleUnlocked: { borderColor: PRIMARY },
  stageCircleCurrent: { borderColor: PRIMARY, borderWidth: 2.5, width: 52, height: 52, borderRadius: 26 },
  stageLock: { fontSize: 18, color: '#8a8885' },
  stageLabel: { fontSize: 11, color: '#8a8885', marginTop: 4, textAlign: 'center' },
  stageSub: { fontSize: 9, color: '#8a8885', textAlign: 'center' },
  connector: { position: 'absolute', top: 22, right: -8, width: 16, height: 1.5, backgroundColor: primaryAlpha(0.2) },

  wardrobeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%', marginBottom: 8 },
  wardrobeCard: {
    width: '31%', aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)', padding: 10,
  },
  wardrobeCardActive: { borderColor: PRIMARY, backgroundColor: primaryAlpha(0.06) },
  wardrobeBadge: { position: 'absolute', top: 6, right: 6, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  wardrobeBadgeText: { fontSize: 9, fontWeight: '700' },
  lockIcon: { marginBottom: 4 },
  wardrobeName: { fontSize: 11, color: '#1a1918', textAlign: 'center', fontWeight: '500' },
});
