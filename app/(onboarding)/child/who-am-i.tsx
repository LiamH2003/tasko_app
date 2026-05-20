import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import type { FamilyChild } from '@/services/child-device';

const STAGE_COLORS: Record<string, string> = {
  egg:   Colors.text.muted,
  baby:  Colors.primary,
  child: '#4a9e5c',
  teen:  '#e8743c',
  adult: '#9b6bff',
};

export default function WhoAmIScreen() {
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

  const color = (stage: string) => STAGE_COLORS[stage] ?? Colors.primary;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

      <TouchableOpacity style={styles.back} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={18} color={Colors.primary} />
        <Text style={styles.backText}>Terug</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Wie ben ik?</Text>

        {familyName ? (
          <View style={styles.familyChip}>
            <Text style={styles.familyChipText}>🏠 {familyName}</Text>
          </View>
        ) : null}

        <Text style={styles.subtitle}>Tik op jouw naam om in te loggen</Text>

        <View style={styles.list}>
          {children.map((child) => {
            const isLoading = loadingId === child.id;
            return (
              <TouchableOpacity
                key={child.id}
                style={styles.card}
                onPress={() => handleSelect(child)}
                disabled={loadingId !== null}
                activeOpacity={0.8}
              >
                <View style={[styles.avatar, { backgroundColor: color(child.stage) + '33' }]}>
                  <Text style={[styles.avatarEmoji, { color: color(child.stage) }]}>
                    {child.stage === 'egg' ? '🥚' : child.stage === 'adult' ? '🐉' : '👾'}
                  </Text>
                </View>

                <View style={styles.info}>
                  <Text style={styles.name}>{child.name}</Text>
                  <Text style={styles.meta}>Tasko-gebruiker</Text>
                  <View style={[styles.badge, { backgroundColor: color(child.stage) + '22' }]}>
                    <View style={[styles.badgeDot, { backgroundColor: color(child.stage) }]} />
                    <Text style={[styles.badgeText, { color: color(child.stage) }]}>
                      {child.monster_name} · Niveau {child.level}
                    </Text>
                  </View>
                </View>

                {isLoading
                  ? <ActivityIndicator color={Colors.primary} size="small" />
                  : <View style={styles.chevronWrap}>
                      <Ionicons name="chevron-forward" size={18} color={Colors.text.muted} />
                    </View>}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  backText: { fontSize: FontSize.md, color: Colors.primary },

  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },

  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: Spacing.sm },

  familyChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
  },
  familyChipText: { fontSize: FontSize.sm, color: Colors.text.secondary, fontWeight: FontWeight.medium },

  subtitle: { fontSize: FontSize.md, color: Colors.text.secondary, marginBottom: Spacing.xl },

  list: { gap: Spacing.md },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarEmoji: { fontSize: 26 },

  info: { flex: 1 },
  name: { fontSize: FontSize.xl, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  meta: { fontSize: FontSize.sm, color: Colors.text.muted, marginTop: 2 },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },

  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
