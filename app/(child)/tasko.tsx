import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { MonsterSvg } from '@/components/ui/MonsterSvg';
import { CompanionView3D } from '@/components/ui/CompanionView3D';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@shopify/restyle';
import { fetchChildProfile } from '@/services/child-device';
import type { ChildProfile } from '@/services/child-device';
import { stageForLevel } from '@/utils/xp';
import type { AppTheme } from '@/constants/restyleTheme';
import { PRIMARY, SUCCESS, primaryAlpha } from '@/constants/palette';

const STAGES = [
  { stage: 'egg',   label: 'Ei',        minLevel: 1  },
  { stage: 'baby',  label: 'Baby',       minLevel: 2  },
  { stage: 'child', label: 'Kind',       minLevel: 4  },
  { stage: 'teen',  label: 'Teen',       minLevel: 7  },
  { stage: 'adult', label: 'Volwassen',  minLevel: 10 },
] as const;

export default function TaskoScreen() {
  const insets = useSafeAreaInsets();
  const { childId } = useAppStore();
  const { colors: c } = useTheme<AppTheme>();

  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!childId) { setLoading(false); return; }
    try {
      const p = await fetchChildProfile(childId);
      setProfile(p);
    } catch {
      // profile stays null, defaults shown
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const level        = profile?.level ?? 1;
  const xp           = profile?.xp ?? 0;
  const xpToNext     = profile?.xp_to_next_level ?? 100;
  const monsterName  = profile?.monster_name ?? 'Tasko';
  const xpLeft       = xpToNext - xp;
  const xpProgress   = xp / xpToNext;

  const currentStage      = stageForLevel(level);
  const currentStageIndex = STAGES.findIndex(s => s.stage === currentStage);
  const evolutionNodes    = STAGES.map((s, i) => ({
    unlocked: i <= currentStageIndex,
    current:  i === currentStageIndex,
    sublabel: i === currentStageIndex
      ? 'Jij nu'
      : i < currentStageIndex
        ? `${s.label} ✓`
        : `Lv${s.minLevel}`,
  }));

  if (loading) {
    return (
      <Box flex={1} backgroundColor="background" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={PRIMARY} />
      </Box>
    );
  }

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
          <Text style={[styles.title, { color: c.textPrimary }]}>Mijn Tasko</Text>
          <Text style={[styles.subtitle, { color: c.textMuted }]}>Kijk hoe ver jouw monster al is gekomen!</Text>
        </MotiView>

        {/* Monster — fills remaining vertical space */}
        <MotiView
          from={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 100, delay: 80 }}
          style={styles.monsterSection}
        >
          <View style={{ marginTop: 8 }}>
            <CompanionView3D size={200} />
          </View>
          <View style={[styles.nameRow, { marginTop: -40 }]}>
            <Text style={[styles.monsterName, { color: c.textPrimary }]}>{monsterName}</Text>
            <View style={[styles.levelBadge, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
              <Ionicons name="trophy-outline" size={12} color={PRIMARY} />
              <Text style={[styles.levelBadgeText, { color: c.textPrimary }]}>Niveau {level}</Text>
            </View>
          </View>
          <Text style={[styles.monsterSub, { color: c.textMuted }]}>Jouw beste vriend</Text>
        </MotiView>

        {/* Bottom section */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 180 }}
          style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom + 8, 16) }]}
        >
          {/* XP card */}
          <View style={[styles.card, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            <View style={styles.xpHeader}>
              <Text style={styles.cardLabel}>ENERGIE</Text>
              <Text style={[styles.xpFraction, { color: c.textMuted }]}>{xp} / {xpToNext} XP</Text>
            </View>
            <ProgressBar progress={xpProgress} color={SUCCESS} height={7} />
            <Text style={[styles.xpHint, { color: c.textMuted }]}>Nog {xpLeft} XP tot de volgende evolutie</Text>
          </View>

          {/* Evolution strip */}
          <View style={[styles.card, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}>
            <Text style={styles.cardLabel}>EVOLUTIEPAD</Text>
            <View style={styles.evolutionRow}>
              {evolutionNodes.flatMap((stage, i) => {
                const nodes = [];
                if (i > 0) nodes.push(<View key={`c${i}`} style={styles.connector} />);
                nodes.push(
                  <View key={i} style={styles.stageCol}>
                    <View style={[
                      styles.stageCircle,
                      stage.unlocked && styles.stageCircleUnlocked,
                      stage.current  && styles.stageCircleCurrent,
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
            style={[styles.wardrobeBtn, { backgroundColor: c.glassCard, borderColor: c.glassCardBorder }]}
            onPress={() => router.push('/(child)/wardrobe')}
            activeOpacity={0.8}
          >
            <View style={styles.wardrobeBtnLeft}>
              <View style={styles.wardrobeBtnIcon}>
                <Ionicons name="shirt-outline" size={20} color={PRIMARY} />
              </View>
              <View>
                <Text style={[styles.wardrobeBtnTitle, { color: c.textPrimary }]}>Garderobe</Text>
                <Text style={[styles.wardrobeBtnSub, { color: c.textMuted }]}>Pas je monster aan</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
          </TouchableOpacity>
        </MotiView>

      </View>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },

  header: { marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 2 },
  subtitle: { fontSize: 13 },

  monsterSection: {
    flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 32, gap: 2,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  monsterName: { fontSize: 22, fontWeight: '700' },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 99,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1,
  },
  levelBadgeText: { fontSize: 12, fontWeight: '500' },
  monsterSub: { fontSize: 13 },

  bottomSection: { gap: 10 },

  card: {
    borderRadius: 20, padding: 14,
    borderWidth: 1,
  },
  cardLabel: { fontSize: 10, fontWeight: '600', color: PRIMARY, letterSpacing: 0.8, marginBottom: 10 },

  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  xpFraction: { fontSize: 12 },
  xpHint: { fontSize: 12, marginTop: 8 },

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
  stageCircleCurrent: { borderColor: PRIMARY, borderWidth: 2.5 },
  connector: { flex: 1, height: 1.5, backgroundColor: primaryAlpha(0.18), marginBottom: 16 },
  stageSub: { fontSize: 9, color: '#8a8885', textAlign: 'center' },
  stageSubCurrent: { color: PRIMARY, fontWeight: '700' },

  wardrobeBtn: {
    borderRadius: 20, padding: 16,
    borderWidth: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  wardrobeBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  wardrobeBtnIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: primaryAlpha(0.08),
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: primaryAlpha(0.15),
  },
  wardrobeBtnTitle: { fontSize: 15, fontWeight: '600' },
  wardrobeBtnSub: { fontSize: 12, marginTop: 1 },
});
