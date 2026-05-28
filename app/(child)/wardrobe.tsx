import { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { BackButton } from '@/components/ui/BackButton';
import { PRIMARY, primaryAlpha } from '@/constants/palette';
import { useTheme } from '@shopify/restyle';
import type { AppTheme } from '@/constants/restyleTheme';

const WARDROBE = [
  { id: 'w1', name: 'Gouden kroon',    badge: 'Aan',    badgeType: 'active'   as const },
  { id: 'w2', name: 'Regenboogstaart', badge: 'Lv3 ✓', badgeType: 'unlocked' as const },
  { id: 'w3', name: 'Magische staf',   badge: 'Lv5',    badgeType: 'locked'   as const },
  { id: 'w4', name: 'Hoge hoed',       badge: 'Lv5',    badgeType: 'locked'   as const },
  { id: 'w5', name: 'Bliksemvleugels', badge: 'Lv6',    badgeType: 'locked'   as const },
  { id: 'w6', name: 'Maancape',        badge: 'Lv7',    badgeType: 'locked'   as const },
];

const BADGE_COLORS = {
  active:   { bg: PRIMARY,                   color: '#fff'    },
  unlocked: { bg: '#48bb78',                 color: '#fff'    },
  locked:   { bg: 'rgba(255,255,255,0.7)',   color: '#8a8885' },
};

export default function WardrobeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme<AppTheme>();
  const [equippedId, setEquippedId] = useState('w1');

  return (
    <Box flex={1} backgroundColor="background">

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <AnimatedBlob
          size={280} color={primaryAlpha(0.13)}
          duration={3500} opacityFrom={0.65} opacityTo={1} scaleTarget={1.12}
          style={{ top: -50, right: -60 }}
        />
        <AnimatedBlob
          size={150} color={primaryAlpha(0.08)}
          duration={2700} delay={600} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07}
          style={{ bottom: 100, left: -50 }}
        />
      </View>

      <Box style={{ height: insets.top + 8 }} />
      <BackButton onPress={() => router.push('/(child)/tasko')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 40 }}
          style={styles.header}
        >
          <Text style={[styles.title, { color: colors.textPrimary }]}>Garderobe</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Pas je monster aan met items die je hebt verdiend.</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 100 }}
        >
          <View style={styles.grid}>
            {WARDROBE.map((item) => {
              const isEquipped = equippedId === item.id;
              const bs = BADGE_COLORS[item.badgeType];
              const locked = item.badgeType === 'locked';
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.card, isEquipped && styles.cardEquipped, locked && styles.cardLocked]}
                  onPress={() => !locked && setEquippedId(item.id)}
                  activeOpacity={locked ? 1 : 0.8}
                >
                  <View style={[styles.badge, { backgroundColor: bs.bg }]}>
                    <Text style={[styles.badgeText, { color: bs.color }]}>{item.badge}</Text>
                  </View>
                  <View style={[styles.iconArea, isEquipped && styles.iconAreaEquipped]}>
                    {locked
                      ? <Ionicons name="lock-closed" size={26} color="#c8c4bc" />
                      : <Ionicons name="shirt-outline" size={26} color={isEquipped ? PRIMARY : '#8a8885'} />}
                  </View>
                  <Text style={[styles.itemName, locked && styles.itemNameLocked]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </MotiView>

        <View style={{ height: Math.max(insets.bottom + 16, 24) }} />
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 4 },

  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1918', marginBottom: 2 },
  subtitle: { fontSize: 13, color: '#8a8885' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  card: {
    width: '47%', aspectRatio: 0.85,
    backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 20, padding: 14,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  cardEquipped: { borderColor: PRIMARY, backgroundColor: primaryAlpha(0.05) },
  cardLocked: { opacity: 0.7 },

  badge: {
    position: 'absolute', top: 10, right: 10,
    borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
  },
  badgeText: { fontSize: 10, fontWeight: '700' },

  iconArea: {
    width: 58, height: 58, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: primaryAlpha(0.15),
  },
  iconAreaEquipped: { borderColor: PRIMARY, backgroundColor: primaryAlpha(0.08) },

  itemName: { fontSize: 12, color: '#1a1918', textAlign: 'center', fontWeight: '600' },
  itemNameLocked: { color: '#b0ada8' },
});
