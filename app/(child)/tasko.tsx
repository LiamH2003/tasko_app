import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MonsterSvg } from '@/components/monster/MonsterSvg';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

const EVOLUTION = [
  { label: 'Blub', sublabel: '✓ Lv1', unlocked: true },
  { label: 'Blub', sublabel: '✓ Lv2', unlocked: true },
  { label: 'Blub', sublabel: '← jij nu', unlocked: true, current: true },
  { label: '???', sublabel: 'Lv5', unlocked: false },
  { label: '???', sublabel: 'Lv7+', unlocked: false },
];

const WARDROBE = [
  { id: 'w1', name: 'Gouden kroon', badge: 'Aan', badgeType: 'active' as const, equipped: true },
  { id: 'w2', name: 'Regenboogstaart', badge: 'Lv3 ✓', badgeType: 'unlocked' as const, equipped: false },
  { id: 'w3', name: 'Magische staf', badge: 'Lv5', badgeType: 'locked' as const, equipped: false },
  { id: 'w4', name: 'Hoge hoed', badge: 'Lv5', badgeType: 'locked' as const, equipped: false },
  { id: 'w5', name: 'Bliksemvleugels', badge: 'Lv6', badgeType: 'locked' as const, equipped: false },
  { id: 'w6', name: 'Maancape', badge: 'Lv7', badgeType: 'locked' as const, equipped: false },
];

const BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  active: { bg: Colors.primary, color: Colors.background },
  unlocked: { bg: Colors.status.success, color: '#fff' },
  locked: { bg: Colors.surface, color: Colors.text.muted },
};

const MOCK_MONSTER = { name: 'Blub', level: 4, xp: 620, xpToNextLevel: 1000 };

export default function TaskoScreen() {
  const { child } = useAppStore();
  const monster = child?.monster ?? MOCK_MONSTER;
  const [equippedId, setEquippedId] = useState('w1');
  const xpLeft = monster.xpToNextLevel - monster.xp;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Monster with crown */}
        <View style={styles.monsterSection}>
          <View style={styles.crownWrapper}>
            <Text style={styles.crown}>👑</Text>
          </View>
          <MonsterSvg size={160} />
        </View>

        {/* Name + badge */}
        <View style={styles.nameRow}>
          <Text style={styles.monsterName}>{monster.name}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Niveau {monster.level}</Text>
          </View>
        </View>
        <Text style={styles.monsterSub}>Tasko · jouw beste vriend</Text>

        {/* XP card */}
        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpTitle}>Energie naar niveau {monster.level + 1}</Text>
            <Text style={styles.xpFraction}>{monster.xp} / {monster.xpToNextLevel} XP</Text>
          </View>
          <ProgressBar progress={monster.xp / monster.xpToNextLevel} color={Colors.status.success} height={8} />
          <Text style={styles.xpHint}>Nog {xpLeft} XP tot de volgende evolutie! 🚀</Text>
        </View>

        {/* Evolution path */}
        <Text style={styles.sectionTitle}>Evolutiepad</Text>
        <View style={styles.evolutionRow}>
          {EVOLUTION.map((stage, i) => (
            <View key={i} style={styles.stageCol}>
              <View style={[
                styles.stageCircle,
                stage.unlocked && styles.stageCircleUnlocked,
                stage.current && styles.stageCircleCurrent,
              ]}>
                {stage.unlocked ? (
                  <MonsterSvg size={32} />
                ) : (
                  <Text style={styles.stageLock}>★</Text>
                )}
              </View>
              <Text style={[styles.stageLabel, stage.current && styles.stageLabelCurrent]}>{stage.label}</Text>
              <Text style={styles.stageSub}>{stage.sublabel}</Text>
              {i < EVOLUTION.length - 1 && <View style={styles.connector} />}
            </View>
          ))}
        </View>

        {/* Wardrobe */}
        <Text style={styles.sectionTitle}>Garderobe</Text>
        <View style={styles.wardrobeGrid}>
          {WARDROBE.map((item) => {
            const isActive = equippedId === item.id;
            const bs = BADGE_STYLE[item.badgeType];
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
                  <Ionicons name="lock-closed" size={18} color={Colors.text.muted} style={styles.lockIcon} />
                )}
                <Text style={[styles.wardrobeName, item.badgeType === 'locked' && styles.wardrobeNameLocked]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, alignItems: 'center' },

  // Monster
  monsterSection: { alignItems: 'center', marginBottom: Spacing.sm },
  crownWrapper: { position: 'absolute', top: -18, zIndex: 2 },
  crown: { fontSize: 32 },

  // Name
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  monsterName: { fontSize: 26, fontWeight: FontWeight.bold, color: Colors.text.primary },
  levelBadge: { backgroundColor: Colors.surface, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  levelBadgeText: { fontSize: FontSize.sm, color: Colors.text.primary, fontWeight: FontWeight.medium },
  monsterSub: { fontSize: FontSize.sm, color: Colors.text.muted, marginBottom: Spacing.lg },

  // XP card
  xpCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, width: '100%', marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  xpTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text.primary },
  xpFraction: { fontSize: FontSize.sm, color: Colors.text.muted },
  xpHint: { fontSize: FontSize.xs, color: Colors.primary, marginTop: Spacing.sm },

  // Section
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary, alignSelf: 'flex-start', marginBottom: Spacing.sm },

  // Evolution
  evolutionRow: { flexDirection: 'row', alignItems: 'flex-start', width: '100%', marginBottom: Spacing.lg, position: 'relative' },
  stageCol: { flex: 1, alignItems: 'center', position: 'relative' },
  stageCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  stageCircleUnlocked: { borderColor: Colors.primary },
  stageCircleCurrent: { borderColor: Colors.primary, borderWidth: 2.5, width: 52, height: 52, borderRadius: 26 },
  stageLock: { fontSize: 18, color: Colors.text.muted },
  stageLabel: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 4, textAlign: 'center' },
  stageLabelCurrent: { color: Colors.primary, fontWeight: FontWeight.semibold },
  stageSub: { fontSize: 9, color: Colors.text.muted, textAlign: 'center' },
  connector: { position: 'absolute', top: 22, right: -8, width: 16, height: 1.5, backgroundColor: Colors.border },

  // Wardrobe
  wardrobeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, width: '100%', marginBottom: Spacing.sm },
  wardrobeCard: {
    width: '31%', aspectRatio: 1, backgroundColor: Colors.surface,
    borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.sm,
  },
  wardrobeCardActive: { borderColor: Colors.primary, backgroundColor: Colors.cardTint },
  wardrobeBadge: { position: 'absolute', top: 6, right: 6, borderRadius: Radius.sm, paddingHorizontal: 5, paddingVertical: 2 },
  wardrobeBadgeText: { fontSize: 9, fontWeight: FontWeight.bold },
  lockIcon: { marginBottom: 4 },
  wardrobeName: { fontSize: FontSize.xs, color: Colors.text.primary, textAlign: 'center', fontWeight: FontWeight.medium },
  wardrobeNameLocked: { color: Colors.text.muted },
});
