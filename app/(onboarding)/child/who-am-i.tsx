import { View, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { BackButton } from '@/components/ui/BackButton';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PRIMARY, primaryAlpha } from '@/constants/palette';
import type { FamilyChild } from '@/services/child-device';

const STAGE_COLORS: Record<string, string> = {
  egg:   '#8a8885',
  baby:  PRIMARY,
  child: '#4a9e5c',
  teen:  '#e8743c',
  adult: '#9b6bff',
};

export default function WhoAmIScreen() {
  const insets = useSafeAreaInsets();
  const { familyName, children: childrenJson } = useLocalSearchParams<{
    familyName: string;
    children: string;
  }>();
  const { setChildId } = useAppStore();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const children: FamilyChild[] = childrenJson ? JSON.parse(childrenJson) : [];

  const handleSelect = async (child: FamilyChild) => {
    setLoadingId(child.id);
    try {
      await setChildId(child.id);
      await SecureStore.deleteItemAsync('pendingChildId');
      router.replace('/(child)');
    } catch {
      setLoadingId(null);
    }
  };

  const stageColor = (stage: string) => STAGE_COLORS[stage] ?? PRIMARY;

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
          style={{ bottom: 100, right: -50 }}
        />
      </View>

      <Box style={{ height: insets.top + 16 }} />
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" paddingRight="lg">
        <BackButton />
        {familyName ? (
          <View style={styles.familyChip}>
            <Text style={styles.familyChipText}>🏠 {familyName}</Text>
          </View>
        ) : null}
      </Box>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 340, delay: 60 }}
          style={{ marginTop: 24, marginBottom: 20 }}
        >
          <Text variant="title" marginBottom="xs">Wie ben ik?</Text>
          <Text variant="subtitle">Tik op jouw naam om in te loggen</Text>
        </MotiView>

        <Box gap="sm">
          {children.map((child, idx) => {
            const isLoading = loadingId === child.id;
            const color = stageColor(child.stage);
            return (
              <MotiView
                key={child.id}
                from={{ opacity: 0, translateY: 16 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 320, delay: 120 + idx * 60 }}
              >
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleSelect(child)}
                  disabled={loadingId !== null}
                  activeOpacity={0.8}
                >
                  <View style={[styles.avatar, { backgroundColor: color + '33' }]}>
                    <Text style={[styles.avatarEmoji]}>
                      {child.stage === 'egg' ? '🥚' : child.stage === 'adult' ? '🐉' : '👾'}
                    </Text>
                  </View>

                  <View style={styles.info}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childMeta}>Tasko-gebruiker</Text>
                    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
                      <View style={[styles.badgeDot, { backgroundColor: color }]} />
                      <Text style={[styles.badgeText, { color }]}>
                        {child.monster_name} · Niveau {child.level}
                      </Text>
                    </View>
                  </View>

                  {isLoading
                    ? <ActivityIndicator color={PRIMARY} size="small" />
                    : <View style={styles.chevronWrap}>
                        <Ionicons name="chevron-forward" size={18} color="#8a8885" />
                      </View>}
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </Box>
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  familyChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 99,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14, paddingVertical: 5,
    marginBottom: 12,
  },
  familyChipText: { fontSize: 13, color: '#4a4845', fontWeight: '500' },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    padding: 16,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarEmoji: { fontSize: 26 },
  info: { flex: 1 },
  childName: { fontSize: 17, fontWeight: '600', color: '#1a1918' },
  childMeta: { fontSize: 12, color: '#8a8885', marginTop: 2 },
  badge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3,
    marginTop: 8, gap: 5,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  chevronWrap: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: primaryAlpha(0.08),
    alignItems: 'center', justifyContent: 'center',
  },
});
